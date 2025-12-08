const mongoose = require('mongoose');

// Healthcare Facility Model for Multi-Facility System
const facilitySchema = new mongoose.Schema({
  facilityId: {
    type: String,
    required: true,
    unique: true,
    index: true
    // Format: FAC-STATE-XXXX
  },
  
  name: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: [
      'Federal Tertiary Hospital',
      'State Tertiary Hospital',
      'General Hospital',
      'Primary Healthcare Centre',
      'Private Hospital',
      'Specialist Clinic',
      'Diagnostic Centre',
      'Pharmacy',
      'Laboratory'
    ],
    required: true
  },
  
  accreditation: {
    status: {
      type: String,
      enum: ['Accredited', 'Pending', 'Suspended', 'Revoked'],
      default: 'Pending'
    },
    accreditationNumber: String,
    expiryDate: Date,
    accreditingBody: String // e.g., FMOH, Medical & Dental Council
  },
  
  location: {
    address: String,
    city: String,
    lga: String,
    state: {
      type: String,
      required: true
    },
    geolocation: {
      latitude: Number,
      longitude: Number
    }
  },
  
  contact: {
    phone: String,
    email: String,
    website: String
  },
  
  // System Integration
  systemIntegration: {
    hasHMS: Boolean, // Has existing Hospital Management System
    hmsType: String, // e.g., "OpenMRS", "DHIS2", "Custom"
    apiEndpoint: String,
    apiKey: String,
    lastSyncDate: Date
  },
  
  services: [{
    type: String // e.g., "Emergency", "Maternity", "Surgery", "Radiology"
  }],
  
  operatingHours: {
    type: String
  },
  
  beds: {
    total: Number,
    available: Number
  },
  
  // Subscription (for private facilities)
  subscription: {
    tier: {
      type: String,
      enum: ['Free', 'Basic', 'Standard', 'Premium'],
      default: 'Free'
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Expired'],
      default: 'Active'
    },
    startDate: Date,
    expiryDate: Date,
    monthlyFee: Number
  },
  
  // Registration
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
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
facilitySchema.index({ 'location.state': 1 });
facilitySchema.index({ type: 1 });
facilitySchema.index({ 'subscription.status': 1 });

facilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Facility', facilitySchema);
