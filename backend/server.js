const mongoose = require('mongoose');
const CONFIG = require('./config');
const logger = require('./utils/logger');
const app = require('./app');
const initData = require('./scripts/initData');

const SHUTDOWN_TIMEOUT_MS = 10000;

// Catch programmer errors that slipped past every other safety net (e.g. a
// thrown error in code that never went through asyncHandler, or a rejected
// promise nobody awaited). By definition we can no longer trust the process
// is in a safe state, so we log full detail and exit - a process manager
// (PM2/Docker/systemd) is expected to restart us.
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception, shutting down...', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection, shutting down...', {
    message: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});

let server;

async function start() {
  logger.info('Connecting to MongoDB...');
  await mongoose.connect(CONFIG.MONGODB_URI);
  logger.info('MongoDB connection successful');

  logger.info('Starting to initialize data...');
  await initData();
  logger.info('Data initialization completed');

  server = app.listen(CONFIG.PORT, () => {
    logger.info(`Server is running on port ${CONFIG.PORT}`);
  });
}

// Stop accepting new connections, let in-flight requests finish, then close
// the DB connection before exiting. Falls back to a forced exit if shutdown
// hangs for any reason.
function gracefulShutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);

  if (!server) {
    process.exit(0);
    return;
  }

  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close(async () => {
    try {
      await mongoose.connection.close();
      logger.info('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error while shutting down:', { message: err.message, stack: err.stack });
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start().catch((err) => {
  logger.error('Failed to start server:', { message: err.message, stack: err.stack });
  process.exit(1);
});

module.exports = { start };
