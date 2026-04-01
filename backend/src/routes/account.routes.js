const express = require("express");
const { getAccountWithTransactions, bulkDeleteTransactions, updateDefaultAccount } = require("../controllers/account.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { authorize, checkActiveStatus } = require("../middlewares/authorize.middleware");
const router = express.Router();

router.use(verifyJWT, checkActiveStatus);

// Read — Analyst + Admin
router.get("/:accountId", authorize("analyst", "admin"), getAccountWithTransactions);

// Write — Admin only
router.delete("/transactions/bulk-delete", authorize("admin"), bulkDeleteTransactions);
router.put("/default/:accountId", authorize("admin"), updateDefaultAccount);

module.exports = router;
