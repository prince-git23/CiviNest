import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { CivicSignal } from '../models/CivicSignal.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { processSignal, getSignalById, analyzeSignalInput } from '../services/signal.service.js';
import { getWardMetrics } from '../services/wardMetrics.service.js';
import { getTrends, getTrendById } from '../services/trend.service.js';
import {
  listDiscussions,
  getDiscussionView,
  createDiscussion,
  addDiscussionMessage,
  confirmDiscussion,
  validateDiscussionInput,
} from '../services/discussion.service.js';

const router = Router();

// All resident routes require CITIZEN role
router.use(authenticate, requireRole(ROLES.CITIZEN));

// ── Dashboard ──
// GET /api/resident/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    const [recentReports, nearbyClusters, mySignals] = await Promise.all([
      Report.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      CivicCluster.find({
        status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'] },
        city: user.city || 'Nagpur',
      })
        .sort({ 'priority.score': -1 })
        .limit(10)
        .lean(),
      CivicSignal.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const impactScore = user.locality ? 100 + recentReports.length * 25 : 0;

    sendSuccess(res, {
      user: user.toSafeObject(),
      dashboard: {
        locality: user.locality || 'Dharampeth',
        ward: user.ward || 'Ward 14',
        city: user.city || 'Nagpur',
        impactScore,
        reportsSubmitted: recentReports.length,
        verifiedSignals: mySignals.filter((s) => s.status === 'CLUSTERED').length,
        recentReports,
        nearbyClusters,
        recentSignals: mySignals,
        aiInsight: await buildInsight(user),
      },
    });
  } catch {
    sendError(res, 'Failed to load dashboard.', 500);
  }
});

// ── Map issues ──
// GET /api/resident/map/issues — public civic issue points (no private fields)
router.get('/map/issues', async (req: AuthRequest, res: Response) => {
  try {
    const { ward, category, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (ward) filter['location.ward'] = ward;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const issues = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .select('title category status priority location.latitude location.longitude location.ward location.locality reportNumber analysis.confidence analysis.category createdAt')
      .lean();

    sendSuccess(res, {
      issues: issues.map((r) => ({
        id: r._id,
        reportNumber: r.reportNumber,
        title: r.title,
        category: r.category,
        status: r.status,
        priority: r.priority,
        latitude: r.location?.latitude,
        longitude: r.location?.longitude,
        ward: r.location?.ward,
        locality: r.location?.ward,
        confidence: (r.analysis as any)?.confidence ?? undefined,
        createdAt: r.createdAt,
      })),
    });
  } catch {
    sendError(res, 'Failed to load map issues.', 500);
  }
});

// ── Map clusters ──
// GET /api/resident/map/clusters
router.get('/map/clusters', async (req: AuthRequest, res: Response) => {
  try {
    const { ward, category, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (ward) filter.ward = ward;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const clusters = await CivicCluster.find(filter)
      .sort({ 'priority.score': -1 })
      .limit(100)
      .lean();

    sendSuccess(res, {
      clusters: clusters.map((c) => ({
        id: c._id,
        clusterCode: c.clusterCode,
        title: c.title,
        category: c.category,
        severity: c.severity,
        priority: c.priority,
        center: c.center,
        ward: c.ward,
        locality: c.locality,
        status: c.status,
        reportCount: c.reportCount,
        confirmationCount: c.confirmationCount,
      })),
    });
  } catch {
    sendError(res, 'Failed to load map clusters.', 500);
  }
});

// GET /api/resident/map/clusters/:id — single cluster detail for map focus
router.get('/map/clusters/:id', async (req: AuthRequest, res: Response) => {
  try {
    const cluster = await CivicCluster.findById(req.params.id).lean();
    if (!cluster) {
      sendError(res, 'Cluster not found.', 404);
      return;
    }

    const signals = await CivicSignal.find({ _id: { $in: cluster.signalIds } })
      .select('userId rawText createdAt')
      .limit(20)
      .lean();

    sendSuccess(res, {
      cluster: {
        id: cluster._id,
        clusterCode: cluster.clusterCode,
        title: cluster.title,
        category: cluster.category,
        severity: cluster.severity,
        priority: cluster.priority,
        center: cluster.center,
        ward: cluster.ward,
        locality: cluster.locality,
        status: cluster.status,
        reportCount: cluster.reportCount,
        confirmationCount: cluster.confirmationCount,
        description: cluster.description,
        keywords: cluster.keywords,
        recentSignals: signals.map((s) => ({
          id: s._id,
          text: s.rawText.slice(0, 140),
          createdAt: s.createdAt,
        })),
      },
    });
  } catch {
    sendError(res, 'Failed to load cluster.', 500);
  }
});

// GET /api/resident/map/nearby — issues/clusters within a geographic radius
router.get('/map/nearby', async (req: AuthRequest, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string, 10) || 500;
    const { category, status } = req.query;

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      sendError(res, 'Valid latitude and longitude are required.', 400);
      return;
    }
    if (radius < 10 || radius > 10000) {
      sendError(res, 'Radius must be between 10 and 10000 meters.', 400);
      return;
    }

    const filter: Record<string, unknown> = {
      locationPoint: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const issues = await Report.find(filter)
      .limit(20)
      .select('title category status priority location.latitude location.longitude location.ward location.locality location.address reportNumber createdAt')
      .lean();

    sendSuccess(res, {
      issues: issues.map((r) => ({
        id: r._id,
        reportNumber: r.reportNumber,
        title: r.title,
        category: r.category,
        status: r.status,
        priority: r.priority,
        latitude: r.location?.latitude,
        longitude: r.location?.longitude,
        ward: r.location?.ward,
        locality: r.location?.ward,
        address: r.location?.address,
        createdAt: r.createdAt,
        distanceMeters: distanceMeters(lat, lng, r.location?.latitude, r.location?.longitude),
      })),
      count: issues.length,
    });
  } catch {
    sendError(res, 'Failed to load nearby issues.', 500);
  }
});

// GET /api/resident/map/wards — ward list for filters (public info only)
router.get('/map/wards', async (req: AuthRequest, res: Response) => {
  try {
    const wards = await CivicCluster.distinct('ward', { ward: { $ne: '' } });
    const list = wards.length
      ? wards.map((w) => ({ name: w as string }))
      : DEFAULT_WARDS.map((w) => ({ name: w }));
    sendSuccess(res, { wards: list });
  } catch {
    sendError(res, 'Failed to load wards.', 500);
  }
});

// GET /api/resident/map/localities — locality list for filters (public info only)
router.get('/map/localities', async (req: AuthRequest, res: Response) => {
  try {
    const localities = await CivicCluster.distinct('locality', { locality: { $ne: '' } });
    const list = localities.length
      ? localities.map((l) => ({ name: l as string }))
      : DEFAULT_LOCALITIES.map((l) => ({ name: l }));
    sendSuccess(res, { localities: list });
  } catch {
    sendError(res, 'Failed to load localities.', 500);
  }
});

// ── Ward sensor metrics ──
// GET /api/resident/ward/metrics
router.get('/ward/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    // Use the authenticated user's own ward/city — never trust arbitrary query
    // params to change the resident's context.
    const metrics = await getWardMetrics({
      city: user.city,
      ward: user.ward,
      locality: user.locality,
    });
    sendSuccess(res, { metrics });
  } catch {
    sendError(res, 'Failed to load ward metrics.', 500);
  }
});

// ── Insights ──
// GET /api/resident/insights
router.get('/insights', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    const insight = await buildInsight(user);
    sendSuccess(res, { insights: [insight] });
  } catch {
    sendError(res, 'Failed to load insights.', 500);
  }
});

// ── Issue detail (sanitized public view) ──
// GET /api/resident/issues/:id
router.get('/issues/:id', async (req: AuthRequest, res: Response) => {
  try {
    const issue = await Report.findById(req.params.id)
      .select('title category status priority location.latitude location.longitude location.ward location.locality reportNumber analysis.confidence createdAt')
      .lean();
    if (!issue) {
      sendError(res, 'Issue not found.', 404);
      return;
    }
    sendSuccess(res, {
      issue: {
        id: issue._id,
        reportNumber: issue.reportNumber,
        title: issue.title,
        category: issue.category,
        status: issue.status,
        priority: issue.priority,
        latitude: (issue.location as any)?.latitude,
        longitude: (issue.location as any)?.longitude,
        ward: (issue.location as any)?.ward,
        locality: (issue.location as any)?.locality,
        confidence: (issue.analysis as any)?.confidence ?? undefined,
        createdAt: issue.createdAt,
      },
    });
  } catch {
    sendError(res, 'Failed to load issue.', 500);
  }
});

// ── Trends ──
// GET /api/resident/trends — emerging trends derived from civic clusters
router.get('/trends', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    const trends = await getTrends({ city: user.city, ward: user.ward });
    sendSuccess(res, { trends });
  } catch {
    sendError(res, 'Failed to load trends.', 500);
  }
});

// GET /api/resident/trends/:id — single trend / cluster detail
router.get('/trends/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    const trend = await getTrendById(req.params.id, { city: user.city, ward: user.ward });
    if (!trend) {
      sendError(res, 'Trend not found.', 404);
      return;
    }
    sendSuccess(res, { trend });
  } catch {
    sendError(res, 'Failed to load trend.', 500);
  }
});

// ── Signal intake ──
// POST /api/resident/signals/analyze — AI preview WITHOUT persisting a signal.
// Returns the classification + nearby existing issues so the resident can
// review the interpretation before confirming submission.
router.post('/signals/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const { rawText, location } = req.body;

    if (!rawText || rawText.trim().length < 5) {
      sendError(res, 'Signal text must be at least 5 characters.', 400);
      return;
    }

    const locErr = validateSignalLocation(location);
    if (locErr) {
      sendError(res, locErr, 400);
      return;
    }

    const analysis = await analyzeSignalInput({ rawText, location });

    // Nearby existing issues (geographic radius, never text-only matching)
    const nearby = await findNearbyReportPoints(location, 500);

    sendSuccess(res, {
      analysis: {
        category: analysis.classification.category,
        categoryLabel: analysis.classification.categoryLabel,
        subcategory: analysis.classification.subcategory,
        severity: analysis.classification.severity,
        urgency: analysis.classification.urgency,
        affectedService: analysis.classification.affectedService,
        publicSafety: analysis.classification.publicSafety,
        keywords: analysis.classification.keywords,
        reasoning: analysis.classification.reasoning,
        confidence: analysis.classification.confidence,
        confidenceSource: analysis.classification.confidenceSource,
        aiAnalysisStatus: analysis.aiAnalysisStatus,
        priority: analysis.priority,
        piiRedacted: analysis.piiRedacted,
        piiDetected: analysis.piiDetected,
      },
      nearby,
    }, 'Signal analyzed.', 200);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to analyze signal.', 500);
  }
});

// POST /api/resident/signals
router.post('/signals', async (req: AuthRequest, res: Response) => {
  try {
    const { rawText, location } = req.body;

    if (!rawText || rawText.trim().length < 5) {
      sendError(res, 'Signal text must be at least 5 characters.', 400);
      return;
    }

    const locErr = validateSignalLocation(location);
    if (locErr) {
      sendError(res, locErr, 400);
      return;
    }

    const result = await processSignal(req.user!.userId, { rawText, location });
    sendSuccess(res, result, 'Signal processed successfully.', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to process signal.', 500);
  }
});

// GET /api/resident/signals/:id
router.get('/signals/:id', async (req: AuthRequest, res: Response) => {
  try {
    const signal = await getSignalById(req.user!.userId, req.params.id);
    if (!signal) {
      sendError(res, 'Signal not found.', 404);
      return;
    }
    sendSuccess(res, { signal });
  } catch {
    sendError(res, 'Failed to load signal.', 500);
  }
});

// ── Discussions ──
// GET /api/resident/discussions — community discussion list with search,
// status/ward/category filters, pagination, and live facet counts.
router.get('/discussions', async (req: AuthRequest, res: Response) => {
  try {
    const result = await listDiscussions(req.user!.userId, {
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      ward: typeof req.query.ward === 'string' ? req.query.ward : undefined,
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      sort: req.query.sort === 'supported' ? 'supported' : 'latest',
    });
    sendSuccess(res, result);
  } catch {
    sendError(res, 'Failed to load discussions.', 500);
  }
});

// POST /api/resident/discussions — create a community discussion.
// Author identity is ALWAYS derived from the authenticated session; any
// client-supplied author fields are ignored.
router.post('/discussions', async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, category, ward, locality, location, issueId } = req.body;
    const validationError = validateDiscussionInput({
      title,
      body,
      category,
      ward,
      locality,
      location,
      issueId,
    });
    if (validationError) {
      sendError(res, validationError, 400);
      return;
    }

    const discussion = await createDiscussion(req.user!.userId, {
      title,
      body,
      category,
      ward,
      locality,
      location,
      issueId,
    });
    sendSuccess(res, { discussion }, 'Discussion started.', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to start discussion.', 400);
  }
});

// GET /api/resident/discussions/:id
router.get('/discussions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const discussion = await getDiscussionView(req.params.id, req.user!.userId);
    if (!discussion) {
      sendError(res, 'Discussion not found.', 404);
      return;
    }
    sendSuccess(res, { discussion });
  } catch {
    sendError(res, 'Failed to load discussion.', 500);
  }
});

// POST /api/resident/discussions/:id/messages
router.post('/discussions/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 1 || text.trim().length > 1000) {
      sendError(res, 'Message must be 1 to 1000 characters.', 400);
      return;
    }

    const result = await addDiscussionMessage(req.params.id, req.user!.userId, text);
    if (!result) {
      sendError(res, 'Discussion not found.', 404);
      return;
    }

    sendSuccess(res, { message: result.message, discussion: result.view }, 'Reply added.', 201);
  } catch {
    sendError(res, 'Failed to add message.', 500);
  }
});

// POST /api/resident/discussions/:id/confirm — a resident counts once.
router.post('/discussions/:id/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const result = await confirmDiscussion(req.params.id, req.user!.userId);
    if (!result) {
      sendError(res, 'Discussion not found.', 404);
      return;
    }

    sendSuccess(
      res,
      {
        confirmations: result.confirmations,
        confirmed: result.confirmed,
        discussion: result.view,
      },
      result.confirmed ? 'Support recorded.' : 'You already support this discussion.'
    );
  } catch {
    sendError(res, 'Failed to confirm.', 500);
  }
});

// ── Impact ──
// GET /api/resident/impact — civic participation metrics
router.get('/impact', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const [reports, signals] = await Promise.all([
      Report.find({ userId }).lean(),
      CivicSignal.find({ userId }).lean(),
    ]);

    const user = await User.findById(userId);
    const reportsSubmitted = reports.length;
    const verifiedSignals = signals.filter((s) => s.status === 'CLUSTERED').length;
    const communityUpvotes = reports.reduce((sum, r) => sum + (r.upvotes || 0), 0);
    const points = reportsSubmitted * 25 + verifiedSignals * 15 + communityUpvotes * 5;
    const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

    sendSuccess(res, {
      impact: {
        points,
        rankPercentile: Math.min(90, 30 + reportsSubmitted * 10),
        locality: user?.locality || 'Dharampeth',
        reportsSubmitted,
        verifiedSignals,
        communityUpvotes,
        resolvedCount,
      },
    });
  } catch {
    sendError(res, 'Failed to load impact.', 500);
  }
});

// ── Verification ──
// PATCH /api/resident/reports/:id/verify — resident confirms resolution
router.patch('/reports/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { resolved } = req.body;
    if (typeof resolved !== 'boolean') {
      sendError(res, '"resolved" must be a boolean.', 400);
      return;
    }

    const report = await Report.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!report) {
      sendError(res, 'Report not found.', 404);
      return;
    }

    report.status = resolved ? 'Resolved' : 'Reopened';
    report.timeline = [
      ...(report.timeline || []),
      {
        status: resolved ? 'Citizen Verified' : 'Reopened by Citizen',
        timestamp: new Date().toISOString(),
        note: resolved
          ? 'The resident confirmed the civic issue is fixed.'
          : 'The resident reported the issue is still not fixed.',
        actor: 'Resident',
      },
    ];
    await report.save();

    sendSuccess(res, { report }, resolved ? 'Resolution verified.' : 'Issue reopened.', 200);
  } catch {
    sendError(res, 'Failed to update report.', 500);
  }
});

// ── Helper: build AI insight ──
async function buildInsight(user: any) {
  const topCluster = await CivicCluster.findOne({
    city: user.city || 'Nagpur',
    status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'] },
  })
    .sort({ 'priority.score': -1, lastSignalAt: -1 })
    .lean();

  const totalClusters = await CivicCluster.countDocuments({
    city: user.city || 'Nagpur',
    status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'] },
  });

  const category = topCluster?.category || 'street_lighting';
  const categoryLabel = category.replace(/_/g, ' ');
  const count = topCluster?.reportCount || 0;

  return {
    id: topCluster ? `insight-${topCluster._id}` : 'insight-default',
    clusterId: topCluster ? topCluster._id.toString() : undefined,
    title: `${categoryLabel} concerns are active in your area`,
    description: `${count} active issue report${count === 1 ? '' : 's'} clustered near ${user.locality || 'your locality'}. Municipal teams may be investigating.`,
    category,
    trendPercentage: Math.round((count / Math.max(totalClusters, 1)) * 100),
    confidence: topCluster?.reportCount ? Math.min(0.5 + topCluster.reportCount * 0.05, 0.95) : 0.8,
    ward: user.ward || 'Ward 14',
    locality: user.locality || 'Dharampeth',
    priority: topCluster?.priority || { score: 0, level: 'MEDIUM' },
    location: topCluster
      ? {
          latitude: topCluster.center?.latitude ?? 21.1458,
          longitude: topCluster.center?.longitude ?? 79.0882,
          ward: topCluster.ward || user.ward || 'Ward 14',
          locality: topCluster.locality || user.locality || 'Dharampeth',
        }
      : {
          latitude: 21.1458,
          longitude: 79.0882,
          ward: user.ward || 'Ward 14',
          locality: user.locality || 'Dharampeth',
        },
    relatedClusterIds: topCluster ? [topCluster._id.toString()] : [],
  };
}

// ── Fallback public reference data (used only when the DB has no ward/localities) ──
const DEFAULT_WARDS = [
  'Ward 02', 'Ward 05', 'Ward 08', 'Ward 12', 'Ward 14', 'Ward 16',
];

const DEFAULT_LOCALITIES = [
  'Dharampeth', 'Downtown', 'West Sector', 'Central Market', 'Nandanvan', 'Civil Lines',
];

function distanceMeters(lat1: number, lng1: number, lat2?: number, lng2?: number): number | undefined {
  if (lat2 == null || lng2 == null) return undefined;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ── Signal location validation ──
function validateSignalLocation(location: any): string | null {
  if (!location) {
    return 'A geographic location is required to process a civic signal.';
  }
  const { latitude, longitude } = location;
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required.';
  }
  return null;
}

// ── Nearby report points within a geographic radius ──
async function findNearbyReportPoints(location: any, radius: number) {
  if (!location?.latitude || !location?.longitude) return [];
  const lat = location.latitude;
  const lng = location.longitude;
  const issues = await Report.find({
    locationPoint: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    },
  })
    .limit(10)
    .select('title category status priority location.latitude location.longitude location.ward location.locality location.address reportNumber createdAt')
    .lean();

  return issues.map((r) => ({
    id: r._id,
    reportNumber: r.reportNumber,
    title: r.title,
    category: r.category,
    status: r.status,
    priority: r.priority,
    latitude: r.location?.latitude,
    longitude: r.location?.longitude,
    ward: r.location?.ward,
    locality: r.location?.ward,
    address: r.location?.address,
    createdAt: r.createdAt,
    distanceMeters: distanceMeters(lat, lng, r.location?.latitude, r.location?.longitude),
  }));
}

export default router;
