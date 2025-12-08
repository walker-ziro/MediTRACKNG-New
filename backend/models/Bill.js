const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  healthId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Transfer', 'Insurance'],
    required: true
  },
  paymentDate: Date,
  description: String,
  items: [{
    name: String,
    quantity: Number,
    price: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
