const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'On Duty', 'On Leave', 'Off Duty'],
    default: 'Available'
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  patients: {
    type: Number,
    default: 0
  },
  experience: String,
  qualifications: [String],
  schedule: {
    type: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
