import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function startServer() {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`\n✓ CiviNest Backend running on http://localhost:${env.PORT}`);
      console.log(`✓ Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`✓ Auth API: http://localhost:${env.PORT}/api/auth`);
      console.log(`✓ Environment: ${env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
