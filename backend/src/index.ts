import { createServer } from './server.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

const app = createServer();

async function start() {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 SaathiCare API Server Running on port ${ENV.PORT}`);
      console.log(`   Health check: http://localhost:${ENV.PORT}/health`);
      console.log(`   Environment:  ${ENV.NODE_ENV}`);
      console.log(`======================================================\n`);
    });
  } catch (err: any) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

start();
