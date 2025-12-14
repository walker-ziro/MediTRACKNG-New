const mongoose = require('mongoose');

// Telemedicine - Virtual consultation system
const telemedicineSchema = new mongoose.Schema({
  consultationId: {
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
    phone: String,
    email: String
  },
  
  // Provider Information
  provider: {
    providerId: {
      type: String,
      required: true
    },
    name: String,
    specialization: String,
    facilityName: String
  },
  
  // Appointment Details
  scheduledDate: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in minutes
    default: 30
  },
  
  // Consultation Type
  consultationType: {
    type: String,
    enum: ['Video', 'Audio', 'Chat', 'Phone'],
    required: true
  },
  
  // Reason for Visit
  chiefComplaint: String,
  
  symptoms: [String],
  
  urgency: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine'
  },
  
  // Status
  status: {
    type: String,
    enum: ['Scheduled', 'Waiting', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled'],
    default: 'Scheduled'
  },
  
  // Virtual Room
  meetingRoom: {
    roomId: String,
    meetingUrl: String,
    joinToken: String,
    provider: Object,
    password: String
  },
  
  // Consultation Notes
  clinicalNotes: {
    subjective: String,      // Patient's complaints
    objective: String,        // Provider's observations
    assessment: String,       // Diagnosis
    plan: String             // Treatment plan
  },
  
  // Vitals (if available via devices)
  vitals: {
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  
  // Diagnosis
  diagnosis: [String],
  
  // Prescriptions
  prescriptions: [{
    prescriptionId: String,
    medications: [String]
  }],
  
  // Lab Orders
  labOrders: [{
    testName: String,
    urgency: String,
    instructions: String
  }],
  
  // Referrals
  referrals: [{
    specialization: String,
    providerName: String,
    facilityName: String,
    reason: String,
    urgency: String
  }],
  
  // Follow-up
  followUp: {
    required: { type: Boolean },
    scheduledDate: Date,
    type: { type: String }, // 'Telemedicine', 'In-Person'
    instructions: String
  },
  
  // Attachments (Patient uploaded documents)
  attachments: [{
    fileName: String,
    fileType: String,
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: String // 'Patient' or 'Provider'
  }],
  
  // Timing
  startedAt: Date,
  endedAt: Date,
  actualDuration: Number, // in minutes
  
  // Quality & Feedback
  connectionQuality: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor']
  },
  
  patientFeedback: {
    rating: Number, // 1-5
    comments: String,
    submittedAt: Date
  },
  
  // Payment
  payment: {
    amount: Number,
    currency: {
      type: String,
      default: 'NGN'
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    method: String,
    transactionId: String,
    paidAt: Date
  },
  
  // Insurance
  insurance: {
    covered: Boolean,
    provider: String,
    policyNumber: String,
    claimNumber: String
  },
  
  // Cancellation
  cancelledBy: String,
  cancelledAt: Date,
  cancellationReason: String,
  
  // Related Encounter (if follow-up from in-person visit)
  relatedEncounterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Encounter'
  },
  
  notes: String
}, {
  timestamps: true
});

// Generate unique consultation ID
telemedicineSchema.pre('save', async function(next) {
  if (!this.consultationId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Telemedicine').countDocuments({
      consultationId: new RegExp(`^TLM-${dateStr}`)
    });
    this.consultationId = `TLM-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate actual duration when consultation ends
telemedicineSchema.pre('save', function(next) {
  if (this.startedAt && this.endedAt && !this.actualDuration) {
    const durationMs = this.endedAt - this.startedAt;
    this.actualDuration = Math.round(durationMs / 60000); // Convert to minutes
  }
  next();
});

// Methods
telemedicineSchema.methods.start = function() {
  this.status = 'In Progress';
  this.startedAt = new Date();
};

telemedicineSchema.methods.complete = function() {
  this.status = 'Completed';
  this.endedAt = new Date();
};

telemedicineSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'Cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
};

// Indexes
telemedicineSchema.index({ 'patient.healthId': 1, scheduledDate: -1 });
telemedicineSchema.index({ 'provider.providerId': 1, scheduledDate: -1 });
telemedicineSchema.index({ status: 1, scheduledDate: 1 });
telemedicineSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Telemedicine', telemedicineSchema);
