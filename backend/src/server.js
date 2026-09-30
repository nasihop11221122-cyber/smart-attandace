import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

const start = async () => {
  try {
    await connectDB();
    app.listen(env.port, '0.0.0.0', () => console.log(`Server running on port ${env.port}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
start();
