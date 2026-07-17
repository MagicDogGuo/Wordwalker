// Custom error type for expected ("operational") errors: bad input, not found,
// unauthorized, etc. These are errors we anticipate and want to turn into a
// clean, predictable HTTP response.
//
// Errors that are NOT an AppError (e.g. a bug throwing a TypeError, a DB
// driver crash) are treated as "programmer errors" by the central error
// handler: they get logged with full detail and the client only receives a
// generic 500, never the raw error message/stack.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
