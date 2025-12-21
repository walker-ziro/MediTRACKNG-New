const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    sparse: true
  },
  healthId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  resultDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'Critical'],
    default: 'Routine'
  },
  orderedBy: {
    type: String,
    required: true
  },
  results: String,
  notes: String
}, {
  timestamps: true
});

// Generate unique order ID before save
laboratorySchema.pre('save', async function(next) {
  if (!this.orderId) {
    this.orderId = `LAB-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Laboratory', laboratorySchema);
