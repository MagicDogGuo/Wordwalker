// Wraps an async route/middleware handler so that any rejected promise (thrown
// error) is forwarded to Express's `next(err)` instead of crashing the process
// or being silently swallowed. This removes the need for a try/catch block in
// every single route handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
