const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'], // Adjust based on your app's values
    required: true
  },
  amount: {
    type: mongoose.Decimal128,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  receiptUrl: {
    type: String,
    required: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'], // Adjust as needed
    required: false
  },
  nextRecurringDate: {
    type: Date,
    required: false
  },
  lastProcessed: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'], // Adjust as needed
    default: 'COMPLETED'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  }
}, {timestamps: true});

module.exports = mongoose.model('Transaction', transactionSchema);
