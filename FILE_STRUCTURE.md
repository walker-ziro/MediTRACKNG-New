# MediTRACKNG - Complete File Structure

## 📁 Root Directory
```
c:\Users\USER\Desktop\MediTRACKING\
│
├── 📄 README.md                    # Project overview and quick start
├── 📄 QUICKSTART.md                # Fast setup guide (3 steps)
├── 📄 SETUP_GUIDE.md               # Comprehensive installation and usage guide
├── 📄 PROJECT_SUMMARY.md           # Complete feature list and implementation details
├── 📄 TESTING_CHECKLIST.md         # Comprehensive testing scenarios
├── 📄 USER_FLOWS.md                # Detailed user journey documentation
│
├── 📂 backend/                     # Node.js/Express backend
│   ├── 📂 models/                  # Mongoose schemas
│   │   ├── 📄 Patient.js           # Patient schema (healthId, demographics, history)
│   │   ├── 📄 Encounter.js         # Encounter schema (clinical notes, lab results)
│   │   └── 📄 Provider.js          # Healthcare provider schema
│   │
│   ├── 📂 routes/                  # API endpoints
│   │   ├── 📄 authRoutes.js        # Authentication endpoints (register, login)
│   │   ├── 📄 patientRoutes.js     # Patient management (CRUD operations)
│   │   └── 📄 encounterRoutes.js   # Encounter management (create, read, update)
│   │
│   ├── 📂 middleware/              # Express middleware
│   │   └── 📄 auth.js              # JWT authentication middleware
│   │
│   ├── 📄 server.js                # Express server setup and configuration
│   ├── 📄 seed.js                  # Sample data seeder script
│   ├── 📄 package.json             # Backend dependencies and scripts
│   ├── 📄 .env                     # Environment variables (not in git)
│   ├── 📄 .env.example             # Environment template
│   └── 📄 .gitignore               # Git ignore rules
│
└── 📂 frontend/                    # React frontend
    ├── 📂 src/
    │   ├── 📂 components/          # React components
    │   │   ├── 📄 Login.jsx        # Provider authentication (login/register)
    │   │   ├── 📄 Dashboard.jsx    # Main dashboard (search, create patient)
    │   │   ├── 📄 PatientRecord.jsx # Patient record view (overview, timeline)
    │   │   ├── 📄 NewEncounterForm.jsx # New encounter creation form
    │   │   └── 📄 PrivateRoute.jsx # Route protection component
    │   │
    │   ├── 📂 utils/               # Utility functions
    │   │   └── 📄 api.js           # Axios API client configuration
    │   │
    │   ├── 📄 App.jsx              # Main app component with routing
    │   ├── 📄 main.jsx             # React entry point
    │   └── 📄 index.css            # Global styles with Tailwind
    │
    ├── 📄 index.html               # HTML template
    ├── 📄 package.json             # Frontend dependencies and scripts
    ├── 📄 vite.config.js           # Vite build configuration
    ├── 📄 tailwind.config.js       # Tailwind CSS configuration
    ├── 📄 postcss.config.js        # PostCSS configuration
    └── 📄 .gitignore               # Git ignore rules
```

---

## 📊 File Statistics

### Backend Files
| Category | Files | Lines of Code (approx) |
|----------|-------|------------------------|
| Models | 3 | 150 |
| Routes | 3 | 400 |
| Middleware | 1 | 25 |
| Server | 1 | 60 |
| Utilities | 1 | 150 |
| **Total** | **9** | **~785** |

### Frontend Files
| Category | Files | Lines of Code (approx) |
|----------|-------|------------------------|
| Components | 5 | 1400 |
| Utils | 1 | 70 |
| Config | 4 | 100 |
| **Total** | **10** | **~1570** |

### Documentation Files
| File | Purpose | Lines |
|------|---------|-------|
| README.md | Overview | 200 |
| QUICKSTART.md | Quick start | 80 |
| SETUP_GUIDE.md | Detailed guide | 400 |
| PROJECT_SUMMARY.md | Implementation details | 500 |
| TESTING_CHECKLIST.md | Testing guide | 400 |
| USER_FLOWS.md | User journeys | 450 |
| **Total** | | **~2030** |

**Total Project:** ~4,385 lines across 25+ files

---

## 🔍 Detailed File Descriptions

### Backend Files

#### `backend/models/Patient.js`
**Purpose:** Mongoose schema for patient records
**Key Features:**
- Unique Health ID (MTN-XXXXXXXX format)
- Demographics (name, DOB, gender, address, phone)
- Medical history array
- Medication history array
- Immunization records array
- Biometric ID placeholder
- Timestamps (createdAt, updatedAt)

#### `backend/models/Encounter.js`
**Purpose:** Mongoose schema for clinical encounters
**Key Features:**
- Reference to Patient document
- Provider information (name, ID)
- Clinical notes
- Lab results with status tracking
- Discharge summary
- Automatic timestamp

#### `backend/models/Provider.js`
**Purpose:** Mongoose schema for healthcare providers
**Key Features:**
- Unique username
- Hashed password
- Facility name
- Creation timestamp

#### `backend/routes/authRoutes.js`
**Purpose:** Authentication endpoints
**Endpoints:**
- `POST /api/auth/register` - Register new provider
- `POST /api/auth/login` - Login and get JWT token
**Features:**
- Password hashing with bcryptjs
- JWT token generation
- Input validation
- Error handling

#### `backend/routes/patientRoutes.js`
**Purpose:** Patient management endpoints
**Endpoints:**
- `POST /api/patients` - Create new patient
- `GET /api/patients/:healthId` - Get patient by Health ID
- `GET /api/patients/:healthId/encounters` - Get all encounters
- `PUT /api/patients/:healthId` - Update patient info
**Features:**
- Automatic Health ID generation
- JWT authentication required
- Encounter timeline retrieval

#### `backend/routes/encounterRoutes.js`
**Purpose:** Encounter management endpoints
**Endpoints:**
- `POST /api/encounters` - Create new encounter
- `GET /api/encounters/:id` - Get specific encounter
- `PUT /api/encounters/:id` - Update encounter
**Features:**
- Links to patient and provider
- Lab results management
- Population of patient data

#### `backend/middleware/auth.js`
**Purpose:** JWT authentication middleware
**Features:**
- Token extraction from Authorization header
- Token verification
- User data injection into request
- Automatic 401 on invalid token

#### `backend/server.js`
**Purpose:** Express server setup
**Features:**
- CORS configuration
- JSON body parsing
- MongoDB connection
- Route mounting
- Error handling middleware
- Health check endpoint

#### `backend/seed.js`
**Purpose:** Database seeding with sample data
**Creates:**
- 2 sample providers
- 2 sample patients
- 3 sample encounters
**Usage:** `npm run seed`

### Frontend Files

#### `frontend/src/components/Login.jsx`
**Purpose:** Provider authentication component
**Features:**
- Toggle between login and registration
- Form validation
- JWT storage in localStorage
- Error handling
- Professional gradient styling
- Loading states

#### `frontend/src/components/Dashboard.jsx`
**Purpose:** Main provider dashboard
**Features:**
- Search patients by Health ID
- Create new patient (modal form)
- Provider information display
- Quick stats cards
- Logout functionality
- Real-time validation
- Complete patient creation form

#### `frontend/src/components/PatientRecord.jsx`
**Purpose:** Patient record viewer
**Features:**
- Patient header with avatar
- Tabbed interface (Overview/Encounters)
- Demographics display
- Medical history sections (color-coded)
- Encounter timeline visualization
- Expandable encounter details
- Age calculation
- Multi-facility support
- New encounter button

#### `frontend/src/components/NewEncounterForm.jsx`
**Purpose:** Create new encounter
**Features:**
- Patient information header
- Clinical notes input (required)
- Lab results management (add/remove)
- Status tracking for lab tests
- Discharge summary input
- Form validation
- Success confirmation
- Auto-redirect after save

#### `frontend/src/components/PrivateRoute.jsx`
**Purpose:** Route protection
**Features:**
- JWT token validation
- Automatic redirect to login
- Wrapper for protected routes

#### `frontend/src/utils/api.js`
**Purpose:** Axios API client
**Features:**
- Base URL configuration
- JWT token injection
- Response interceptors
- Automatic token refresh handling
- 401 error handling
- API endpoint functions

#### `frontend/src/App.jsx`
**Purpose:** Main application component
**Features:**
- React Router setup
- Route definitions
- Private route wrapping
- Root redirect logic

#### `frontend/src/main.jsx`
**Purpose:** React application entry point
**Features:**
- React root creation
- App component mounting
- Strict mode enabled

#### `frontend/src/index.css`
**Purpose:** Global styles
**Features:**
- Tailwind directives
- Custom component classes
- Utility class definitions
- Typography settings

### Configuration Files

#### `frontend/vite.config.js`
**Purpose:** Vite build configuration
**Features:**
- React plugin
- Dev server settings
- Proxy configuration for API
- Port configuration (3000)

#### `frontend/tailwind.config.js`
**Purpose:** Tailwind CSS configuration
**Features:**
- Content paths
- Custom color palette
- Theme extensions
- Primary color variants

#### `frontend/postcss.config.js`
**Purpose:** PostCSS configuration
**Features:**
- Tailwind CSS plugin
- Autoprefixer plugin

#### `backend/.env`
**Purpose:** Environment variables
**Contains:**
- PORT (5000)
- MONGODB_URI
- JWT_SECRET
- NODE_ENV

---

## 📦 Dependencies

### Backend Dependencies (package.json)
```json
{
  "express": "^4.18.2",          // Web framework
  "mongoose": "^8.0.0",          // MongoDB ODM
  "bcryptjs": "^2.4.3",          // Password hashing
  "jsonwebtoken": "^9.0.2",      // JWT authentication
  "dotenv": "^16.3.1",           // Environment variables
  "cors": "^2.8.5",              // Cross-origin resource sharing
  "uuid": "^9.0.1"               // Unique ID generation
}
```

### Frontend Dependencies (package.json)
```json
{
  "react": "^18.2.0",            // UI library
  "react-dom": "^18.2.0",        // React DOM renderer
  "react-router-dom": "^6.20.0", // Routing
  "axios": "^1.6.2",             // HTTP client
  "tailwindcss": "^3.3.6",       // Utility-first CSS
  "vite": "^5.0.8"               // Build tool
}
```

---

## 🎯 Key Files to Understand First

If you're new to the codebase, start with these files in order:

1. **`README.md`** - Overview of the project
2. **`QUICKSTART.md`** - Get the app running
3. **`backend/server.js`** - Understand the backend structure
4. **`backend/models/Patient.js`** - Core data model
5. **`frontend/src/App.jsx`** - Understand routing
6. **`frontend/src/components/Dashboard.jsx`** - Main UI workflow
7. **`frontend/src/utils/api.js`** - API communication
8. **`SETUP_GUIDE.md`** - Deep dive into features

---

## 🔧 Scripts Reference

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
npm run seed       # Seed database with sample data
```

### Frontend Scripts
```bash
npm run dev        # Start development server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 📈 Growth Path

As the project expands, consider this structure:

```
Future Additions:
backend/
├── controllers/    # Business logic separation
├── services/       # Service layer
├── validators/     # Input validation
├── tests/         # Unit and integration tests
└── config/        # Configuration management

frontend/
├── hooks/         # Custom React hooks
├── contexts/      # React context providers
├── services/      # API service layer
├── constants/     # App constants
└── tests/         # Component tests
```

---

## 💾 Database Collections

**MongoDB Database:** `meditrackng`

**Collections:**
1. `providers` - Healthcare provider accounts
2. `patients` - Patient records with medical history
3. `encounters` - Clinical visit records

**Indexes:**
- `providers.username` (unique)
- `patients.healthId` (unique)
- `encounters.patientId` (for fast lookup)

---

## 🚀 Deployment Files (Future)

For production deployment, you'll add:

```
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .github/
│   └── workflows/
│       └── deploy.yml
└── scripts/
    ├── deploy.sh
    └── backup.sh
```

---

**This completes the file structure documentation for MediTRACKNG MVP!**
