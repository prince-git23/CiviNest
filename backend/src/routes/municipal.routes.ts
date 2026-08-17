import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';

const router = Router();

// All municipal routes require MUNICIPAL_OFFICER role
router.use(authenticate, requireRole(ROLES.MUNICIPAL_OFFICER));

// GET /api/municipal/dashboard — Municipal command center data
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
        totalIssues: 0,
        criticalIssues: 0,
        activeClusters: 0,
        slaCompliance: 0,
        departments: [],
        recentActions: [],
      },
    });
  } catch {
    sendError(res, 'Failed to load municipal dashboard.', 500);
  }
});

// GET /api/municipal/issues — Get all issues for triage
router.get('/issues', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { issues: [], total: 0 });
});

// PUT /api/municipal/issues/:id/assign — Assign issue to department
router.put('/issues/:id/assign', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { assigned: true, message: 'Issue assignment endpoint ready.' });
});

// GET /api/municipal/departments — Get department status
router.get('/departments', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { departments: [] });
});

// GET /api/municipal/spatial — Get spatial intelligence data
router.get('/spatial', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { clusters: [], wards: [], hotspots: [] });
});

export default router;
