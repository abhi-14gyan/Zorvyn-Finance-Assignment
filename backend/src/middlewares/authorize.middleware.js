const { ApiError } = require("../utils/apiError");

/**
 * Role-based authorization middleware.
 * Must be used AFTER verifyJWT middleware (req.user must exist).
 *
 * @param  {...string} allowedRoles - Roles permitted to access this route
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post("/", verifyJWT, authorize("admin"), createTransaction);
 *   router.get("/", verifyJWT, authorize("analyst", "admin"), getTransactions);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(" or ")}`
      );
    }

    next();
  };
};

/**
 * Middleware to check if user account is active.
 * Must be used AFTER verifyJWT middleware.
 * Blocks requests from inactive users.
 */
const checkActiveStatus = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  if (req.user.status === "inactive") {
    throw new ApiError(
      403,
      "Your account has been deactivated. Please contact an administrator."
    );
  }

  next();
};

module.exports = { authorize, checkActiveStatus };
