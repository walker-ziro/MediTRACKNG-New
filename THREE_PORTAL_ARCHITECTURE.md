# 🏥 MediTRACKNG - Three Portal Architecture

## Overview
MediTRACKNG National Health Records System has been restructured into **THREE SEPARATE PORTALS** with distinct authentication, permissions, and user experiences:

1. **Healthcare Provider Portal** 👨‍⚕️
2. **Patient Portal** 💚  
3. **Health Management System (Admin) Portal** 🛡️

---

## 🚀 Quick Start Guide

### Backend Setup
```bash
cd backend
npm install
node server.js
```
Backend runs on: `http://localhost:5000`

### Frontend Setup  
```bash
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Run Both Simultaneously
```bash
npm start
```

---

## 📁 Project Structure

```
MediTRACKING/
├── backend/
│   ├── models/
│   │   ├── ProviderAuth.js          # Healthcare provider authentication
│   │   ├── PatientAuth.js           # Patient authentication
│   │   ├── AdminAuth.js             # Admin authentication
│   │   └── ...existing models
│   ├── routes/
│   │   ├── multiAuthRoutes.js       # Unified auth routes for all 3 portals
│   │   └── ...existing routes
│   ├── middleware/
│   │   └── roleAuth.js              # Role-based authorization middleware
│   └── server.js
├── src/
│   ├── pages/
│   │   ├── provider/
│   │   │   ├── ProviderLogin.jsx    # Provider login page
│   │   │   └── ProviderLogin.css
│   │   ├── patient/
│   │   │   ├── PatientLogin.jsx     # Patient login page
│   │   │   └── PatientLogin.css
│   │   └── admin/
│   │       ├── AdminLogin.jsx       # Admin login page
│   │       └── AdminLogin.css
│   ├── App.jsx                      # Main routing with landing page
│   ├── main.jsx                     # Entry point
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔐 Authentication System

### API Endpoints

#### Provider Authentication
- **POST** `/api/multi-auth/provider/register`
- **POST** `/api/multi-auth/provider/login`

#### Patient Authentication  
- **POST** `/api/multi-auth/patient/register`
- **POST** `/api/multi-auth/patient/login`

#### Admin Authentication
- **POST** `/api/multi-auth/admin/register`
- **POST** `/api/multi-auth/admin/login`

#### Common Endpoints
- **GET** `/api/multi-auth/verify` - Verify token
- **POST** `/api/multi-auth/logout` - Logout

---

## 👨‍⚕️ Healthcare Provider Portal

### User Roles
- Doctor
- Nurse
- Pharmacist
- Lab Technician
- Radiologist
- Admin

### Permissions (8 types)
- `viewPatients` - View patient records
- `createEncounters` - Create medical encounters
- `prescribeMedication` - Write prescriptions
- `viewLabResults` - View laboratory results
- `orderLabs` - Order lab tests
- `accessEmergency` - Access emergency records
- `manageBeds` - Manage bed allocation
- `viewAnalytics` - View analytics dashboard

### Provider ID Format
`PROV-YYYYMMDD-XXXXX` (e.g., `PROV-20240115-00123`)

### Registration Fields
```javascript
{
  email, password, firstName, lastName,
  phone, role, specialization,
  licenseNumber, licenseExpiryDate,
  facilityId, facilityName, department,
  dateOfBirth, gender, address
}
```

### Security Features
- Account requires approval (`isActive: false` by default)
- License verification
- 5 failed login attempts = 30-minute lock
- Role-based automatic permission assignment
- Facility affiliation tracking

---

## 💚 Patient Portal

### Health ID Format
`HID-YYYYMMDD-XXXXX` (e.g., `HID-20240115-00456`)

### Registration Fields
```javascript
{
  email, password, firstName, lastName,
  phone, dateOfBirth, gender,
  bloodType, genotype,
  allergies[], chronicConditions[],
  emergencyContact: { name, relationship, phone, email },
  address: { street, city, state, country, postalCode }
}
```

### Permissions (4 types)
- `allowDataSharing` - Share data with other providers
- `allowResearch` - Participate in research studies
- `allowEmergencyAccess` - Allow emergency responders access
- `allowFamilyAccess` - Share with family members

### Privacy Settings
- **Profile Visibility**: Public / Private / Healthcare Only
- **Share with Researchers**: true / false
- **Share with Insurance**: true / false

### Notification Preferences
- Email, SMS, Push
- Appointment reminders
- Prescription alerts
- Lab results

### Security Features
- Immediate account activation
- Biometric support (Fingerprint/Face/Iris)
- 2FA optional
- 5 failed login attempts = 30-minute lock
- Age auto-calculated from DOB

---

## 🛡️ Health Management System (Admin Portal)

### Admin Roles
- Super Admin
- System Admin
- Data Admin
- Security Admin
- Facility Admin
- Support Admin

### Admin Levels
- **National** - Access to all facilities nationwide
- **State** - Access to facilities in specific state
- **Facility** - Access to single facility

### Admin ID Format
`ADM-YYYYMMDD-XXXXX` (e.g., `ADM-20240115-00789`)

### Permissions (18 types across 7 categories)

#### User Management
- `createUsers` - Create new users
- `editUsers` - Edit user accounts
- `deleteUsers` - Delete users
- `approveProviders` - Approve healthcare providers

#### Facility Management
- `manageFacilities` - Manage healthcare facilities
- `approveFacilities` - Approve new facilities

#### Data Management
- `viewAllRecords` - View all patient records
- `exportData` - Export system data
- `deleteRecords` - Delete records (with audit)

#### Analytics & Reporting
- `viewAnalytics` - View system analytics
- `generateReports` - Generate reports
- `viewAuditLogs` - View audit logs

#### System Management
- `manageSettings` - Manage system settings
- `manageIntegrations` - Manage integrations
- `manageSecurity` - Manage security policies

#### Compliance
- `manageConsents` - Manage patient consents
- `viewComplianceReports` - View compliance reports

#### Operations
- `manageInsurance` - Manage insurance
- `verifyPolicies` - Verify insurance policies
- `processClaims` - Process insurance claims
- `handleTickets` - Handle support tickets
- `manageNotifications` - Manage system notifications

### Security Features
- Account requires approval (`isActive: false` by default)
- **Mandatory 2FA** (`twoFactorEnabled: true` by default)
- **Stricter locking**: 3 failed attempts = 1-hour lock
- Session tracking (IP, device, timestamps)
- Activity logging (last 1000 actions)
- Jurisdiction-based access control
- All actions logged and audited

---

## 🔒 Authorization Middleware

Located: `backend/middleware/roleAuth.js`

### Available Middleware Functions

```javascript
// Basic authentication
authenticate(req, res, next)

// User type authorization
authorizeUserType('provider', 'patient', 'admin')

// Provider permission checking
authorizeProviderPermission('viewPatients', 'createEncounters')

// Admin permission checking
authorizeAdminPermission('viewAllRecords', 'exportData')

// Patient self-access
authorizePatientSelf(req, res, next)

// Combined authorizations
authorizeProviderOrPatient(req, res, next)
authorizeProviderOrAdmin(req, res, next)

// Patient data access (checks all user types)
authorizePatientDataAccess(req, res, next)
```

### Usage Example
```javascript
const { authenticate, authorizeProviderPermission } = require('../middleware/roleAuth');

router.post('/prescriptions',
  authenticate,
  authorizeProviderPermission('prescribeMedication'),
  createPrescription
);
```

---

## 🎨 Frontend Routes

### Landing Page
`/` - Portal selection page

### Provider Portal
- `/provider/login` - Provider login
- `/provider/signup` - Provider registration (TODO)
- `/provider/dashboard` - Provider dashboard (TODO)
- `/provider/forgot-password` - Password reset (TODO)

### Patient Portal
- `/patient/login` - Patient login
- `/patient/signup` - Patient registration (TODO)
- `/patient/dashboard` - Patient dashboard (TODO)
- `/patient/biometric-login` - Biometric auth (TODO)
- `/patient/emergency` - Emergency access (TODO)
- `/patient/forgot-password` - Password reset (TODO)

### Admin Portal
- `/admin/login` - Admin login with 2FA
- `/admin/signup` - Admin registration (TODO)
- `/admin/dashboard` - Admin dashboard (TODO)

---

## 🔄 Login Flow

### Provider/Patient Login
1. User enters email and password
2. Backend validates credentials
3. Check account lock status
4. Check account active status
5. Generate JWT token with userType
6. Return token + user data
7. Frontend stores token and navigates to dashboard

### Admin Login (Enhanced Security)
1. User enters email and password
2. Backend validates credentials
3. Check account lock status (stricter)
4. Log activity (action, IP, timestamp)
5. Check 2FA status
6. If 2FA enabled:
   - Return `require2FA: true` + tempToken
   - User enters 6-digit code
   - Backend verifies code
   - Generate final JWT token
7. Return token + user data
8. Frontend stores token and navigates to dashboard

---

## 🔑 JWT Token Structure

```javascript
{
  id: "65abc123...",           // MongoDB _id
  userId: "PROV-20240115-00123", // Unique user ID
  userType: "provider",         // 'provider', 'patient', or 'admin'
  role: "Doctor",              // User's role
  exp: 1705929600              // Expiration (7 days)
}
```

---

## 📊 User Data Storage

### LocalStorage
```javascript
// After successful login
localStorage.setItem('token', data.token);
localStorage.setItem('userType', data.userType);
localStorage.setItem('userData', JSON.stringify(data.user));

// Retrieve
const token = localStorage.getItem('token');
const userType = localStorage.getItem('userType');
const userData = JSON.parse(localStorage.getItem('userData'));
```

---

## ✅ COMPLETED: Three-Portal System

### ✅ Completed Features
1. ✅ Backend authentication models (ProviderAuth, PatientAuth, AdminAuth)
2. ✅ Backend auth routes with 8 endpoints (/multi-auth/*)
3. ✅ Frontend login pages (Provider, Patient, Admin)
4. ✅ Registration pages for all 3 portals (Signup pages)
5. ✅ Dashboard pages for all 3 portals
6. ✅ Role-based routing protection (ProtectedPortalRoute components)
7. ✅ Authorization middleware (roleAuth.js with 8 middleware functions)
8. ✅ 2FA verification endpoint for admin (/admin/verify-2fa)
9. ✅ Landing page with portal selection
10. ✅ Comprehensive documentation

### 🚧 Remaining TODOs

#### Frontend Components (Role-Specific Features)
- **Provider Portal**:
  - ⏳ PatientList.jsx - View all patients
  - ⏳ CreateEncounter.jsx - Create medical encounters
  - ⏳ PrescriptionWriter.jsx - Write prescriptions with drug interaction checker
  - ⏳ LabOrderForm.jsx - Order laboratory tests
  - ⏳ TelemedicineRoom.jsx - Virtual consultation interface
  
- **Patient Portal**:
  - ⏳ HealthRecords.jsx - View medical history and records
  - ⏳ AppointmentBooking.jsx - Book appointments with providers
  - ⏳ FamilyLinks.jsx - Manage family health connections
  - ⏳ BiometricSetup.jsx - Register biometric authentication
  - ⏳ EmergencyAccess.jsx - Emergency responder interface
  
- **Admin Portal**:
  - ⏳ UserManagement.jsx - Create/edit/delete users
  - ⏳ ProviderApproval.jsx - Approve/reject provider registrations
  - ⏳ FacilityManagement.jsx - Manage healthcare facilities
  - ⏳ AnalyticsView.jsx - System analytics and reports
  - ⏳ AuditLogViewer.jsx - View system audit logs
  - ⏳ InsuranceManagement.jsx - Manage insurance claims

#### Backend Enhancements
1. ⏳ Update existing routes with new authorization middleware
2. ⏳ Add forgot password / reset password flows (all portals)
3. ⏳ Add email verification system
4. ⏳ Add actual 2FA secret generation and verification (TOTP)
5. ⏳ Add biometric authentication support endpoints
6. ⏳ Implement token refresh mechanism
7. ⏳ Add rate limiting for authentication endpoints

#### Integration Tasks
1. ⏳ Connect E-Prescription system to Provider Portal
2. ⏳ Connect Telemedicine to both Provider and Patient Portals
3. ⏳ Connect Insurance Management to Admin Portal
4. ⏳ Connect Family Health Links to Patient Portal
5. ⏳ Connect Emergency Access to all portals
6. ⏳ Integrate existing Analytics Dashboard with Admin Portal

---

## 🧪 Testing

### Test Provider Login
```bash
curl -X POST http://localhost:5000/api/multi-auth/provider/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"password123"}'
```

### Test Patient Login
```bash
curl -X POST http://localhost:5000/api/multi-auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"password123"}'
```

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/multi-auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Test Token Verification
```bash
curl http://localhost:5000/api/multi-auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Environment Variables

Create `.env` in backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meditrackng
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

---

## 🎯 Key Differences Between Portals

| Feature | Provider | Patient | Admin |
|---------|----------|---------|-------|
| **Auto ID** | PROV-* | HID-* | ADM-* |
| **Default Active** | ❌ No | ✅ Yes | ❌ No |
| **Requires Approval** | ✅ Yes | ❌ No | ✅ Yes |
| **2FA** | Optional | Optional | Mandatory |
| **Failed Attempts** | 5 | 5 | 3 |
| **Lock Duration** | 30 min | 30 min | 1 hour |
| **Permissions** | 8 clinical | 4 privacy | 18 system |
| **Activity Logging** | ❌ No | ❌ No | ✅ Yes |
| **Session Tracking** | ❌ No | ❌ No | ✅ Yes |
| **Jurisdiction** | Facility | N/A | National/State/Facility |

---

## 📞 Support

For questions or issues, contact the development team.

**Version:** 2.0.0  
**Last Updated:** December 8, 2025  
**Architecture:** Three-Portal Separation

---

## 📝 Recent Updates (Dec 8, 2025)

### ✅ Completed Today
- Created landing page with 3-portal selection interface
- Built all authentication pages (login + signup) for 3 portals
- Developed complete dashboard pages with role-specific features
- Implemented protected route components for each user type
- Added 2FA verification endpoint for admin login
- Created comprehensive shared CSS for auth pages
- Registered all signup routes in App.jsx
- Updated documentation with completion status

### 🚀 Ready to Use
- **Frontend**: Running on port 3000
- **Backend**: Running on port 5000
- **Landing Page**: http://localhost:3000/
- **Provider Login**: http://localhost:3000/provider/login
- **Patient Login**: http://localhost:3000/patient/login
- **Admin Login**: http://localhost:3000/admin/login

All core authentication and dashboard features are now functional!
