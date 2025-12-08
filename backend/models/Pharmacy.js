const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 100
  },
  price: {
    type: String,
    required: true
  },
  prescriptions: {
    type: Number,
    default: 0
  },
  dispensed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  description: String,
  manufacturer: String,
  expiryDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
