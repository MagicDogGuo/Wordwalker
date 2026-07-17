// Centralized, environment-aware configuration.
//
// Rule of thumb followed here: this is the ONLY module in the backend that is
// allowed to read `process.env` directly. Every other module (routes,
// middleware, models, scripts) must import CONFIG from here instead of
// touching `process.env` itself. This keeps env-var dependencies explicit,
// makes the app easier to test (just import a fake config object), and gives
// us one place to validate required variables at startup.

require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const CONFIG = {
  NODE_ENV,
  isProduction,
  isTest,

  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  CLIENT_URL: process.env.CLIENT_URL || '*',

  LOG_LEVEL: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_IMAGE_MODEL: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini',

  IMGUR_CLIENT_ID: process.env.IMGUR_CLIENT_ID,

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
};

// Fail fast: variables the app cannot safely run without.
// (Skipped in test env so unit tests can inject their own fake config.)
const REQUIRED_IN_RUNTIME = ['MONGODB_URI', 'JWT_SECRET'];

function validateConfig() {
  if (isTest) return;

  const missing = REQUIRED_IN_RUNTIME.filter((key) => !CONFIG[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Please check your .env file (see env.example).'
    );
  }
}

validateConfig();

module.exports = CONFIG;
