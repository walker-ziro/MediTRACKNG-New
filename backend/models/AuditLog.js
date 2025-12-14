const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  accessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'accessorModel', // Dynamic reference
    required: true
  },
  accessorModel: {
    type: String,
    required: true,
    enum: ['Provider', 'Patient', 'Admin'],
    default: 'Provider'
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: false // Made optional for patient portal access
  },
  actionType: {
    type: String,
    enum: ['View', 'Create', 'Update', 'Delete', 'Export', 'Print', 'Share', 'Emergency Access'],
    required: true
  },
  resourceType: {
    type: String,
    enum: ['Demographics', 'Medical History', 'Medications', 'Lab Results', 'Radiology', 'Clinical Notes', 'Immunizations', 'Vital Signs', 'Full Record'],
    required: true
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  consentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consent'
  },
  wasEmergencyAccess: {
    type: Boolean,
    default: false
  },
  emergencyJustification: String,
  accessResult: {
    type: String,
    enum: ['Success', 'Denied', 'Partial', 'Error'],
    required: true
  },
  denialReason: String,
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  dataAccessed: {
    fields: [String],
    recordCount: Number
  },
  modifications: {
    fieldName: String,
    oldValue: String,
    newValue: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  duration: Number, // milliseconds
  suspicious: {
    type: Boolean,
    default: false
  },
  suspiciousReason: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ patient: 1, timestamp: -1 });
auditLogSchema.index({ accessedBy: 1, timestamp: -1 });
auditLogSchema.index({ facility: 1, timestamp: -1 });
auditLogSchema.index({ suspicious: 1, reviewedBy: 1 });
auditLogSchema.index({ timestamp: -1 });

// Flag suspicious activities
auditLogSchema.pre('save', function(next) {
  // Flag if emergency access without consent
  if (this.wasEmergencyAccess && !this.consentId) {
    this.suspicious = true;
    this.suspiciousReason = 'Emergency access without prior consent';
  }
  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
