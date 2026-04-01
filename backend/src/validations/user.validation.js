const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required()
    .messages({
      "string.min": "Username must be at least 2 characters",
      "string.max": "Username must be at most 50 characters",
      "any.required": "Username is required",
    }),
  email: Joi.string().trim().email().required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string().min(6).max(128).required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must be at most 128 characters",
      "any.required": "Password is required",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string().required()
    .messages({
      "any.required": "Password is required",
    }),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required()
    .messages({ "any.required": "Old password is required" }),
  newPassword: Joi.string().min(6).max(128).required()
    .messages({
      "string.min": "New password must be at least 6 characters",
      "any.required": "New password is required",
    }),
});

const updateUsernameSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required()
    .messages({
      "string.min": "Username must be at least 2 characters",
      "any.required": "Username is required",
    }),
});

const updateEmailSchema = Joi.object({
  email: Joi.string().trim().email().required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid("viewer", "analyst", "admin").required()
    .messages({
      "any.only": "Role must be one of: viewer, analyst, admin",
      "any.required": "Role is required",
    }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required()
    .messages({
      "any.only": "Status must be one of: active, inactive",
      "any.required": "Status is required",
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateUsernameSchema,
  updateEmailSchema,
  updateRoleSchema,
  updateStatusSchema,
};
