import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { CivicSignal } from '../models/CivicSignal.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { Discussion } from '../models/Discussion.js';
import { processSignal, getSignalById } from '../services/signal.service.js';

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
        status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED'] },
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
// GET /api/resident/map/issues
router.get('/map/issues', async (req: AuthRequest, res: Response) => {
  try {
    const { ward, category, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (ward) filter['location.ward'] = ward;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const issues = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .select('title category status priority location reportNumber createdAt')
      .lean();

    sendSuccess(res, { issues });
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

// ── Issue detail ──
// GET /api/resident/issues/:id
router.get('/issues/:id', async (req: AuthRequest, res: Response) => {
  try {
    const issue = await Report.findById(req.params.id).lean();
    if (!issue) {
      sendError(res, 'Issue not found.', 404);
      return;
    }
    sendSuccess(res, { issue });
  } catch {
    sendError(res, 'Failed to load issue.', 500);
  }
});

// ── Signal intake ──
// POST /api/resident/signals
router.post('/signals', async (req: AuthRequest, res: Response) => {
  try {
    const { rawText, location } = req.body;

    if (!rawText || rawText.trim().length < 5) {
      sendError(res, 'Signal text must be at least 5 characters.', 400);
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

// ── Reports (own) ──
// GET /api/resident/reports
router.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const filter: Record<string, unknown> = { userId: req.user!.userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Report.countDocuments(filter),
    ]);

    sendSuccess(res, { reports, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch {
    sendError(res, 'Failed to load reports.', 500);
  }
});

// POST /api/resident/reports
router.post('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, location, evidence } = req.body;

    if (!title || !description || !category || !location) {
      sendError(res, 'Missing required fields.', 400);
      return;
    }

    const report = await Report.create({
      userId: req.user!.userId,
      reportNumber: `#CV-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      description,
      category,
      location: {
        address: location.address || 'Location',
        ward: location.ward || '',
        city: location.city || 'Nagpur',
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
      evidence: evidence || [],
      timeline: [
        {
          status: 'Report Lodged',
          timestamp: new Date().toLocaleString(),
          note: 'Civic report submitted by resident.',
          actor: 'Resident',
        },
      ],
    });

    sendSuccess(res, { report }, 'Report created.', 201);
  } catch {
    sendError(res, 'Failed to create report.', 500);
  }
});

// GET /api/resident/reports/:id
router.get('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user!.userId }).lean();
    if (!report) {
      sendError(res, 'Report not found.', 404);
      return;
    }
    sendSuccess(res, { report });
  } catch {
    sendError(res, 'Failed to load report.', 500);
  }
});

// ── Discussions ──
// GET /api/resident/discussions — list active discussions
router.get('/discussions', async (req: AuthRequest, res: Response) => {
  try {
    const discussions = await Discussion.find({ status: { $in: ['OPEN', 'ACTIVE'] } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();
    sendSuccess(res, { discussions });
  } catch {
    sendError(res, 'Failed to load discussions.', 500);
  }
});

// GET /api/resident/discussions/:id
router.get('/discussions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const discussion = await Discussion.findById(req.params.id).lean();
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
    if (!text || text.trim().length < 1) {
      sendError(res, 'Message cannot be empty.', 400);
      return;
    }

    const user = await User.findById(req.user!.userId);
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      sendError(res, 'Discussion not found.', 404);
      return;
    }

    discussion.messages.push({
      userId: req.user!.userId as any,
      userName: user?.name || 'Resident',
      text: text.trim(),
    });
    discussion.status = 'ACTIVE';
    await discussion.save();

    sendSuccess(res, { message: discussion.messages[discussion.messages.length - 1] }, 'Message added.', 201);
  } catch {
    sendError(res, 'Failed to add message.', 500);
  }
});

// POST /api/resident/discussions/:id/confirm
router.post('/discussions/:id/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      sendError(res, 'Discussion not found.', 404);
      return;
    }

    const userIdObj = req.user!.userId as any;
    if (!discussion.confirmations.includes(userIdObj)) {
      discussion.confirmations.push(userIdObj);
      await discussion.save();
    }

    sendSuccess(res, { confirmations: discussion.confirmations.length }, 'Confirmation recorded.');
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
        timestamp: new Date().toLocaleString(),
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
  const category = await CivicCluster.aggregate([
    {
      $match: {
        city: user.city || 'Nagpur',
        status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED'] },
      },
    },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const top = category[0];
  const totalClusters = await CivicCluster.countDocuments({
    city: user.city || 'Nagpur',
    status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED'] },
  });

  const categoryLabel = (top?._id || 'street_lighting').replace(/_/g, ' ');

  return {
    title: `${categoryLabel} concerns are active in your area`,
    description: `${top?.count || 3} active issue cluster${(top?.count || 3) > 1 ? 's' : ''} detected near ${user.locality || 'your locality'}. Municipal teams may be investigating.`,
    category: top?._id || 'street_lighting',
    trendPercentage: Math.round(((top?.count || 3) / Math.max(totalClusters, 1)) * 100),
    confidence: 0.8,
    ward: user.ward || 'Ward 14',
    locality: user.locality || 'Dharampeth',
    relatedClusterIds: [],
  };
}

export default router;
