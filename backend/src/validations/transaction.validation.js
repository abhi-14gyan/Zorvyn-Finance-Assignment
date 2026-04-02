const Joi = require("joi");

const VALID_CATEGORIES = [
  "housing", "transportation", "groceries", "utilities",
  "entertainment", "food", "shopping", "healthcare",
  "education", "personal", "travel", "insurance",
  "gifts", "bills", "salary", "freelance", "investments",
  "business", "rental", "other-income", "other-expense"
];

const createTransactionSchema = Joi.object({
  type: Joi.string().valid("INCOME", "EXPENSE").required()
    .messages({
      "any.only": "Type must be either INCOME or EXPENSE",
      "any.required": "Transaction type is required",
    }),
  amount: Joi.number().positive().precision(2).required()
    .messages({
      "number.positive": "Amount must be a positive number",
      "any.required": "Amount is required",
    }),
  description: Joi.string().trim().max(500).allow("", null)
    .messages({
      "string.max": "Description must be at most 500 characters",
    }),
  date: Joi.date().iso().required()
    .messages({
      "date.format": "Date must be a valid ISO date string",
      "any.required": "Date is required",
    }),
  category: Joi.string().trim().required()
    .messages({
      "any.required": "Category is required",
    }),
  accountId: Joi.string().hex().length(24).required()
    .messages({
      "string.hex": "Invalid account ID format",
      "string.length": "Invalid account ID format",
      "any.required": "Account ID is required",
    }),
  isRecurring: Joi.boolean().default(false),
  recurringInterval: Joi.when("isRecurring", {
    is: true,
    then: Joi.string().valid("DAILY", "WEEKLY", "MONTHLY", "YEARLY").required()
      .messages({
        "any.only": "Recurring interval must be DAILY, WEEKLY, MONTHLY, or YEARLY",
        "any.required": "Recurring interval is required when isRecurring is true",
      }),
    otherwise: Joi.string().valid("DAILY", "WEEKLY", "MONTHLY", "YEARLY").allow(null, ""),
  }),
  receiptUrl: Joi.string().uri().allow("", null),
  status: Joi.string().valid("PENDING", "COMPLETED", "FAILED").default("COMPLETED"),
});

const updateTransactionSchema = Joi.object({
  type: Joi.string().valid("INCOME", "EXPENSE"),
  amount: Joi.number().positive().precision(2),
  description: Joi.string().trim().max(500).allow("", null),
  date: Joi.date().iso(),
  category: Joi.string().trim(),
  accountId: Joi.string().hex().length(24),
  isRecurring: Joi.boolean(),
  recurringInterval: Joi.string().valid("DAILY", "WEEKLY", "MONTHLY", "YEARLY").allow(null, ""),
  receiptUrl: Joi.string().uri().allow("", null),
  status: Joi.string().valid("PENDING", "COMPLETED", "FAILED"),
}).min(1).messages({
  "object.min": "At least one field must be provided for update",
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
};
