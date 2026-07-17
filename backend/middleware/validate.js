const AppError = require('../utils/AppError');

// Returns an Express middleware that validates `req[source]` against a Joi
// schema. On failure, throws a single AppError(400) with all validation
// messages joined together, which flows into the central error handler.
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join('; ');
      return next(new AppError(message, 400));
    }

    req[source] = value;
    next();
  };
}

module.exports = validate;
