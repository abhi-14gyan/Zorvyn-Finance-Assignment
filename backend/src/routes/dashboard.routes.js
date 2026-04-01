const express = require("express");
const router = express.Router();
const {
  getUserAccounts,
  createAccount,
  getDashboardData,
  getDashboardSummary,
  deleteAccount,
} = require("../controllers/dashboard.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { authorize, checkActiveStatus } = require("../middlewares/authorize.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createAccountSchema } = require("../validations/account.validation");

// All dashboard routes require auth + active user
router.use(verifyJWT, checkActiveStatus);

// ── Dashboard Summary — All roles can view ──
router.get("/summary", authorize("viewer", "analyst", "admin"), getDashboardSummary);

// ── Account read — All roles can view ──
router.get("/accounts", authorize("viewer", "analyst", "admin"), getUserAccounts);

// ── Transaction list for dashboard — All roles can view ──
router.get("/transactions", authorize("viewer", "analyst", "admin"), getDashboardData);

// ── Account write — Admin only ──
router.post("/accounts", authorize("admin"), validate(createAccountSchema), createAccount);
router.delete("/accounts/:accountId", authorize("admin"), deleteAccount);

module.exports = router;
