const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
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

module.exports = mongoose.model('Laboratory', laboratorySchema);
