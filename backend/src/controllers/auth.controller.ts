import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as authService from '../services/auth.service.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { User } from '../models/User.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const input: RegisterInput = req.body;
    const result = await authService.registerUser(input);

    sendSuccess(res, {
      user: result.user,
      token: result.token,
      permissions: authService.getUserPermissions(result.user.role as string),
    }, 'Account created successfully.', 201);
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.message, error.statusCode);
    } else {
      sendError(res, 'Registration failed. Please try again.', 500);
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const input: LoginInput = req.body;
    const result = await authService.loginUser(input);

    sendSuccess(res, {
      user: result.user,
      token: result.token,
      permissions: authService.getUserPermissions(result.user.role as string),
    }, 'Signed in successfully.');
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.message, error.statusCode);
    } else {
      sendError(res, 'Login failed. Please try again.', 500);
    }
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    sendSuccess(res, {
      user: user.toSafeObject(),
      permissions: authService.getUserPermissions(req.user.role),
    });
  } catch (error: any) {
    sendError(res, 'Failed to retrieve user information.', 500);
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const user = await authService.updateUserProfile(req.user.userId, req.body);
    sendSuccess(res, { user }, 'Profile updated successfully.');
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.message, error.statusCode);
    } else {
      sendError(res, 'Failed to update profile.', 500);
    }
  }
}

export function logout(_req: AuthRequest, res: Response): void {
  sendSuccess(res, null, 'Signed out successfully.');
}
