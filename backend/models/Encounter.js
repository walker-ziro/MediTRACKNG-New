const mongoose = require('mongoose');

// Clinical encounters (visits) - for multi-facility national system
const encounterSchema = new mongoose.Schema({
  encounterId: {
    type: String,
    unique: true,
    required: true
  },
  
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  
  // Consent used for this encounter
  consentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consent'
  },
  
  encounterType: {
    type: String,
    enum: [
      'Outpatient Visit',
      'Emergency',
      'Inpatient Admission',
      'Surgical Procedure',
      'Diagnostic Test',
      'Vaccination',
      'Telehealth',
      'Follow-up',
      'Referral',
      'Health Screening'
    ],
    required: true
  },
  
  encounterDate: {
    type: Date,
    required: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled'
  },
  
  // Clinical data
  chiefComplaint: String,
  
  vitalSigns: {
    temperature: Number,
    bloodPressure: String,
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  
  assessment: String,
  
  diagnosis: [{
    code: String, // ICD-10 code
    description: String,
    type: {
      type: String,
      enum: ['Primary', 'Secondary', 'Differential']
    }
  }],
  
  procedures: [{
    code: String, // CPT code
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider'
    }
  }],
  
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    route: String
  }],
  
  labOrders: [{
    testName: String,
    orderedAt: Date,
    status: String,
    link: String
  }],
  
  radiologyOrders: [{
    studyType: String,
    orderedAt: Date,
    status: String
  }],
  
  clinicalNotes: String,
  
  dischargeSummary: String,
  
  // Follow-up
  followUpDate: Date,
  followUpInstructions: String,
  
  // Billing
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  
  totalCost: Number,
  
  // Data sharing
  sharedWith: [{
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    sharedAt: Date,
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider'
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Generate unique encounter ID
encounterSchema.pre('save', async function(next) {
  if (!this.encounterId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await mongoose.model('Encounter').countDocuments({
      encounterId: new RegExp(`^ENC${year}${month}${day}`)
    });
    
    this.encounterId = `ENC${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes for efficient queries
encounterSchema.index({ patient: 1, encounterDate: -1 });
encounterSchema.index({ facility: 1, encounterDate: -1 });
encounterSchema.index({ provider: 1, encounterDate: -1 });
encounterSchema.index({ status: 1 });

module.exports = mongoose.model('Encounter', encounterSchema);
