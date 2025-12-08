const mongoose = require('mongoose');

// Consent Management for Patient Data Access
const consentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility'
  },
  
  consentType: {
    type: String,
    enum: [
      'Full Access',           // Access to complete medical history
      'Emergency Only',        // Only during emergencies
      'Specific Encounter',    // For a specific visit/encounter
      'Limited Period',        // Time-bound access
      'Research',              // For medical research
      'Insurance',             // For insurance claims
      'Referral'               // For referral to another provider
    ],
    required: true
  },
  
  accessLevel: {
    type: String,
    enum: ['Read Only', 'Read & Write', 'Full Control'],
    default: 'Read Only'
  },
  
  // Scope of consent
  scope: {
    demographics: {
      type: Boolean,
      default: true
    },
    medicalHistory: {
      type: Boolean,
      default: false
    },
    medications: {
      type: Boolean,
      default: false
    },
    labResults: {
      type: Boolean,
      default: false
    },
    radiology: {
      type: Boolean,
      default: false
    },
    clinicalNotes: {
      type: Boolean,
      default: false
    }
  },
  
  // Time constraints
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  
  // Purpose
  purpose: {
    type: String,
    required: true
  },
  
  // Consent given by
  consentGivenBy: {
    type: String,
    enum: ['Patient', 'Guardian', 'Next of Kin', 'Legal Representative'],
    default: 'Patient'
  },
  
  // Digital signature/verification
  verificationMethod: {
    type: String,
    enum: ['Biometric', 'OTP', 'Digital Signature', 'Verbal', 'Written'],
    required: true
  },
  
  verificationData: String, // Hash or reference
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Revoked', 'Expired', 'Pending'],
    default: 'Active'
  },
  
  revokedAt: Date,
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  revokedReason: String,
  
  // Audit
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
consentSchema.index({ patient: 1, provider: 1 });
consentSchema.index({ patient: 1, facility: 1 });
consentSchema.index({ status: 1 });
consentSchema.index({ validUntil: 1 });

// Auto-expire consent
consentSchema.pre('save', function(next) {
  if (this.validUntil && this.validUntil < new Date() && this.status === 'Active') {
    this.status = 'Expired';
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Consent', consentSchema);
