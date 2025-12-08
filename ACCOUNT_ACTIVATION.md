# Account Activation Guide

## Overview

By default, new user accounts (Provider, Patient, Admin) are created with `isActive: false` and require manual activation before users can log in. This is a security feature to allow administrators to review and approve accounts before granting access.

---

## Account Activation Methods

### Method 1: Using Activation Script (Recommended for Development)

**Quick activation via command line:**

```bash
cd backend
node scripts/activateAccount.js <email>
```

**Example:**
```bash
node scripts/activateAccount.js doctor@hospital.com
```

**Output:**
```
✅ Connected to MongoDB
✅ Provider account activated successfully!
   Provider ID: PROV-20251208-00001
   Name: Dr. John Doe
   Email: doctor@hospital.com
```

---

### Method 2: Using API Endpoints (For Admin Dashboard)

#### Activate Provider Account
```http
PATCH http://localhost:5000/api/multi-auth/admin/activate/provider/:email
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/multi-auth/admin/activate/provider/doctor@hospital.com
```

**Response:**
```json
{
  "message": "Provider account activated successfully",
  "providerId": "PROV-20251208-00001",
  "email": "doctor@hospital.com"
}
```

---

#### Activate Patient Account
```http
PATCH http://localhost:5000/api/multi-auth/admin/activate/patient/:email
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/multi-auth/admin/activate/patient/patient@email.com
```

---

#### Activate Admin Account
```http
PATCH http://localhost:5000/api/multi-auth/admin/activate/admin/:email
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/multi-auth/admin/activate/admin/admin@system.com
```

---

### Method 3: Direct Database Update (MongoDB Compass/Shell)

**Using MongoDB Shell:**
```javascript
// Activate Provider
db.providerauths.updateOne(
  { email: "doctor@hospital.com" },
  { $set: { isActive: true } }
)

// Activate Patient
db.patientauths.updateOne(
  { email: "patient@email.com" },
  { $set: { isActive: true } }
)

// Activate Admin
db.adminauths.updateOne(
  { email: "admin@system.com" },
  { $set: { isActive: true } }
)
```

**Using MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to the appropriate collection (providerauths/patientauths/adminauths)
4. Find the document by email
5. Edit the document and set `isActive: true`
6. Save changes

---

## Login Error Messages

### Account Not Activated (403 Forbidden)
```json
{
  "message": "Account is not activated. Please contact administrator."
}
```

**Solution:** Activate the account using one of the methods above.

---

### Account Locked (423 Locked)
```json
{
  "message": "Account is locked. Please contact administrator."
}
```

**Cause:** Too many failed login attempts
- Providers/Patients: 5 attempts → locked for 30 minutes
- Admins: 3 attempts → locked for 1 hour

**Solution:** Wait for the lock period to expire, or manually unlock via database:
```javascript
db.providerauths.updateOne(
  { email: "user@email.com" },
  { $set: { loginAttempts: 0, lockUntil: null } }
)
```

---

## Account Status Fields

Each user model has these status fields:

```javascript
{
  isActive: Boolean,      // Account activated by admin
  isVerified: Boolean,    // Email verified by user
  loginAttempts: Number,  // Failed login counter
  lockUntil: Date,       // Account lock expiration
  lastLogin: Date        // Last successful login
}
```

---

## Development vs Production

### Development Mode
- Use the activation script for quick testing
- Consider setting `isActive: true` by default in models (not recommended for production)

### Production Mode
- Always require admin approval (isActive: false by default)
- Build an admin dashboard with activation UI
- Implement email verification (isVerified)
- Add notification system for new account requests
- Log all activation actions for audit trail

---

## Future Enhancements

1. **Email Verification Flow**
   - Send verification email on registration
   - User clicks link to verify email
   - Set `isVerified: true`

2. **Admin Approval Dashboard**
   - View pending accounts
   - One-click activation
   - Rejection with reason
   - Bulk activation

3. **Automatic Activation Rules**
   - Auto-activate for specific email domains
   - Auto-activate patients (if approved by policy)
   - Require dual approval for admins

4. **Notification System**
   - Email admin when new account created
   - Email user when account activated
   - SMS for critical actions

---

## Troubleshooting

### Script doesn't work
```bash
# Make sure you're in the backend directory
cd backend

# Install dependencies if needed
npm install

# Check MongoDB connection in .env file
# Ensure MONGODB_URI is set correctly
```

### Cannot find module error
```bash
# The script requires the models to be in ../models/
# Ensure correct directory structure:
backend/
  ├── scripts/
  │   └── activateAccount.js
  ├── models/
  │   ├── ProviderAuth.js
  │   ├── PatientAuth.js
  │   └── AdminAuth.js
  └── .env
```

### Database connection error
- Check if MongoDB is running
- Verify MONGODB_URI in .env file
- Ensure network connectivity

---

## Quick Reference

**Activate during development:**
```bash
node scripts/activateAccount.js user@email.com
```

**Check activation status:**
```bash
# In MongoDB Shell
db.providerauths.findOne({ email: "user@email.com" }, { isActive: 1, email: 1 })
```

**Activate all test accounts:**
```javascript
// In MongoDB Shell - USE WITH CAUTION
db.providerauths.updateMany({}, { $set: { isActive: true } })
db.patientauths.updateMany({}, { $set: { isActive: true } })
db.adminauths.updateMany({}, { $set: { isActive: true } })
```

---

## Security Notes

⚠️ **Important:**
- The activation endpoints currently have NO authentication
- In production, add admin authentication middleware
- Log all activation actions for audit purposes
- Consider implementing approval workflows
- Add rate limiting to prevent abuse

**Recommended middleware:**
```javascript
router.patch('/admin/activate/provider/:email', 
  authenticate,  // Verify JWT token
  authorizeAdminPermission('manageProviders'),  // Check admin permissions
  async (req, res) => { /* ... */ }
);
```
