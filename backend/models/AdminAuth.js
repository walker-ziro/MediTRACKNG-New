const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Health Management System Admin Authentication
const adminAuthSchema = new mongoose.Schema({
  adminId: {
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
  
  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Role & Level
  role: {
    type: String,
    enum: ['Super Admin', 'System Admin', 'Data Admin', 'Security Admin', 'Facility Admin', 'Support Admin'],
    default: 'System Admin'
  },
  
  adminLevel: {
    type: String,
    enum: ['National', 'State', 'Facility'],
    default: 'Facility'
  },
  
  // Jurisdiction (for state/facility level admins)
  jurisdiction: {
    state: String,
    facilityId: String,
    facilityName: String
  },
  
  // Permissions
  permissions: {
    // User Management
    createUsers: { type: Boolean, default: false },
    editUsers: { type: Boolean, default: false },
    deleteUsers: { type: Boolean, default: false },
    approveProviders: { type: Boolean, default: false },
    
    // Facility Management
    manageFacilities: { type: Boolean, default: false },
    approveFacilities: { type: Boolean, default: false },
    
    // Data Management
    viewAllRecords: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
    deleteRecords: { type: Boolean, default: false },
    
    // Analytics
    viewAnalytics: { type: Boolean, default: true },
    generateReports: { type: Boolean, default: true },
    viewAuditLogs: { type: Boolean, default: true },
    
    // System
    manageSettings: { type: Boolean, default: false },
    manageIntegrations: { type: Boolean, default: false },
    manageSecurity: { type: Boolean, default: false },
    
    // Consent & Compliance
    manageConsents: { type: Boolean, default: false },
    viewComplianceReports: { type: Boolean, default: true },
    
    // Insurance
    manageInsurance: { type: Boolean, default: false },
    verifyPolicies: { type: Boolean, default: false },
    processClaims: { type: Boolean, default: false },
    
    // Support
    handleTickets: { type: Boolean, default: false },
    manageNotifications: { type: Boolean, default: false }
  },
  
  // Profile
  photo: String,
  department: String,
  title: String,
  
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
  
  // 2FA (mandatory for admins)
  twoFactorEnabled: {
    type: Boolean,
    default: true
  },
  twoFactorSecret: String,
  
  // Session Management
  activeSessions: [{
    sessionId: String,
    ipAddress: String,
    device: String,
    loginTime: Date,
    lastActivity: Date
  }],
  
  // Activity Logging
  activityLog: [{
    action: String,
    resource: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    details: String
  }],
  
  // Approval
  createdBy: String,
  approvedBy: String,
  approvedAt: Date
}, {
  timestamps: true
});

// Generate unique admin ID
adminAuthSchema.pre('save', async function(next) {
  if (!this.adminId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('AdminAuth').countDocuments({
      adminId: new RegExp(`^ADM-${dateStr}`)
    });
    this.adminId = `ADM-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Hash password before saving
adminAuthSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
adminAuthSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
adminAuthSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Set permissions based on role
adminAuthSchema.methods.setRolePermissions = function() {
  switch(this.role) {
    case 'Super Admin':
      // Full access to everything
      Object.keys(this.permissions).forEach(key => {
        this.permissions[key] = true;
      });
      break;
    case 'System Admin':
      this.permissions = {
        createUsers: true,
        editUsers: true,
        deleteUsers: false,
        approveProviders: true,
        manageFacilities: true,
        approveFacilities: true,
        viewAllRecords: true,
        exportData: true,
        deleteRecords: false,
        viewAnalytics: true,
        generateReports: true,
        viewAuditLogs: true,
        manageSettings: true,
        manageIntegrations: true,
        manageSecurity: false,
        manageConsents: true,
        viewComplianceReports: true,
        manageInsurance: true,
        verifyPolicies: true,
        processClaims: true,
        handleTickets: true,
        manageNotifications: true
      };
      break;
    case 'Data Admin':
      this.permissions = {
        viewAllRecords: true,
        exportData: true,
        viewAnalytics: true,
        generateReports: true,
        viewAuditLogs: true,
        viewComplianceReports: true
      };
      break;
    case 'Security Admin':
      this.permissions = {
        viewAuditLogs: true,
        manageSecurity: true,
        manageSettings: true,
        viewComplianceReports: true
      };
      break;
    case 'Facility Admin':
      this.permissions = {
        createUsers: true,
        editUsers: true,
        approveProviders: true,
        viewAnalytics: true,
        generateReports: true,
        viewAuditLogs: true,
        handleTickets: true
      };
      break;
    case 'Support Admin':
      this.permissions = {
        handleTickets: true,
        manageNotifications: true,
        viewAnalytics: true
      };
      break;
  }
};

// Log admin activity
adminAuthSchema.methods.logActivity = function(action, resource, ipAddress, details) {
  this.activityLog.push({
    action,
    resource,
    ipAddress,
    details,
    timestamp: new Date()
  });
  
  // Keep only last 1000 activity logs
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }
};

module.exports = mongoose.model('AdminAuth', adminAuthSchema);
