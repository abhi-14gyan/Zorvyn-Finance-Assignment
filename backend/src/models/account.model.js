const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  balance: {
    type: mongoose.Decimal128,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {timestamps: true});

module.exports = mongoose.model('Account', accountSchema);
