import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';
import residentRoutes from './routes/resident.routes.js';
import communityRoutes from './routes/community.routes.js';
import municipalRoutes from './routes/municipal.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// CORS
// Allow the configured frontend URL plus any localhost dev origin
// (localhost:3000, 127.0.0.1:3000, other ports, etc.) so the resident
// portal works regardless of which host/port the app is opened on.
app.use(cors({
  origin(origin, callback) {
    const allowed =
      !origin ||
      origin === env.FRONTEND_URL ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
    callback(null, allowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Protected portal routes (each has role-based middleware)
app.use('/api/resident', residentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/municipal', municipalRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// Error handler
app.use(errorHandler);

export default app;
