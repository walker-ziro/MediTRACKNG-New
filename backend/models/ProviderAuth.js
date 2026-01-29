const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Healthcare Provider Authentication
const providerAuthSchema = new mongoose.Schema({
  providerId: {
    type: String,
    unique: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Professional Details
  specialization: {
    type: String,
    default: 'General Practice'
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseExpiryDate: Date,
  
  // Facility Affiliation
  facilityId: {
    type: String,
    default: 'UNASSIGNED'
  },
  facilityName: String,
  department: String,
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['Doctor', 'Nurse', 'Pharmacist', 'Lab Technician', 'Radiologist', 'Admin'],
    default: 'Doctor'
  },
  
  permissions: {
    viewPatients: { type: Boolean, default: true },
    createEncounters: { type: Boolean, default: true },
    prescribeMedication: { type: Boolean, default: false },
    viewLabResults: { type: Boolean, default: true },
    orderLabs: { type: Boolean, default: false },
    accessEmergency: { type: Boolean, default: false },
    manageBeds: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: false }
  },
  
  // Profile
  photo: String,
  signature: String,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpires: Date,
  verificationToken: String,
  verificationExpiry: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Security
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Settings
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  
  // Audit
  createdBy: String,
  approvedBy: String,
  approvedAt: Date
}, {
  timestamps: true
});

// Generate unique provider ID
providerAuthSchema.pre('save', async function(next) {
  if (!this.providerId) {
    const count = await mongoose.model('ProviderAuth').countDocuments();
    this.providerId = `PROV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Hash password before saving
providerAuthSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
providerAuthSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
providerAuthSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Set permissions based on role
providerAuthSchema.methods.setRolePermissions = function() {
  switch(this.role) {
    case 'Doctor':
      this.permissions = {
        viewPatients: true,
        createEncounters: true,
        prescribeMedication: true,
        viewLabResults: true,
        orderLabs: true,
        accessEmergency: true,
        manageBeds: false,
        viewAnalytics: false
      };
      break;
    case 'Nurse':
      this.permissions = {
        viewPatients: true,
        createEncounters: true,
        prescribeMedication: false,
        viewLabResults: true,
        orderLabs: false,
        accessEmergency: true,
        manageBeds: true,
        viewAnalytics: false
      };
      break;
    case 'Pharmacist':
      this.permissions = {
        viewPatients: true,
        createEncounters: false,
        prescribeMedication: false,
        viewLabResults: false,
        orderLabs: false,
        accessEmergency: false,
        manageBeds: false,
        viewAnalytics: false
      };
      break;
    case 'Lab Technician':
      this.permissions = {
        viewPatients: true,
        createEncounters: false,
        prescribeMedication: false,
        viewLabResults: true,
        orderLabs: false,
        accessEmergency: false,
        manageBeds: false,
        viewAnalytics: false
      };
      break;
    case 'Admin':
      this.permissions = {
        viewPatients: true,
        createEncounters: true,
        prescribeMedication: true,
        viewLabResults: true,
        orderLabs: true,
        accessEmergency: true,
        manageBeds: true,
        viewAnalytics: true
      };
      break;
  }
};

module.exports = mongoose.model('ProviderAuth', providerAuthSchema);
