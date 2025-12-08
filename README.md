# MediTRACKNG - National Health Records System

A comprehensive, secure, and centralized National Health Records System for all Nigerian citizens, enabling unified patient identification, consent-based data sharing, and nationwide healthcare coordination.

## 🎯 Primary System Features

### National Health Infrastructure
- **🏥 Multi-Facility Architecture** - Nationwide healthcare facility integration
- **🔐 Consent Management System** - Patient-controlled data access with tiered permissions
- **📊 Public Health Analytics** - Disease surveillance and population health insights
- **🔍 Audit Trail System** - Complete access logging for NDPA 2023 compliance
- **👤 Patient Portal** - Citizens access their own complete medical records
- **🏛️ Facility Registration** - Onboarding and management of healthcare facilities
- **🔒 Security & Compliance** - NDPA 2023 compliant with granular access control

### Core EHR Features
- **Unified Patient Identification** - Unique Health IDs (MTN-XXXXXXXX format)
- **Biometric Authentication** - Fingerprint and facial recognition support
- **Electronic Health Records (EHR)** - Complete medical history tracking across all facilities
- **Provider Portal** - Secure access for healthcare professionals
- **Encounter Timeline** - Visual timeline of patient visits nationwide
- **JWT Authentication** - Secure provider and patient authentication
- **Real-time Updates** - Immediate access to patient records with consent
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Technology Stack

- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** React 18 with Hooks
- **Styling:** Tailwind CSS
- **Authentication:** JWT + bcryptjs
- **HTTP Client:** Axios
- **Build Tool:** Vite

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Configure Environment

The backend `.env` file is already configured with default values. Update if needed:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meditrackng
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### 3. Seed Sample Data (Optional)

```powershell
cd backend
npm run seed
```

This creates sample providers and patients for testing.

### 4. Start the Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 👥 Sample Credentials (After Seeding)

**Provider 1:**
- Username: `dr.johnson`
- Password: `password123`
- Facility: General Hospital Lagos

**Sample Patients:**
- Health ID: `MTN-DEMO0001` (Oluwaseun Adebayo)
- Health ID: `MTN-DEMO0002` (Amina Mohammed)

## 📖 Documentation

**Start Here:** [INDEX.md](INDEX.md) - Complete documentation index and navigation guide

**Quick References:**
- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 3 steps (5 minutes)
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Comprehensive installation and usage guide
- **[USER_FLOWS.md](USER_FLOWS.md)** - Detailed user journey walkthroughs
- **[FILE_STRUCTURE.md](FILE_STRUCTURE.md)** - Complete codebase structure
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Implementation details and features
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Comprehensive testing guide
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - UI/UX design system and mockups

## 🔑 Key Workflows

### Register a Provider
1. Navigate to http://localhost:3000
2. Click "Don't have an account? Register"
3. Enter credentials and facility name

### Create a Patient
1. Login to the dashboard
2. Click "Create New Patient"
3. Fill in demographics and medical history
4. System generates unique Health ID

### Record an Encounter
1. Search for patient by Health ID
2. Click "+ New Encounter"
3. Add clinical notes, lab results, and discharge summary
4. Save to create encounter record

### View Patient History
1. Search patient by Health ID
2. View complete demographics and medical history
3. Switch to "Encounter History" tab
4. See timeline of all visits across facilities

## 🏗️ Project Structure

```
MediTRACKNG/
├── backend/
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth middleware
│   ├── server.js            # Express server
│   └── seed.js              # Sample data seeder
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── utils/           # API utilities
    │   └── App.jsx          # Main application
    └── vite.config.js
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Input validation

## 🧪 Testing the System

1. Start both backend and frontend servers
2. Register as a healthcare provider
3. Create a test patient
4. Add an encounter with clinical notes
5. Search for the patient and view their record
6. Verify encounter appears in timeline

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register provider
- `POST /api/auth/login` - Login provider

### Patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:healthId` - Get patient by Health ID
- `GET /api/patients/:healthId/encounters` - Get patient encounters

### Encounters
- `POST /api/encounters` - Create encounter
- `GET /api/encounters/:id` - Get specific encounter

## 🐛 Troubleshooting

**Backend won't start:**
- Ensure MongoDB is running
- Check port 5000 is available
- Verify .env file exists

**Frontend won't start:**
- Ensure backend is running first
- Check port 3000 is available
- Clear npm cache if needed

**Can't find patient:**
- Verify Health ID is correct (case-sensitive)
- Ensure you're logged in
- Check backend logs for errors

## 🚀 Production Deployment

Before deploying:
- [ ] Change JWT_SECRET to a strong value
- [ ] Use production MongoDB instance
- [ ] Enable HTTPS
- [ ] Configure CORS whitelist
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Add data encryption

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete production checklist.

## 🛣️ Roadmap

**Phase 2 Features:**
- Biometric authentication integration
- File upload for lab results and documents
- Email notifications for providers
- Advanced search and filtering
- Data export functionality
- Patient portal for self-service
- Mobile application

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is an MVP (Minimum Viable Product) for demonstration purposes. 

---

**MediTRACKNG MVP - Transforming Healthcare Record-Keeping in Nigeria** 🇳🇬
