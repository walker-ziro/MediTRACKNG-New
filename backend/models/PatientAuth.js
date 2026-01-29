const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Patient Authentication
const patientAuthSchema = new mongoose.Schema({
  healthId: {
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

  // OTP Verification
  otp: String,
  otpExpires: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // WebAuthn Credentials
  authenticators: [{
    credentialID: { type: String, required: true },
    credentialPublicKey: { type: Buffer, required: true },
    counter: { type: Number, required: true },
    credentialDeviceType: { type: String, required: true },
    credentialBackedUp: { type: Boolean, required: true },
    transports: [String],
  }],
  currentChallenge: { type: String },
  
  // Contact
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Nigeria' },
    postalCode: String
  },
  
  // Medical Info
  bloodType: String,
  genotype: String,
  allergies: [String],
  chronicConditions: [String],
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  // Permissions
  permissions: {
    allowDataSharing: { type: Boolean, default: false },
    allowResearch: { type: Boolean, default: false },
    allowEmergencyAccess: { type: Boolean, default: true },
    allowFamilyAccess: { type: Boolean, default: false }
  },
  
  // Profile
  photo: String,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
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
  
  // 2FA
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  
  // Settings
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    prescriptionAlerts: { type: Boolean, default: true },
    labResults: { type: Boolean, default: true }
  },
  
  // Privacy
  privacySettings: {
    profileVisibility: { type: String, enum: ['Public', 'Private', 'Healthcare Only'], default: 'Healthcare Only' },
    shareWithResearchers: { type: Boolean, default: false },
    shareWithInsurance: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Generate unique health ID
patientAuthSchema.pre('save', async function(next) {
  if (!this.healthId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('PatientAuth').countDocuments({
      healthId: new RegExp(`^PID-${dateStr}`)
    });
    this.healthId = `PID-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Hash password before saving
patientAuthSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
patientAuthSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
patientAuthSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Calculate age
patientAuthSchema.methods.getAge = function() {
  return Math.floor((new Date() - new Date(this.dateOfBirth)) / 31557600000);
};

module.exports = mongoose.model('PatientAuth', patientAuthSchema);
