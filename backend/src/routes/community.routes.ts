import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';

const router = Router();

// All community routes require COMMUNITY_REPRESENTATIVE role
router.use(authenticate, requireRole(ROLES.COMMUNITY_REPRESENTATIVE));

// GET /api/community/dashboard — Community dashboard data
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    sendSuccess(res, {
      user: user.toSafeObject(),
      dashboard: {
        community: user.community || 'Green Valley Residency',
        ward: user.ward || 'Ward 12',
        totalMembers: 0,
        activeIssues: 0,
        pendingAggregation: 0,
      },
    });
  } catch {
    sendError(res, 'Failed to load community dashboard.', 500);
  }
});

// GET /api/community/issues — Get community issues for aggregation
router.get('/issues', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { issues: [], total: 0 });
});

// PUT /api/community/aggregate — Aggregate issues into clusters
router.put('/aggregate', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { aggregated: 0, message: 'Aggregation endpoint ready.' });
});

export default router;
