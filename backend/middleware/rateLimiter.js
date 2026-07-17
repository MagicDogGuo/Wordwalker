const rateLimit = require('express-rate-limit');
const CONFIG = require('../config');

// General limiter applied to the whole API to blunt basic abuse/DoS attempts.
const apiLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max: CONFIG.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Stricter limiter for login/register to slow down brute-force/credential-stuffing attempts.
const authLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max: CONFIG.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});

module.exports = { apiLimiter, authLimiter };
