const Account = require("../models/account.model");
const Transaction = require("../models/transaction.model");
const User = require("../models/user.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError.js");
const mongoose = require("mongoose");

// Utility to convert Decimal128 to Number for accounts
const serializeAccount = (obj) => {
  const data = obj._doc ? obj._doc : obj;
  const serialized = { ...data };

  if (serialized.balance) {
    serialized.balance = parseFloat(serialized.balance.toString());
  }

  return serialized;
};

// Utility to convert Decimal128 to Number for transactions
const serializeTransaction = (obj) => {
  const data = obj._doc ? obj._doc : obj;
  const serialized = { ...data };

  if (serialized.balance) {
    serialized.balance = parseFloat(serialized.balance.toString());
  }
  if (serialized.amount) {
    serialized.amount = parseFloat(serialized.amount.toString());
  }

  return serialized;
};

// GET /api/v1/dashboard/accounts
// All roles see all accounts (dashboard is a system-wide view)
// Write access is controlled at the route level via authorize()
exports.getUserAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({})
    .populate("userId", "username email")
    .sort({ createdAt: -1 })
    .lean();

  const serializedAccounts = accounts.map(serializeAccount);

  res.status(200).json({
    success: true,
    data: serializedAccounts
  });
});

// POST /api/v1/dashboard/accounts
exports.createAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, type, balance, isDefault } = req.body;

  if (isNaN(balance)) {
    throw new ApiError(400, "Invalid balance amount");
  }

  const existingAccounts = await Account.find({ userId });

  const shouldBeDefault = existingAccounts.length === 0 ? true : isDefault;

  if (shouldBeDefault) {
    await Account.updateMany({ userId, isDefault: true }, { isDefault: false });
  }

  const account = await Account.create({
    name,
    type,
    balance,
    isDefault: shouldBeDefault,
    userId,
  });

  res.status(201).json({
    success: true,
    data: serializeAccount(account),
  });
});

// GET /api/v1/dashboard/transactions
// All roles see all transactions on the dashboard feed
exports.getDashboardData = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({}).sort({ date: -1 });

  const serialized = transactions.map(serializeTransaction);

  res.status(200).json({
    success: true,
    data: serialized
  });
});

// ──────────────────────────────────────────────
// DASHBOARD SUMMARY API — Assignment Requirement #3
// ──────────────────────────────────────────────

/**
 * GET /api/v1/dashboard/summary
 * Returns aggregated dashboard data:
 * - totalIncome, totalExpenses, netBalance
 * - categoryBreakdown (income + expense by category)
 * - recentTransactions (last 5)
 * - monthlyTrends (last 6 months)
 */
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  // All roles see system-wide summary (this is aggregate, read-only data)
  const matchFilter = {};

  // ── 1. Totals: total income, total expenses, net balance ──
  const totalsResult = await Transaction.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  for (const item of totalsResult) {
    if (item._id === "INCOME") totalIncome = parseFloat(item.total.toString());
    if (item._id === "EXPENSE") totalExpenses = parseFloat(item.total.toString());
  }
  const netBalance = totalIncome - totalExpenses;

  // ── 2. Category-wise breakdown ──
  const categoryBreakdown = await Transaction.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: { $toDouble: "$total" },
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  // ── 3. Recent transactions (last 5) ──
  const recentTransactions = await Transaction.find(matchFilter)
    .sort({ date: -1 })
    .limit(5)
    .lean();

  const serializedRecent = recentTransactions.map((txn) => ({
    ...txn,
    amount: parseFloat(txn.amount?.toString() || 0),
  }));

  // ── 4. Monthly trends (last 6 months) ──
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTrends = await Transaction.aggregate([
    {
      $match: {
        ...matchFilter,
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Reshape monthly trends into { month: "2026-01", income: X, expenses: Y }
  const trendsMap = {};
  for (const item of monthlyTrends) {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
    if (!trendsMap[key]) {
      trendsMap[key] = { month: key, income: 0, expenses: 0 };
    }
    if (item._id.type === "INCOME") {
      trendsMap[key].income = parseFloat(item.total.toString());
    } else {
      trendsMap[key].expenses = parseFloat(item.total.toString());
    }
  }
  const trends = Object.values(trendsMap).sort((a, b) => a.month.localeCompare(b.month));

  // ── 5. Account balances ──
  const accounts = await Account.find(matchFilter).lean();
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance?.toString() || 0),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      totalIncome,
      totalExpenses,
      netBalance,
      totalBalance,
      categoryBreakdown,
      recentTransactions: serializedRecent,
      monthlyTrends: trends,
      accountCount: accounts.length,
    },
  });
});


// DELETE /api/v1/dashboard/accounts/:accountId
exports.deleteAccount = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const accountId = req.params.accountId;

  // Admin can delete any account; non-admin can only delete their own
  const findFilter = role === "admin"
    ? { _id: accountId }
    : { _id: accountId, userId: req.user._id };

  const account = await Account.findOne(findFilter);

  if (!account) {
    throw new ApiError(404, "Account not found or unauthorized");
  }

  // Delete associated transactions
  await Transaction.deleteMany({ accountId });

  await account.deleteOne();

  res.status(200).json({
    success: true,
    message: "Account and its transactions deleted successfully",
  });
});
