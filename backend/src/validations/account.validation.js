const Joi = require("joi");

const createAccountSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required()
    .messages({
      "string.min": "Account name is required",
      "string.max": "Account name must be at most 100 characters",
      "any.required": "Account name is required",
    }),
  type: Joi.string().trim().valid("savings", "current", "investment", "credit", "other").required()
    .messages({
      "any.only": "Account type must be one of: savings, current, investment, credit, other",
      "any.required": "Account type is required",
    }),
  balance: Joi.number().precision(2).required()
    .messages({
      "number.base": "Balance must be a valid number",
      "any.required": "Balance is required",
    }),
  isDefault: Joi.boolean().default(false),
});

module.exports = {
  createAccountSchema,
};
