# MediTRACKNG Backend

The backend service for the MediTRACKNG National Health Records System. Built with Node.js, Express, and MongoDB.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs (Password hashing), cors, helmet

## 📂 Folder Structure

```
backend/
├── models/              # Mongoose data models
│   ├── Appointment.js   # Appointment schema
│   ├── Encounter.js     # Medical encounter schema
│   ├── Laboratory.js    # Lab order schema
│   ├── Patient.js       # Patient schema
│   ├── Prescription.js  # Prescription schema
│   ├── Provider.js      # Healthcare provider schema
│   └── User.js          # Admin user schema
├── routes/              # API route definitions
│   ├── adminRoutes.js   # Admin-only routes
│   ├── authRoutes.js    # Authentication routes
│   ├── multiAuthRoutes.js # Unified auth routes
│   ├── patientPortalRoutes.js # Patient-facing routes
│   ├── patientRoutes.js # Provider-facing patient routes
│   └── providerRoutes.js # Provider management routes
├── middleware/          # Custom middleware
│   ├── authMiddleware.js # JWT verification
│   └── roleMiddleware.js # Role-based access control
├── scripts/             # Utility and migration scripts
│   ├── migrateAppointmentIds.js # Adds APT-XXXXXX IDs
│   └── migrateLabOrderIds.js    # Adds LAB-XXXXXX IDs
├── server.js            # Application entry point
└── seed.js              # Database seeder
```

## 🔑 ID Generation System

The system uses standardized short IDs for better readability:

- **Patients:** `PID-XXXXXX` (e.g., PID-839201)
- **Appointments:** `APT-XXXXXX` (e.g., APT-928374)
- **Lab Orders:** `LAB-XXXXXX` (e.g., LAB-738291)
- **Prescriptions:** `RX-XXXXXX` (e.g., RX-829103)
- **Encounters:** `ENC-XXXXXX` (e.g., ENC-192837)

These IDs are generated automatically via Mongoose pre-save hooks.

## 🔄 Migration Scripts

If you have legacy data without the new ID formats, run the migration scripts:

```powershell
# Migrate Appointments
node scripts/migrateAppointmentIds.js

# Migrate Lab Orders
node scripts/migrateLabOrderIds.js
```

## 🚀 Getting Started

1. **Install Dependencies:**
   ```powershell
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/meditrackng
   JWT_SECRET=your_secure_secret
   ```

3. **Seed Database:**
   ```powershell
   npm run seed
   ```

4. **Start Server:**
   ```powershell
   npm run dev
   ```

## 🧪 API Endpoints

### Authentication
- `POST /api/multi-auth/login` - Unified login for all roles
- `POST /api/multi-auth/register-patient` - Register new patient

### Patient Portal
- `GET /api/patient-portal/dashboard` - Patient dashboard data
- `GET /api/patient-portal/health-records` - Full medical history
- `GET /api/patient-portal/appointments` - My appointments
- `GET /api/patient-portal/prescriptions` - My prescriptions

### Provider Portal
- `GET /api/patients/search` - Search patients by ID/Name
- `POST /api/encounters` - Create new medical encounter
- `POST /api/appointments` - Schedule appointment
- `POST /api/laboratory` - Order lab tests
- `POST /api/prescriptions` - Prescribe medication

## 🔒 Security

- All protected routes require a valid Bearer Token.
- Passwords are never stored in plain text.
- Role-based access control ensures Patients cannot access Provider data and vice versa.
