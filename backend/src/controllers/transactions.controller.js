const Transaction = require("../models/transaction.model");
const Account = require("../models/account.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const mongoose = require("mongoose");
const { Decimal128 } = mongoose.Types;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: parse Decimal128 and format amount
const serializeAmount = (txn) => {
  const obj = txn._doc || txn;
  return {
    ...obj,
    amount: parseFloat(obj.amount?.toString() || 0),
  };
};

// Create Transaction
exports.createTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = req.body;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const account = await Account.findOne({
    _id: data.accountId,
    userId,
  });
  if (!account) throw new ApiError(404, "Account not found");

  // Convert amount to Decimal128
  const amountDecimal = Decimal128.fromString(data.amount.toString());

  // Calculate new balance
  const balanceChange = data.type === "EXPENSE"
    ? -parseFloat(data.amount)
    : parseFloat(data.amount);

  const newBalance = parseFloat(account.balance.toString()) + balanceChange;

  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.create(
      [{
        ...data,
        userId,
        amount: amountDecimal,
        nextRecurringDate:
          data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
      }],
      { session }
    );

    await Account.updateOne(
      { _id: data.accountId },
      { $set: { balance: newBalance } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: serializeAmount(transaction[0]),
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Transaction failed: " + err.message);
  }
});


// Get a transaction
exports.getTransaction = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid transaction ID format");
  }

  // Only Analyst & Admin reach here (Viewer is blocked at route level by authorize middleware)
  const filter = (role === "admin" || role === "analyst")
    ? { _id: id }
    : { _id: id, userId: req.user._id };

  const txn = await Transaction.findOne(filter);
  if (!txn) throw new ApiError(404, "Transaction not found");

  res.status(200).json({ success: true, data: serializeAmount(txn) });
});

// Update Transaction
exports.updateTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const newData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid transaction ID format");
  }

  const oldTxn = await Transaction.findOne({ _id: id, userId }).populate("accountId");
  if (!oldTxn) throw new ApiError(404, "Transaction not found");

  const oldAmount = parseFloat(oldTxn.amount.toString());
  const newAmount = newData.amount ? parseFloat(newData.amount) : oldAmount;
  const oldType = oldTxn.type;
  const newType = newData.type || oldType;

  const oldChange = oldType === "EXPENSE" ? -oldAmount : oldAmount;
  const newChange = newType === "EXPENSE" ? -newAmount : newAmount;
  const netChange = newChange - oldChange;

  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const updatePayload = { ...newData };
    if (newData.amount) {
      updatePayload.amount = Decimal128.fromString(newData.amount.toString());
    }
    if (newData.isRecurring !== undefined) {
      updatePayload.nextRecurringDate =
        newData.isRecurring && newData.recurringInterval
          ? calculateNextRecurringDate(newData.date || oldTxn.date, newData.recurringInterval)
          : null;
    }

    const updated = await Transaction.findByIdAndUpdate(id, updatePayload, { new: true, session });

    if (netChange !== 0) {
      await Account.findByIdAndUpdate(
        newData.accountId || oldTxn.accountId,
        { $inc: { balance: netChange } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: serializeAmount(updated) });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Update failed: " + err.message);
  }
});

// Delete Transaction
exports.deleteTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid transaction ID format");
  }

  const txn = await Transaction.findOne({ _id: id, userId });
  if (!txn) throw new ApiError(404, "Transaction not found");

  // Reverse the balance change
  const balanceReversal = txn.type === "EXPENSE"
    ? parseFloat(txn.amount.toString())
    : -parseFloat(txn.amount.toString());

  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    await Transaction.findByIdAndDelete(id).session(session);

    await Account.findByIdAndUpdate(
      txn.accountId,
      { $inc: { balance: balanceReversal } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Transaction deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Delete failed: " + err.message);
  }
});

// Get all transactions (SECURED — allowlisted query params only)
// Only Analyst & Admin can access (Viewer is blocked at route level)
exports.getUserTransactions = asyncHandler(async (req, res) => {
  const role = req.user.role;

  // ── Allowlisted filters (prevents NoSQL injection) ──
  const { accountId, type, category, startDate, endDate, page, limit: limitParam, search } = req.query;

  // Both Analyst & Admin see all transactions (Viewer never reaches here)
  const filter = (role === "admin" || role === "analyst") ? {} : { userId: req.user._id };

  if (accountId && mongoose.Types.ObjectId.isValid(accountId)) {
    filter.accountId = accountId;
  }
  if (type && ["INCOME", "EXPENSE"].includes(type)) {
    filter.type = type;
  }
  if (category) {
    filter.category = category;
  }
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (search) {
    filter.description = { $regex: search, $options: "i" };
  }

  // ── Pagination ──
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitParam) || 20));
  const skip = (pageNum - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: transactions.map(serializeAmount),
    pagination: {
      page: pageNum,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Helper: calculate recurring date
const calculateNextRecurringDate = (startDate, interval) => {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
};


// Scan Receipt
exports.scanReceipt = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "../../public/temp", file.originalname);
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )

      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If it's not a receipt, return an empty object
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.mimetype,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);

      // Clean up temp file
      fs.unlinkSync(filePath);

      return res.status(200).json({
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      });
    } catch (parseError) {
      return res.status(500).json({ error: "Invalid response format from Gemini" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to scan receipt" });
  }
};