import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
// The project's own .env is the source of truth — override inherited host
// environment variables (e.g. PORT=0 injected by some sandboxes) so the
// backend always listens on the configured port.
dotenv.config({ path: envPath, override: true });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/civinest',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;
