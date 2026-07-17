const winston = require('winston');
const CONFIG = require('../config');

// Only log to stdout/stderr (via winston's Console transport). We intentionally
// do NOT write to files here - log destination/rotation/shipping should be
// handled by the hosting platform (PM2, Docker, systemd, cloud provider), not
// hardcoded into the app itself.
const logger = winston.createLogger({
  level: CONFIG.LOG_LEVEL,
  format: CONFIG.isProduction
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}] ${stack || message}${metaStr}`;
        })
      ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

module.exports = logger;
