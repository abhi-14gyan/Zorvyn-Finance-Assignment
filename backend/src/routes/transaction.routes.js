const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactions,
  scanReceipt,
} = require("../controllers/transactions.controller");
const { upload } = require("../middlewares/multer.middleware");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { authorize, checkActiveStatus } = require("../middlewares/authorize.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { rateLimiter } = require("../middlewares/arcjet.middleware");
const { createTransactionSchema, updateTransactionSchema } = require("../validations/transaction.validation");

// All routes require authentication + active status check
router.use(verifyJWT, checkActiveStatus);

// ── Read operations — Analyst + Admin ──
router.get("/", authorize("analyst", "admin"), getUserTransactions);
router.get("/:id", authorize("analyst", "admin"), getTransaction);

// ── Write operations — Admin only ──
router.post("/", authorize("admin"), rateLimiter, validate(createTransactionSchema), createTransaction);
router.put("/:id", authorize("admin"), validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", authorize("admin"), deleteTransaction);

// ── Receipt scanning — Admin only ──
router.post("/scan-receipt", authorize("admin"), upload.single("file"), scanReceipt);

module.exports = router;
