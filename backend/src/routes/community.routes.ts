import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';
import {
  getCommunityDashboard,
  listCommunityIssues,
  getCommunityIssueDetail,
  getCommunityMapData,
  listCommunityMembers,
  syncCommunityNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getCommunityProfile,
  updateCommunityProfile,
} from '../services/community.service.js';
import {
  createAggregation,
  listAggregations,
  getAggregationById,
  validateAggregationInput,
  findForbiddenAggregationFields,
} from '../services/communityAggregation.service.js';

const router = Router();

// All community routes require the COMMUNITY_REPRESENTATIVE role.
router.use(authenticate, requireRole(ROLES.COMMUNITY_REPRESENTATIVE));

// Load the representative's real User record once — the authoritative source
// of geographic scope (community/ward/locality/city). Never trust the frontend.
async function loadRep(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    sendError(res, 'Representative account not found.', 404);
    return null;
  }
  return user;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const dashboard = await getCommunityDashboard(user);
    sendSuccess(res, { user: user.toSafeObject(), dashboard });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load community dashboard.', 500);
  }
});

// ── Issues ────────────────────────────────────────────────────────────────────

router.get('/issues', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const result = await listCommunityIssues(user, {
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      severity: typeof req.query.severity === 'string' ? req.query.severity : undefined,
      priority: typeof req.query.priority === 'string' ? req.query.priority : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      ward: typeof req.query.ward === 'string' ? req.query.ward : undefined,
      locality: typeof req.query.locality === 'string' ? req.query.locality : undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sort: (typeof req.query.sort === 'string' ? req.query.sort : 'latest') as any,
    });
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load community issues.', 500);
  }
});

router.get('/issues/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const issue = await getCommunityIssueDetail(user, req.params.id);
    if (!issue) {
      sendError(res, 'Issue not found in your community.', 404);
      return;
    }
    sendSuccess(res, { issue });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load issue details.', 500);
  }
});

// ── Map ───────────────────────────────────────────────────────────────────────

router.get('/map/issues', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const data = await getCommunityMapData(user, {
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      severity: typeof req.query.severity === 'string' ? req.query.severity : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      ward: typeof req.query.ward === 'string' ? req.query.ward : undefined,
    });
    sendSuccess(res, data);
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load map data.', 500);
  }
});

// Compatibility alias: /map/clusters returns the cluster half of map data.
router.get('/map/clusters', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const data = await getCommunityMapData(user, {
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      severity: typeof req.query.severity === 'string' ? req.query.severity : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      ward: typeof req.query.ward === 'string' ? req.query.ward : undefined,
    });
    sendSuccess(res, { clusters: data.clusters });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load cluster data.', 500);
  }
});

// ── Aggregations ──────────────────────────────────────────────────────────────

router.post('/aggregations', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;

    const forbidden = findForbiddenAggregationFields(req.body || {});
    if (forbidden) {
      sendError(res, `Representatives cannot set "${forbidden}" — authoritative metrics are server-derived.`, 400);
      return;
    }

    const input = {
      clusterId: typeof req.body?.clusterId === 'string' ? req.body.clusterId : undefined,
      issueIds: Array.isArray(req.body?.issueIds) ? req.body.issueIds.map(String) : [],
      context: typeof req.body?.context === 'string' ? req.body.context : '',
      notes: typeof req.body?.notes === 'string' ? req.body.notes : undefined,
    };

    const validationError = validateAggregationInput(input);
    if (validationError) {
      sendError(res, validationError, 400);
      return;
    }

    const scope = { community: user.community || '', ward: user.ward || '', locality: user.locality || '', city: user.city || '' };
    const { aggregation, duplicate } = await createAggregation(String(user._id), scope, input);
    if (duplicate) {
      sendSuccess(res, { aggregation, duplicate }, 'This aggregation already exists.', 409);
      return;
    }
    sendSuccess(res, { aggregation, duplicate: false }, 'Community aggregation recorded.', 201);
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to create aggregation.', 400);
  }
});

router.get('/aggregations', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const { aggregations, total } = await listAggregations(String(user._id), Number(req.query.page) || 1, Number(req.query.limit) || 20);
    sendSuccess(res, { aggregations, total });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load aggregations.', 500);
  }
});

router.get('/aggregations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const aggregation = await getAggregationById(String(user._id), req.params.id);
    if (!aggregation) {
      sendError(res, 'Aggregation not found.', 404);
      return;
    }
    sendSuccess(res, { aggregation });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load aggregation.', 500);
  }
});

// Backward-compatible alias used by the original frontend.
router.put('/aggregate', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;

    const forbidden = findForbiddenAggregationFields(req.body || {});
    if (forbidden) {
      sendError(res, `Representatives cannot set "${forbidden}" — authoritative metrics are server-derived.`, 400);
      return;
    }

    const input = {
      clusterId: typeof req.body?.clusterId === 'string' ? req.body.clusterId : undefined,
      issueIds: Array.isArray(req.body?.issueIds) ? req.body.issueIds.map(String) : [],
      context: typeof req.body?.context === 'string' ? req.body.context : '',
      notes: typeof req.body?.notes === 'string' ? req.body.notes : undefined,
    };

    const validationError = validateAggregationInput(input);
    if (validationError) {
      sendError(res, validationError, 400);
      return;
    }

    const scope = { community: user.community || '', ward: user.ward || '', locality: user.locality || '', city: user.city || '' };
    const { aggregation, duplicate } = await createAggregation(String(user._id), scope, input);
    sendSuccess(res, { aggregation, duplicate }, duplicate ? 'This aggregation already exists.' : 'Community aggregation recorded.', duplicate ? 409 : 201);
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to aggregate issues.', 400);
  }
});

// ── Members ───────────────────────────────────────────────────────────────────

router.get('/members', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const result = await listCommunityMembers(user, {
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      ward: typeof req.query.ward === 'string' ? req.query.ward : undefined,
      verification: typeof req.query.verification === 'string' ? req.query.verification : undefined,
      participation: typeof req.query.participation === 'string' ? req.query.participation : undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load community members.', 500);
  }
});

// ── Analytics ─────────────────────────────────────────────────────────────────

router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const timeRange = (typeof req.query.range === 'string' && ['30D', '90D', 'YTD'].includes(req.query.range))
      ? (req.query.range as '30D' | '90D' | 'YTD')
      : '30D';
    const { computeCommunityAnalytics } = await import('../services/communityAnalytics.service.js');
    const analytics = await computeCommunityAnalytics(
      { community: user.community || '', ward: user.ward || '', locality: user.locality || '', city: user.city || '' },
      timeRange
    );
    sendSuccess(res, { analytics });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load analytics.', 500);
  }
});

// ── Notifications ─────────────────────────────────────────────────────────────

router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const notifications = await syncCommunityNotifications(user);
    const unread = notifications.filter((n) => !n.read).length;
    sendSuccess(res, { notifications, unread });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load notifications.', 500);
  }
});

router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const ok = await markNotificationRead(String(user._id), req.params.id);
    if (!ok) {
      sendError(res, 'Notification not found.', 404);
      return;
    }
    sendSuccess(res, { id: req.params.id, read: true });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to update notification.', 500);
  }
});

router.patch('/notifications/read-all', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const updated = await markAllNotificationsRead(String(user._id));
    sendSuccess(res, { updated });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to update notifications.', 500);
  }
});

// ── Profile ───────────────────────────────────────────────────────────────────

router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;
    const profile = await getCommunityProfile(user);
    sendSuccess(res, { profile });
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to load profile.', 500);
  }
});

router.patch('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadRep(req, res);
    if (!user) return;

    // Role/community/ward are never editable here — they define authorization.
    const protectedFields = ['role', 'email', 'community', 'ward', 'locality', 'city', 'isVerified'];
    const touched = protectedFields.filter((f) => (req.body || {})[f] !== undefined);
    if (touched.length) {
      sendError(res, `Cannot update protected field(s): ${touched.join(', ')}.`, 400);
      return;
    }

    const { user: profileUser, changed } = await updateCommunityProfile(user, req.body || {});
    sendSuccess(res, { user: profileUser, changed }, 'Profile updated.');
  } catch (error: any) {
    sendError(res, error?.message || 'Failed to update profile.', 400);
  }
});

export default router;
