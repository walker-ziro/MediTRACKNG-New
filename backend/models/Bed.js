const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance', 'Reserved'],
    default: 'Available'
  },
  bedType: {
    type: String,
    enum: ['Regular', 'ICU', 'Pediatric', 'Maternity', 'Emergency'],
    required: true
  },
  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  assignedDate: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes (bedNumber already indexed by unique: true)
bedSchema.index({ status: 1 });
bedSchema.index({ roomId: 1 });

module.exports = mongoose.model('Bed', bedSchema);
