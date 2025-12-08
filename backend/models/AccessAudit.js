const mongoose = require('mongoose');

// Audit Trail for all access to patient records
const accessAuditSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  accessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility'
  },
  
  accessType: {
    type: String,
    enum: ['View', 'Create', 'Update', 'Delete', 'Export', 'Print'],
    required: true
  },
  
  resourceType: {
    type: String,
    enum: [
      'Demographics',
      'Medical History',
      'Medications',
      'Lab Results',
      'Radiology',
      'Clinical Notes',
      'Immunizations',
      'Full Record'
    ],
    required: true
  },
  
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  // Context
  purpose: String,
  
  consentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consent'
  },
  
  // Was this an emergency access?
  emergencyAccess: {
    type: Boolean,
    default: false
  },
  
  emergencyReason: String,
  
  // Technical details
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  
  // Data accessed (summary)
  dataSnapshot: {
    fields: [String],
    recordCount: Number
  },
  
  // Result
  accessResult: {
    type: String,
    enum: ['Success', 'Denied', 'Partial', 'Error'],
    default: 'Success'
  },
  
  denialReason: String,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient queries
accessAuditSchema.index({ patient: 1, timestamp: -1 });
accessAuditSchema.index({ accessedBy: 1, timestamp: -1 });
accessAuditSchema.index({ facility: 1, timestamp: -1 });
accessAuditSchema.index({ emergencyAccess: 1 });

// TTL index - keep audit logs for 7 years (legal requirement)
accessAuditSchema.index({ timestamp: 1 }, { expireAfterSeconds: 220898400 }); // 7 years

module.exports = mongoose.model('AccessAudit', accessAuditSchema);
