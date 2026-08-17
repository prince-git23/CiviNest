import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    sendError(res, 'An account with this email already exists.', 409);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    sendError(res, 'Invalid input data.', 400);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, 'Invalid resource ID.', 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token.', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired. Please sign in again.', 401);
    return;
  }

  // App errors with status codes
  if (err.statusCode) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Unknown errors
  sendError(res, 'Internal server error.', 500);
}
