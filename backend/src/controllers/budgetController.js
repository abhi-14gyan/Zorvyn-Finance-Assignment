const mongoose = require('mongoose');
const Budget = require('../models/budget.model.js');
const User = require('../models/user.model.js');
const Transaction = require('../models/transaction.model.js');

exports.getCurrentBudget = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id); // Fix for ObjectId

    // console.log("🔍 userId from req.user._id:", req.user._id);
    // console.log("➡️ type:", typeof req.user._id);
    
    const budget = await Budget.findOne({ userId });
    // console.log("📦 Budget found:", budget);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'EXPENSE',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      budget: budget
        ? {
          ...budget.toObject(),
          amount: parseFloat(budget.amount.toString()) // Decimal128 fix
        }
        : null,
      currentExpenses:
        expenses.length > 0
          ? parseFloat(expenses[0].total.toString()) // Decimal128 fix
          : 0
    });
  } catch (err) {
    console.error('Budget fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId },
      { amount },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      budget: {
        ...budget.toObject(),
        amount: parseFloat(budget.amount)
      }
    });
  } catch (err) {
    console.error('Budget update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
