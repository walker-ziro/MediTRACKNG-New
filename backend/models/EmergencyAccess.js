const mongoose = require('mongoose');

// Emergency Access - Rapid patient lookup for emergency responders
const emergencyAccessSchema = new mongoose.Schema({
  accessId: {
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
    photo: String
  },
  
  // Emergency Responder
  responder: {
    responderId: String,
    name: String,
    organization: String, // Ambulance Service, Hospital ER, etc.
    licenseNumber: String,
    phone: String
  },
  
  // Access Details
  accessType: {
    type: String,
    enum: ['Emergency Lookup', 'Ambulance Access', 'ER Access', 'Trauma Access'],
    required: true
  },
  
  accessReason: {
    type: String,
    required: true
  },
  
  // Incident Information
  incident: {
    type: String, // 'Accident', 'Cardiac Arrest', 'Trauma', 'Unconscious', etc.
    location: String,
    severity: {
      type: String,
      enum: ['Critical', 'Severe', 'Moderate', 'Mild']
    },
    timestamp: Date
  },
  
  // Accessed Information
  accessedData: [{
    dataType: String, // 'Medical History', 'Allergies', 'Medications', 'Blood Type', etc.
    accessedAt: Date
  }],
  
  // Critical Patient Info (Quick View)
  criticalInfo: {
    bloodType: String,
    genotype: String,
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    emergencyContacts: [{
      name: String,
      relationship: String,
      phone: String
    }],
    specialNotes: String // DNR, Pacemaker, etc.
  },
  
  // Vitals at Scene
  sceneVitals: {
    consciousness: String, // 'Alert', 'Responsive', 'Unresponsive'
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    temperature: Number,
    glasgowComaScale: Number,
    painLevel: Number
  },
  
  // Treatment Given
  emergencyTreatment: [{
    treatment: String,
    medication: String,
    dosage: String,
    route: String,
    time: Date,
    givenBy: String
  }],
  
  // Transport Information
  transport: {
    ambulanceId: String,
    departureTime: Date,
    arrivalTime: Date,
    destinationFacility: String,
    facilityId: String,
    eta: Date
  },
  
  // Access Status
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Transferred', 'Cancelled'],
    default: 'Active'
  },
  
  // Handover
  handover: {
    handedOverTo: String, // ER Doctor, Trauma Team, etc.
    facilityName: String,
    handoverTime: Date,
    notes: String
  },
  
  // Geolocation
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  
  // Consent Override
  consentOverride: {
    overridden: Boolean,
    reason: String, // 'Life-threatening emergency', 'Patient unconscious', etc.
    authorizedBy: String,
    timestamp: Date
  },
  
  // Audit Trail
  accessLog: [{
    action: String,
    performedBy: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    deviceInfo: String
  }],
  
  // Follow-up
  outcome: {
    status: String, // 'Stabilized', 'Admitted', 'Transferred', 'Deceased'
    notes: String,
    admittedTo: String,
    dischargeTime: Date
  },
  
  // Duration
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in minutes
  
  notes: String
}, {
  timestamps: true
});

// Generate unique access ID
emergencyAccessSchema.pre('save', async function(next) {
  if (!this.accessId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('EmergencyAccess').countDocuments({
      accessId: new RegExp(`^EMG-${dateStr}`)
    });
    this.accessId = `EMG-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate duration on completion
emergencyAccessSchema.pre('save', function(next) {
  if (this.endTime && this.startTime && !this.duration) {
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.round(durationMs / 60000); // Convert to minutes
  }
  next();
});

// Geospatial index for location-based queries
emergencyAccessSchema.index({ location: '2dsphere' });

// Methods
emergencyAccessSchema.methods.logAccess = function(dataType) {
  this.accessedData.push({
    dataType,
    accessedAt: new Date()
  });
};

emergencyAccessSchema.methods.recordVitals = function(vitals) {
  this.sceneVitals = { ...this.sceneVitals, ...vitals };
};

emergencyAccessSchema.methods.addTreatment = function(treatment) {
  this.emergencyTreatment.push({
    ...treatment,
    time: new Date()
  });
};

emergencyAccessSchema.methods.initiateTransport = function(transportInfo) {
  this.transport = {
    ...transportInfo,
    departureTime: new Date()
  };
};

emergencyAccessSchema.methods.completeHandover = function(handoverInfo) {
  this.handover = {
    ...handoverInfo,
    handoverTime: new Date()
  };
  this.status = 'Completed';
  this.endTime = new Date();
};

emergencyAccessSchema.methods.addAuditLog = function(action, performedBy, deviceInfo) {
  this.accessLog.push({
    action,
    performedBy,
    timestamp: new Date(),
    deviceInfo
  });
};

// Static methods for emergency lookup
emergencyAccessSchema.statics.quickLookup = async function(healthId) {
  const Patient = mongoose.model('Patient');
  const patient = await Patient.findOne({ healthId });
  
  if (!patient) {
    throw new Error('Patient not found');
  }
  
  // Return critical information only
  return {
    healthId: patient.healthId,
    name: `${patient.firstName} ${patient.lastName}`,
    dateOfBirth: patient.dateOfBirth,
    age: Math.floor((new Date() - new Date(patient.dateOfBirth)) / 31557600000),
    gender: patient.gender,
    bloodType: patient.bloodType,
    genotype: patient.genotype,
    allergies: patient.allergies || [],
    chronicConditions: patient.chronicConditions || [],
    currentMedications: patient.currentMedications || [],
    emergencyContact: patient.emergencyContact,
    photo: patient.photo
  };
};

// Indexes
emergencyAccessSchema.index({ 'patient.healthId': 1, createdAt: -1 });
emergencyAccessSchema.index({ 'responder.responderId': 1, createdAt: -1 });
emergencyAccessSchema.index({ status: 1, createdAt: -1 });
emergencyAccessSchema.index({ 'incident.severity': 1, status: 1 });

module.exports = mongoose.model('EmergencyAccess', emergencyAccessSchema);
