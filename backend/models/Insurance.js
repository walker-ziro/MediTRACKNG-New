const mongoose = require('mongoose');

// Insurance - NHIS and private insurance integration
const insuranceSchema = new mongoose.Schema({
  policyId: {
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
    dateOfBirth: Date
  },
  
  // Insurance Provider
  provider: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['NHIS', 'Private', 'Corporate', 'International'],
      required: true
    },
    code: String, // Provider code for NHIS
    contactEmail: String,
    contactPhone: String,
    address: String
  },
  
  // Policy Details
  policyNumber: {
    type: String,
    required: true,
    index: true
  },
  
  policyType: {
    type: String,
    enum: ['Individual', 'Family', 'Corporate', 'Group'],
    required: true
  },
  
  // Coverage Period
  effectiveDate: {
    type: Date,
    required: true
  },
  
  expiryDate: {
    type: Date,
    required: true
  },
  
  // Policy Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Expired', 'Cancelled', 'Pending Verification'],
    default: 'Pending Verification'
  },
  
  // Policy Holder (if different from patient)
  policyHolder: {
    name: String,
    relationship: String, // Self, Spouse, Parent, Employer, etc.
    employerId: String,
    employerName: String
  },
  
  // Dependents (for family plans)
  dependents: [{
    healthId: String,
    name: String,
    relationship: String,
    dateOfBirth: Date
  }],
  
  // Coverage Details
  coverage: {
    outpatient: Boolean,
    inpatient: Boolean,
    emergency: Boolean,
    surgery: Boolean,
    maternity: Boolean,
    dental: Boolean,
    optical: Boolean,
    pharmacy: Boolean,
    laboratory: Boolean,
    imaging: Boolean,
    physiotherapy: Boolean,
    mentalHealth: Boolean
  },
  
  // Financial Limits
  limits: {
    annualLimit: Number,
    perVisitLimit: Number,
    emergencyLimit: Number,
    surgeryLimit: Number,
    maternityLimit: Number,
    dentalLimit: Number,
    opticalLimit: Number
  },
  
  // Utilized Amounts
  utilized: {
    totalUtilized: {
      type: Number,
      default: 0
    },
    outpatientUtilized: {
      type: Number,
      default: 0
    },
    inpatientUtilized: {
      type: Number,
      default: 0
    },
    emergencyUtilized: {
      type: Number,
      default: 0
    },
    surgeryUtilized: {
      type: Number,
      default: 0
    },
    maternityUtilized: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  
  // Copayment/Deductible
  costSharing: {
    deductible: Number,
    deductibleMet: {
      type: Number,
      default: 0
    },
    copayPercentage: Number, // e.g., 10% patient pays
    maximumOOP: Number // Out of pocket maximum
  },
  
  // Approved Facilities
  approvedFacilities: [{
    facilityId: String,
    facilityName: String,
    facilityType: String,
    isPrimary: Boolean
  }],
  
  // Pre-authorization
  requiresPreAuth: Boolean,
  
  preAuthProcedures: [String], // Procedures requiring pre-authorization
  
  // Claims History
  claims: [{
    claimId: String,
    encounterId: mongoose.Schema.Types.ObjectId,
    facilityName: String,
    serviceDate: Date,
    claimDate: Date,
    amount: Number,
    approvedAmount: Number,
    patientShare: Number,
    insuranceShare: Number,
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Partially Approved', 'Denied', 'Paid']
    },
    denialReason: String,
    processedDate: Date
  }],
  
  // Verification
  verification: {
    verified: Boolean,
    verifiedBy: String,
    verifiedAt: Date,
    verificationMethod: String, // API, Manual, Document
    lastVerificationDate: Date,
    nextVerificationDue: Date
  },
  
  // NHIS Specific
  nhisDetails: {
    enrolleeId: String,
    hmoName: String,
    hmoCode: String,
    principalName: String,
    principalId: String,
    packageCode: String,
    packageName: String
  },
  
  // Documents
  documents: [{
    documentType: String, // ID Card, Certificate, Authorization
    documentUrl: String,
    uploadedAt: Date,
    expiryDate: Date
  }],
  
  // Contact for Inquiries
  claimsContact: {
    name: String,
    phone: String,
    email: String
  },
  
  notes: String
}, {
  timestamps: true
});

// Generate unique policy ID
insuranceSchema.pre('save', async function(next) {
  if (!this.policyId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Insurance').countDocuments({
      policyId: new RegExp(`^INS-${dateStr}`)
    });
    this.policyId = `INS-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Check expiry status
insuranceSchema.pre('save', function(next) {
  if (this.expiryDate < new Date() && this.status === 'Active') {
    this.status = 'Expired';
  }
  next();
});

// Methods
insuranceSchema.methods.isActive = function() {
  return this.status === 'Active' && this.expiryDate > new Date();
};

insuranceSchema.methods.isCovered = function(serviceType) {
  return this.coverage[serviceType] === true;
};

insuranceSchema.methods.getRemainingLimit = function(limitType = 'annualLimit') {
  if (!this.limits[limitType]) return null;
  
  const utilized = limitType === 'annualLimit' 
    ? this.utilized.totalUtilized 
    : this.utilized[`${limitType.replace('Limit', '')}Utilized`] || 0;
  
  return Math.max(0, this.limits[limitType] - utilized);
};

insuranceSchema.methods.addClaim = function(claimData) {
  this.claims.push(claimData);
  
  // Update utilized amounts
  this.utilized.totalUtilized += claimData.insuranceShare;
  this.utilized.lastUpdated = new Date();
};

insuranceSchema.methods.verify = function(verifiedBy, method) {
  this.verification.verified = true;
  this.verification.verifiedBy = verifiedBy;
  this.verification.verifiedAt = new Date();
  this.verification.verificationMethod = method;
  this.verification.lastVerificationDate = new Date();
  
  // Set next verification due (90 days)
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + 90);
  this.verification.nextVerificationDue = nextDue;
  
  this.status = 'Active';
};

// Indexes
insuranceSchema.index({ 'patient.healthId': 1, status: 1 });
insuranceSchema.index({ policyNumber: 1 });
insuranceSchema.index({ 'provider.name': 1, status: 1 });
insuranceSchema.index({ expiryDate: 1 });
insuranceSchema.index({ 'nhisDetails.enrolleeId': 1 });

module.exports = mongoose.model('Insurance', insuranceSchema);
