const { ApiError } = require("../utils/apiError");

/**
 * Generic Joi validation middleware.
 * Validates req.body against the provided Joi schema.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post("/", validate(createTransactionSchema), createTransaction);
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,      // Report all errors, not just the first
      stripUnknown: true,      // Remove unknown fields
      convert: true,           // Allow type coercion (e.g., string "100" → number 100)
    });

    if (error) {
      const fieldErrors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));

      throw new ApiError(400, "Validation failed", fieldErrors);
    }

    // Replace req.body with validated/sanitized value
    req.body = value;
    next();
  };
};

module.exports = { validate };
