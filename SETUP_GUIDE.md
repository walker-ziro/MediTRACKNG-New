# MediTRACKNG MVP - Setup Guide

## Overview
MediTRACKNG is a secure, centralized digital medical history record-keeping system for Nigerian citizens. This MVP includes:
- Unified Patient Identification with unique Health IDs
- Electronic Health Records (EHR) management
- Secure Provider Portal with JWT authentication
- Complete medical history tracking across facilities
- Encounter timeline visualization

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Project Structure
```
MediTRACKNG/
├── backend/
│   ├── models/              # Mongoose schemas
│   │   ├── Patient.js       # Patient schema with demographics & medical history
│   │   ├── Encounter.js     # Encounter schema for visits/consultations
│   │   └── Provider.js      # Healthcare provider schema
│   ├── routes/              # API endpoints
│   │   ├── authRoutes.js    # Authentication (register/login)
│   │   ├── patientRoutes.js # Patient management
│   │   └── encounterRoutes.js # Encounter management
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── server.js            # Express server setup
│   ├── package.json
│   └── .env                 # Environment variables
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Login.jsx             # Provider authentication
    │   │   ├── Dashboard.jsx         # Main dashboard with search
    │   │   ├── PatientRecord.jsx     # Complete patient record view
    │   │   ├── NewEncounterForm.jsx  # Create new encounter
    │   │   └── PrivateRoute.jsx      # Route protection
    │   ├── utils/
    │   │   └── api.js       # API client with axios
    │   ├── App.jsx          # Main app with routing
    │   ├── main.jsx         # React entry point
    │   └── index.css        # Tailwind CSS styles
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables (edit .env file)
# Update MONGODB_URI if using a different MongoDB instance
# Change JWT_SECRET to a secure random string for production

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (open a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. MongoDB Setup

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service: `mongod`
- Database will be created automatically at: `mongodb://localhost:27017/meditrackng`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Get connection string and update `MONGODB_URI` in `backend/.env`

## Usage Guide

### 1. Register as a Healthcare Provider
- Navigate to http://localhost:3000
- Click "Don't have an account? Register"
- Enter username, password, and facility name
- Submit to create your provider account

### 2. Create a New Patient
- After login, you'll see the Dashboard
- Click "Create New Patient" button
- Fill in patient demographics and medical history
- A unique Health ID will be automatically generated (e.g., MTN-A1B2C3D4)
- Save the Health ID for future reference

### 3. Search for a Patient
- On the Dashboard, enter a Health ID in the search bar
- Click "Search" to view the patient's complete record

### 4. View Patient Record
- Patient overview shows demographics, medical history, medications, and immunizations
- Switch to "Encounter History" tab to see timeline of all visits
- View encounters across all healthcare facilities
- Click on any encounter to expand and view details

### 5. Create a New Encounter
- On the Patient Record page, click "+ New Encounter"
- Enter clinical notes (required)
- Add lab test requests with status tracking
- Add discharge summary with follow-up instructions
- Save the encounter

## Key Features Implemented

### Security Features
✅ JWT-based authentication for providers
✅ Password hashing with bcryptjs
✅ Protected API routes with auth middleware
✅ Secure token storage in localStorage

### Patient Management
✅ Unique Health ID generation (MTN-XXXXXXXX format)
✅ Complete demographic information
✅ Medical history tracking (chronic conditions, allergies)
✅ Medication history
✅ Immunization records
✅ Biometric ID placeholder for future implementation

### Encounter Management
✅ Multi-facility encounter tracking
✅ Clinical notes documentation
✅ Lab results with status tracking (Pending, In Progress, Completed)
✅ Discharge summaries
✅ Timeline visualization of patient journey
✅ Provider and facility information for each encounter

### User Experience
✅ Clean, professional Tailwind CSS styling
✅ Responsive design for mobile and desktop
✅ Error handling with user-friendly messages
✅ Loading states for async operations
✅ Success confirmations
✅ Intuitive navigation with React Router

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new provider
- `POST /api/auth/login` - Login provider

### Patients
- `POST /api/patients` - Create new patient (requires auth)
- `GET /api/patients/:healthId` - Get patient by Health ID (requires auth)
- `GET /api/patients/:healthId/encounters` - Get all encounters for patient (requires auth)
- `PUT /api/patients/:healthId` - Update patient information (requires auth)

### Encounters
- `POST /api/encounters` - Create new encounter (requires auth)
- `GET /api/encounters/:id` - Get specific encounter (requires auth)
- `PUT /api/encounters/:id` - Update encounter (requires auth)

## Default Test Data

You can use these credentials after registration or create your own:

**Provider Account:**
- Username: `dr.johnson`
- Password: `password123`
- Facility: `General Hospital Lagos`

**Sample Patient:**
After creating a patient, you'll receive a Health ID like: `MTN-A1B2C3D4`

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check if port 5000 is available
- Verify `.env` file exists with correct values

### Frontend won't start
- Ensure backend is running first
- Check if port 3000 is available
- Clear npm cache: `npm cache clean --force`

### Can't login
- Ensure backend is running
- Check browser console for errors
- Verify token in localStorage (Developer Tools > Application > Local Storage)

### Patient not found
- Verify the Health ID is correct (case-sensitive)
- Ensure you're logged in
- Check backend console for API errors

## Production Deployment Checklist

Before deploying to production:

1. **Security:**
   - [ ] Change JWT_SECRET to a strong random string
   - [ ] Use HTTPS for all connections
   - [ ] Implement rate limiting
   - [ ] Add CORS whitelist for specific domains
   - [ ] Enable MongoDB authentication

2. **Environment:**
   - [ ] Set NODE_ENV to 'production'
   - [ ] Use production MongoDB instance
   - [ ] Configure proper logging
   - [ ] Set up error monitoring (e.g., Sentry)

3. **Data Protection:**
   - [ ] Implement data encryption at rest
   - [ ] Add audit logging
   - [ ] Implement proper backup strategy
   - [ ] Add data retention policies

4. **Features to Add:**
   - [ ] Biometric authentication integration
   - [ ] File upload for lab results
   - [ ] Email notifications
   - [ ] Provider role management
   - [ ] Patient consent management
   - [ ] Data export functionality

## Technology Stack

**Backend:**
- Node.js & Express.js - Server framework
- MongoDB & Mongoose - Database and ODM
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing

**Frontend:**
- React 18 - UI framework
- React Router - Navigation
- Axios - HTTP client
- Vite - Build tool
- Tailwind CSS - Styling

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs in the terminal
3. Check browser console for frontend errors
4. Ensure all dependencies are installed correctly

## Next Steps

Once the MVP is running successfully, consider:
1. Testing with multiple providers and patients
2. Documenting user feedback
3. Planning Phase 2 features (biometrics, file uploads, etc.)
4. Setting up staging environment
5. Preparing for security audit

---

**MediTRACKNG MVP - Built with ❤️ for Nigerian Healthcare**
