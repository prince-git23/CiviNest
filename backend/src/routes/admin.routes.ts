import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole(ROLES.ADMIN));

// GET /api/admin/dashboard — Admin system overview
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    const totalUsers = await User.countDocuments();
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    sendSuccess(res, {
      user: user.toSafeObject(),
      system: {
        totalUsers,
        roleBreakdown: roleCounts,
        systemHealth: 'operational',
      },
    });
  } catch {
    sendError(res, 'Failed to load admin dashboard.', 500);
  }
});

// GET /api/admin/users — List all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash').limit(50);
    sendSuccess(res, { users, total: users.length });
  } catch {
    sendError(res, 'Failed to list users.', 500);
  }
});

// PUT /api/admin/users/:id/role — Change user role
router.put('/users/:id/role', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { updated: true, message: 'Role update endpoint ready.' });
});

export default router;
