const CONFIG = require('../config');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

// Translate well-known third-party/library errors (Mongoose, JWT) into a
// consistent AppError so the rest of this handler only has to deal with one
// shape of error.
function normalizeError(err) {
  if (err instanceof AppError) {
    return err;
  }

  if (err.name === 'ValidationError') {
    // Mongoose schema validation error
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return new AppError(message || 'Validation error', 400);
  }

  if (err.name === 'CastError') {
    // e.g. malformed ObjectId in req.params
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    // Mongo duplicate key error
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return new AppError(`${field} already exists`, 409);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AppError('Authentication failed', 401);
  }

  if (err.type === 'entity.parse.failed') {
    // Malformed JSON body (thrown by express.json()) is the client's fault, not ours.
    // NOTE: intentionally scoped to this specific body-parser error `type`, not a
    // blanket `instanceof SyntaxError` check, so genuine programmer syntax errors
    // elsewhere in the app still surface as 500s instead of being hidden as 400s.
    return new AppError('Invalid JSON in request body', 400);
  }

  // Unknown/programmer error: not operational, will be logged with full detail.
  return err;
}

// Central error-handling middleware. Every route/middleware in this app
// forwards errors here via next(err) (see middleware/asyncHandler.js) instead
// of handling errors ad-hoc, so the response shape is always consistent.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);
  const isOperational = normalized instanceof AppError && normalized.isOperational;
  const statusCode = isOperational ? normalized.statusCode : 500;

  if (isOperational) {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode}: ${normalized.message}`);
  } else {
    // Programmer/unexpected error: log full stack for debugging, never leak details to the client.
    logger.error(`${req.method} ${req.originalUrl} -> 500 (unexpected error)`, {
      message: err.message,
      stack: err.stack,
    });
  }

  const message = isOperational
    ? normalized.message
    : 'Internal server error';

  const body = { message };
  if (!CONFIG.isProduction && !isOperational) {
    body.error = err.message;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
