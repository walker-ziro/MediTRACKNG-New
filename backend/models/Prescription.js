const mongoose = require('mongoose');

// E-Prescription system for digital prescription management
const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Patient Information
  patient: {
    healthId: {
      type: String,
      required: true,
      index: true
    },
    name: String,
    age: Number,
    weight: Number, // For dosage calculation
    allergies: [String]
  },
  
  // Prescribing Provider
  provider: {
    providerId: {
      type: String,
      required: true
    },
    name: String,
    licenseNumber: String,
    specialization: String,
    facility: {
      facilityId: String,
      name: String
    }
  },
  
  // Medications
  medications: [{
    drugName: {
      type: String,
      required: true
    },
    genericName: String,
    brandName: String,
    dosage: {
      amount: String,
      unit: String      // mg, ml, tablets, etc.
    },
    form: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Other']
    },
    frequency: {
      type: String,
      // Once daily, Twice daily, Three times daily, etc.
    },
    route: {
      type: String,
      enum: ['Oral', 'Topical', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Inhalation', 'Rectal', 'Ophthalmic', 'Otic', 'Nasal']
    },
    duration: {
      value: Number,
      unit: String      // days, weeks, months
    },
    quantity: Number,   // Total quantity to dispense
    refills: {
      type: Number,
      default: 0
    },
    instructions: String, // Special instructions
    
    // Drug Safety
    interactions: [String],    // Potential drug interactions
    contraindications: [String], // Conditions that contraindicate use
    sideEffects: [String],
    warnings: [String],
    
    // Status
    dispensed: {
      type: Boolean,
      default: false
    },
    dispensedAt: Date,
    dispensedBy: {
      pharmacyId: String,
      pharmacyName: String,
      pharmacistName: String
    }
  }],
  
  // Clinical Context
  diagnosis: String,
  clinicalNotes: String,
  encounterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Encounter'
  },
  
  // Prescription Status
  status: {
    type: String,
    enum: ['Active', 'Dispensed', 'Partially Dispensed', 'Cancelled', 'Expired', 'On Hold'],
    default: 'Active'
  },
  
  // Validity
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  
  // Pharmacy Integration
  pharmacy: {
    pharmacyId: String,
    pharmacyName: String,
    sent: Boolean,
    sentAt: Date
  },
  
  // Digital Signature
  digitalSignature: {
    signed: Boolean,
    signedAt: Date,
    signatureHash: String
  },
  
  // Insurance
  insurance: {
    covered: Boolean,
    insuranceProvider: String,
    policyNumber: String,
    copay: Number,
    claimNumber: String
  },
  
  // Tracking
  printedCount: {
    type: Number,
    default: 0
  },
  lastPrintedAt: Date,
  
  // Special Flags
  isControlledSubstance: {
    type: Boolean,
    default: false
  },
  isPriority: {
    type: Boolean,
    default: false
  },
  isTelemedicine: {
    type: Boolean,
    default: false
  },
  
  // Cancellation
  cancelledBy: String,
  cancelledAt: Date,
  cancellationReason: String,
  
  notes: String
}, {
  timestamps: true
});

// Generate unique prescription ID
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Prescription').countDocuments({
      prescriptionId: new RegExp(`^RX-${dateStr}`)
    });
    this.prescriptionId = `RX-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Set validity (30 days by default if not set)
  if (!this.validUntil) {
    this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Check if prescription is expired
prescriptionSchema.methods.isExpired = function() {
  return this.validUntil && new Date() > this.validUntil;
};

// Check if all medications are dispensed
prescriptionSchema.methods.isFullyDispensed = function() {
  return this.medications.every(med => med.dispensed);
};

// Indexes
prescriptionSchema.index({ 'patient.healthId': 1, status: 1, createdAt: -1 });
prescriptionSchema.index({ 'provider.providerId': 1, createdAt: -1 });
prescriptionSchema.index({ 'pharmacy.pharmacyId': 1, status: 1 });
prescriptionSchema.index({ status: 1, validUntil: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
