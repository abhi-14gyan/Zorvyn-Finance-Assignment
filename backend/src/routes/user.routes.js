const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUser,
  updateAccountDetails,
  updateUserName,
  verifyEmail,
  resendVerification,
  guestLogin,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/user.controller");

const { verifyJWT } = require("../middlewares/auth.middleware");
const { authorize, checkActiveStatus } = require("../middlewares/authorize.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { upload } = require("../middlewares/multer.middleware");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateUsernameSchema,
  updateEmailSchema,
  updateRoleSchema,
  updateStatusSchema,
} = require("../validations/user.validation");

// ── Public Routes ──
router.post("/register", upload.single('imageUrl'), validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/guest-login", guestLogin);

// ── Protected Routes (any authenticated user) ──
router.post("/logout", verifyJWT, checkActiveStatus, logoutUser);
router.post("/change-password", verifyJWT, checkActiveStatus, validate(changePasswordSchema), changeCurrentPassword);
router.get("/me", verifyJWT, getUser);
router.put("/update-account", verifyJWT, checkActiveStatus, validate(updateEmailSchema), updateAccountDetails);
router.put("/update-username", verifyJWT, checkActiveStatus, validate(updateUsernameSchema), updateUserName);

// ── Admin-Only Routes ──
router.get("/", verifyJWT, checkActiveStatus, authorize("admin"), getAllUsers);
router.patch("/:id/role", verifyJWT, checkActiveStatus, authorize("admin"), validate(updateRoleSchema), updateUserRole);
router.patch("/:id/status", verifyJWT, checkActiveStatus, authorize("admin"), validate(updateStatusSchema), updateUserStatus);

module.exports = router;
