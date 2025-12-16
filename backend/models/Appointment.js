const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  healthId: {
    type: String,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  patientName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'procedure', 'checkup'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: String,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
