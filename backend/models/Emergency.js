const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  healthId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Moderate', 'Low'],
    required: true
  },
  status: {
    type: String,
    enum: ['Waiting', 'Triaged', 'In Treatment', 'Discharged'],
    default: 'Waiting'
  },
  arrivalTime: {
    type: Date,
    default: Date.now
  },
  assignedTo: {
    type: String
  },
  vitalSigns: {
    bp: String,
    hr: String,
    temp: String,
    spo2: String,
    respiratoryRate: String
  },
  allergies: [String],
  medications: [String],
  notes: String,
  diagnosis: String,
  treatment: String,
  dischargeTime: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
emergencySchema.index({ healthId: 1 });
emergencySchema.index({ severity: 1 });
emergencySchema.index({ status: 1 });
emergencySchema.index({ arrivalTime: 1 });

module.exports = mongoose.model('Emergency', emergencySchema);
