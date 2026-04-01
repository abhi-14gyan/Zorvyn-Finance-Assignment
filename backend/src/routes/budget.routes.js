const express = require('express');
const router = express.Router();
const { getCurrentBudget, updateBudget } = require('../controllers/budgetController');
const { verifyJWT } = require("../middlewares/auth.middleware");
const { authorize, checkActiveStatus } = require("../middlewares/authorize.middleware");

router.use(verifyJWT, checkActiveStatus);

// All roles can view budget
router.get('/', authorize("viewer", "analyst", "admin"), getCurrentBudget);

// Admin only can update budget
router.post('/', authorize("admin"), updateBudget);

module.exports = router;
