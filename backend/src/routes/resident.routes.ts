import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';

const router = Router();

// All resident routes require CITIZEN role
router.use(authenticate, requireRole(ROLES.CITIZEN));

// GET /api/resident/dashboard — Resident's dashboard data
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
        locality: user.locality || 'Dharampeth',
        ward: user.ward || 'Ward 14',
        city: user.city || 'Nagpur',
        impactScore: 0,
        recentReports: [],
        nearbyIssues: [],
      },
    });
  } catch {
    sendError(res, 'Failed to load dashboard.', 500);
  }
});

// POST /api/resident/report — Create a new civic report
router.post('/report', (req: AuthRequest, res: Response) => {
  // Placeholder for report creation — will be implemented with full report API
  sendSuccess(res, { reportId: `RPT-${Date.now()}`, status: 'submitted' }, 'Report submitted.', 201);
});

// GET /api/resident/reports — Get resident's own reports
router.get('/reports', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { reports: [], total: 0 });
});

export default router;
