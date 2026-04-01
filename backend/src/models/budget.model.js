const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  amount: {
    type: mongoose.Decimal128,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One budget per user
  },
  lastAlertSent: {
    type: Date
  }
}, {timestamps: true});

module.exports = mongoose.model('Budget', budgetSchema);
