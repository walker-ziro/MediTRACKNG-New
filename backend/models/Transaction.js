const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Patient Services', 'Supplies', 'Payroll', 'Maintenance', 'Utilities', 'Insurance', 'Equipment', 'Other'],
    required: true
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    unique: true
  },
  relatedBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
// Note: reference field already has unique index from schema definition

module.exports = mongoose.model('Transaction', transactionSchema);
