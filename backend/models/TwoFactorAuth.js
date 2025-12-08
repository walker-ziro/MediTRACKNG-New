const mongoose = require('mongoose');
const crypto = require('crypto');

// Two-Factor Authentication - Enhanced security for user accounts
const twoFactorAuthSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  userType: {
    type: String,
    enum: ['Patient', 'Provider', 'Staff', 'Admin'],
    required: true
  },
  
  // 2FA Status
  enabled: {
    type: Boolean,
    default: false
  },
  
  // 2FA Method
  method: {
    type: String,
    enum: ['SMS', 'Email', 'Authenticator App', 'Biometric'],
    default: 'SMS'
  },
  
  // Phone for SMS
  phone: String,
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Email for Email OTP
  email: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Authenticator App (TOTP)
  authenticatorSecret: String,
  authenticatorEnabled: {
    type: Boolean,
    default: false
  },
  
  // Backup Codes (for account recovery)
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  
  // Active OTP Sessions
  activeOTP: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    purpose: String, // 'Login', 'Verification', 'Transaction', etc.
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Trusted Devices
  trustedDevices: [{
    deviceId: String,
    deviceName: String,
    deviceType: String, // 'Mobile', 'Desktop', 'Tablet'
    browser: String,
    os: String,
    ipAddress: String,
    trustedAt: Date,
    lastUsed: Date,
    expiresAt: Date // Devices expire after 30 days of inactivity
  }],
  
  // Security Settings
  settings: {
    requireForLogin: {
      type: Boolean,
      default: true
    },
    requireForSensitiveActions: {
      type: Boolean,
      default: true
    },
    trustDeviceDuration: {
      type: Number,
      default: 30 // days
    },
    otpExpiry: {
      type: Number,
      default: 10 // minutes
    }
  },
  
  // Security Logs
  securityLogs: [{
    action: String, // '2FA Enabled', 'OTP Sent', 'OTP Verified', 'Device Trusted', etc.
    status: String, // 'Success', 'Failed', 'Blocked'
    ipAddress: String,
    deviceInfo: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  
  // Account Security
  failedAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,
  lastOTPSent: Date
}, {
  timestamps: true
});

// Generate OTP
twoFactorAuthSchema.methods.generateOTP = function(purpose = 'Login') {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + this.settings.otpExpiry * 60 * 1000);
  
  this.activeOTP = {
    code: crypto.createHash('sha256').update(otp).digest('hex'),
    expiresAt,
    attempts: 0,
    purpose,
    verified: false
  };
  
  this.lastOTPSent = new Date();
  
  return otp; // Return plain OTP to send to user
};

// Verify OTP
twoFactorAuthSchema.methods.verifyOTP = function(otp) {
  if (!this.activeOTP || !this.activeOTP.code) {
    return { success: false, message: 'No active OTP session' };
  }
  
  if (new Date() > this.activeOTP.expiresAt) {
    return { success: false, message: 'OTP has expired' };
  }
  
  if (this.activeOTP.attempts >= this.activeOTP.maxAttempts) {
    return { success: false, message: 'Maximum attempts exceeded' };
  }
  
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  
  if (hashedOTP !== this.activeOTP.code) {
    this.activeOTP.attempts += 1;
    this.failedAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.failedAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      return { success: false, message: 'Account locked due to multiple failed attempts' };
    }
    
    return { success: false, message: 'Invalid OTP', attemptsRemaining: this.activeOTP.maxAttempts - this.activeOTP.attempts };
  }
  
  // OTP is valid
  this.activeOTP.verified = true;
  this.failedAttempts = 0;
  
  return { success: true, message: 'OTP verified successfully' };
};

// Generate backup codes
twoFactorAuthSchema.methods.generateBackupCodes = function(count = 10) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
    this.backupCodes.push({ code, used: false });
  }
  
  return codes;
};

// Use backup code
twoFactorAuthSchema.methods.useBackupCode = function(code) {
  const backupCode = this.backupCodes.find(bc => bc.code === code.toUpperCase() && !bc.used);
  
  if (!backupCode) {
    return { success: false, message: 'Invalid or already used backup code' };
  }
  
  backupCode.used = true;
  backupCode.usedAt = new Date();
  
  return { success: true, message: 'Backup code verified' };
};

// Trust device
twoFactorAuthSchema.methods.trustDevice = function(deviceInfo) {
  const deviceId = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + this.settings.trustDeviceDuration);
  
  this.trustedDevices.push({
    deviceId,
    deviceName: deviceInfo.deviceName || 'Unknown Device',
    deviceType: deviceInfo.deviceType || 'Unknown',
    browser: deviceInfo.browser || 'Unknown',
    os: deviceInfo.os || 'Unknown',
    ipAddress: deviceInfo.ipAddress,
    trustedAt: new Date(),
    lastUsed: new Date(),
    expiresAt
  });
  
  // Keep only last 10 trusted devices
  if (this.trustedDevices.length > 10) {
    this.trustedDevices = this.trustedDevices.slice(-10);
  }
  
  return deviceId;
};

// Check if device is trusted
twoFactorAuthSchema.methods.isDeviceTrusted = function(deviceId) {
  const device = this.trustedDevices.find(d => d.deviceId === deviceId);
  
  if (!device) return false;
  
  // Check if device has expired
  if (new Date() > device.expiresAt) return false;
  
  // Update last used
  device.lastUsed = new Date();
  
  return true;
};

// Add security log
twoFactorAuthSchema.methods.addSecurityLog = function(action, status, details) {
  this.securityLogs.push({
    action,
    status,
    timestamp: new Date(),
    details
  });
  
  // Keep only last 100 logs
  if (this.securityLogs.length > 100) {
    this.securityLogs = this.securityLogs.slice(-100);
  }
};

// Check if account is locked
twoFactorAuthSchema.methods.isLocked = function() {
  if (this.lockedUntil && new Date() < this.lockedUntil) {
    return true;
  }
  
  // Clear lock if expired
  if (this.lockedUntil && new Date() >= this.lockedUntil) {
    this.lockedUntil = null;
    this.failedAttempts = 0;
  }
  
  return false;
};

module.exports = mongoose.model('TwoFactorAuth', twoFactorAuthSchema);
