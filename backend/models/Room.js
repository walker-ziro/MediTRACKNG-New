const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomType: {
    type: String,
    enum: ['General Ward', 'Private', 'ICU', 'Emergency', 'Maternity', 'Pediatric', 'Operation Theater'],
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance', 'Reserved'],
    default: 'Available'
  },
  amenities: [{
    type: String
  }],
  department: {
    type: String,
    enum: ['General', 'Surgery', 'Pediatrics', 'Obstetrics', 'Emergency', 'ICU', 'Orthopedics', 'Cardiology'],
    required: true
  },
  dailyRate: Number,
  notes: String
}, {
  timestamps: true
});

// Indexes
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ department: 1 });

module.exports = mongoose.model('Room', roomSchema);
