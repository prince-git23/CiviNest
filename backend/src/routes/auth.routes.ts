import { Router } from 'express';
import { register, login, getMe, updateProfile, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.post('/logout', authenticate, logout);

export default router;
