# MediTRACKNG - Navigation & Feature Guide

## 🚀 Quick Start

### Access the Application
1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **Login**: Use registered provider credentials or register a new provider

### Default Test Credentials
- **Username**: admin
- **Password**: password123
- *(Register new providers via /api/auth/register endpoint)*

## 📋 Page Navigation

### 1. Dashboard (`/dashboard`)
**Purpose**: Main overview and patient search

**Features**:
- ✅ Quick stats (215 patients, 180 doctors, 520 appointments)
- ✅ Search patients by Health ID or name
- ✅ Create new patient (click "Add New Patient" button)
- ✅ View schedule and appointments
- ✅ Department overview charts
- ✅ Doctors schedule table

**Navigation From Here**:
- Click "Patients" in sidebar → Go to Patients page
- Click "Doctors" in sidebar → Go to Doctors page
- Click "Laboratory" in sidebar → Go to Laboratory page
- Search for patient → Click "Search" → Go to Patient Record

---

### 2. Patients (`/patients`)
**Purpose**: Complete patient directory and registry

**Features**:
- ✅ View all registered patients (1,247 total)
- ✅ Search by Health ID (MTN-XXXXXXXX) or name
- ✅ Patient table with demographics and contact info
- ✅ Add new patient with Health ID generation
- ✅ View active records count (1,198 active)

**How to Use**:
1. **Search Patient**: Type in search bar (Health ID or name)
2. **Add New Patient**: Click "Add New Patient" button
   - Fill in: Name, DOB, Gender, Phone, Address
   - Add: Medical history, medications, immunizations
   - Click "Register Patient & Generate Health ID"
   - System creates unique Health ID (e.g., MTN-A1B2C3D4)
3. **View Record**: Click "View Record" button on any patient row
   - Takes you to full patient medical history

**Sample Patients**:
- MTN-A1B2C3D4 - Adewale Johnson (45M)
- MTN-B2C3D4E5 - Chioma Okafor (32F)
- MTN-C3D4E5F6 - Ibrahim Musa (58M)

---

### 3. Doctors (`/doctors`)
**Purpose**: Healthcare provider management

**Features**:
- ✅ Directory of 180 medical professionals
- ✅ Provider cards with specialty and status
- ✅ Filter by specialty or status (On Duty/Off Duty)
- ✅ Detailed table view with contact information
- ✅ Experience tracking and patient load

**Provider Specialties**:
- Cardiology, Pediatrics, General Surgery
- Obstetrics & Gynecology, Neurology
- Dermatology, Orthopedics, Psychiatry

**Sample Doctors**:
- DR001 - Dr. Adewale Johnson (Cardiology, 15 years, 28 patients)
- DR002 - Dr. Chioma Okafor (Pediatrics, 10 years, 35 patients)
- DR003 - Dr. Ibrahim Musa (General Surgery, 12 years, 22 patients)

---

### 4. Laboratory (`/laboratory`)
**Purpose**: Lab test tracking and results management

**Features**:
- ✅ Today's lab tests: 526
- ✅ Tests in progress: 120 (75% completion)
- ✅ Completed tests: 300
- ✅ Pending reports: 106
- ✅ Equipment status monitoring
- ✅ Laboratory work list with patient details

**Laboratory Work List**:
- Test ID, Patient Name, Gender
- Sample collection time
- Referring doctor
- Test type (CBC, Blood Sugar, Urinalysis, etc.)
- Status (Processing, Complete, Waiting)

**Equipment Monitoring**:
- Temperature: 23.5°C (Stable)
- All devices operational (Online)
- Last maintenance: 2 hours ago

---

### 5. Patient Record (`/patient/:healthId`)
**Purpose**: Complete medical history view

**Features**:
- ✅ Patient demographics with Health ID
- ✅ Medical history (conditions, allergies, surgeries)
- ✅ Current medications with dosages
- ✅ Immunization records
- ✅ Full encounter history across all facilities
- ✅ Lab results from all tests
- ✅ Add new encounter button

**Medical Information Displayed**:
- **Demographics**: Name, Age, Gender, Phone, Address
- **Medical History**: Chronic conditions, past illnesses, surgeries
- **Medications**: Current prescriptions with dosages
- **Immunizations**: Vaccination records (COVID-19, Hepatitis, etc.)
- **Encounters**: All past visits with dates, providers, diagnoses

**Actions**:
- Click "Add New Encounter" → Document new visit
- View encounter details → See full clinical notes
- Check lab results → View all test results

---

### 6. New Encounter (`/patient/:healthId/new-encounter`)
**Purpose**: Document new patient visits

**How to Add Encounter**:
1. **Visit Information**:
   - Visit date
   - Facility name
   - Type (Outpatient, Inpatient, Emergency)
   - Chief complaint

2. **Clinical Notes**:
   - Diagnosis
   - Treatment plan
   - Clinical observations

3. **Prescriptions**:
   - Medication name
   - Dosage
   - Frequency
   - Duration

4. **Lab Orders** (Optional):
   - Order required tests
   - Link results to patient record

5. **Save Encounter**:
   - Click "Save Encounter"
   - Adds to patient's medical history
   - Updates medication list

---

## 🔍 Common Workflows

### Workflow 1: Register New Patient
1. Login to system
2. Go to Dashboard or Patients page
3. Click "Add New Patient"
4. Fill in patient details
5. Add medical history and medications
6. Click "Register Patient"
7. System generates Health ID (MTN-XXXXXXXX)
8. Automatically redirected to patient record

### Workflow 2: Look Up Patient Record
1. Go to Dashboard or Patients page
2. Use search bar (enter Health ID or name)
3. Click "Search" or "View Record"
4. View complete medical history
5. Check medications, immunizations, encounters

### Workflow 3: Document Patient Visit
1. Search for patient (by Health ID)
2. Open patient record
3. Click "Add New Encounter"
4. Fill in visit details and diagnosis
5. Add prescriptions if needed
6. Save encounter
7. Record added to patient's history

### Workflow 4: Check Lab Results
1. Go to Laboratory page
2. View work list table
3. Find patient by name or Test ID
4. Check test status (Processing/Complete/Waiting)
5. Click on completed test to view results
6. Results automatically linked to patient record

### Workflow 5: View Doctor Availability
1. Go to Doctors page
2. Check provider status (On Duty/Off Duty)
3. Filter by specialty if needed
4. View patient load and experience
5. Contact doctor using phone number

---

## 🔐 Authentication & Security

### Login Process
1. Navigate to http://localhost:3000/login
2. Enter username and password
3. System validates credentials
4. JWT token generated (24-hour validity)
5. Redirected to Dashboard

### Protected Routes
All pages except `/login` require authentication:
- `/dashboard` - Dashboard
- `/patients` - Patient directory
- `/doctors` - Provider directory
- `/laboratory` - Lab management
- `/patient/:healthId` - Patient record
- `/patient/:healthId/new-encounter` - New encounter

### Session Management
- Token stored in localStorage
- Automatic logout after 24 hours
- Click "Log out" in sidebar to manually logout

---

## 📊 Data Flow

### Patient Registration
```
User Input → Frontend Form → POST /api/patients
→ Backend generates Health ID (MTN-XXXXXXXX)
→ Store in MongoDB
→ Return patient with Health ID
→ Display in UI
```

### Patient Search
```
Search Query → GET /api/patients?search=query
→ MongoDB query by Health ID or name
→ Return matching patients
→ Display in table/list
```

### Encounter Creation
```
Encounter Form → POST /api/encounters
→ Link to patient by Health ID
→ Store clinical notes, prescriptions, lab orders
→ Update patient's encounter history
→ Return saved encounter
```

### Lab Result Linking
```
Lab Test Complete → Laboratory Work List
→ Link test result to patient Health ID
→ Add to patient's medical record
→ Available in patient record view
```

---

## 🎨 UI Components

### Sidebar Navigation
- **Active Page**: Blue background, white text
- **Clickable Items**: Dashboard, Doctors, Patients, Laboratory
- **Non-functional**: Appointments, Emergency, Pharmacy, Staffs, Bills, Accounts, Settings
- **Actions**: Log out (red text)

### Top Bar
- **Search Bar**: Search patients (Dashboard, Patients, Doctors)
- **AI Assistant**: Purple button (feature placeholder)
- **Notifications**: Bell icon with red dot
- **User Profile**: Provider name and avatar

### Stat Cards
- **Number**: Large bold text
- **Description**: Gray text below number
- **Badge**: Colored indicator (growth %, status)
- **Icon**: Colored background circle

### Tables
- **Headers**: Bold text, gray background
- **Rows**: Hover effect for interactivity
- **Status Badges**: Color-coded (green=active, orange=processing, yellow=waiting)
- **Actions**: Blue text buttons ("View Record", "View Profile")

---

## 🛠 Technical Reference

### API Endpoints

**Authentication**
- POST `/api/auth/register` - Register new provider
- POST `/api/auth/login` - Provider login

**Patients**
- GET `/api/patients` - Get all patients (with optional search query)
- POST `/api/patients` - Create new patient
- GET `/api/patients/:healthId` - Get patient by Health ID
- PUT `/api/patients/:healthId` - Update patient information

**Encounters**
- GET `/api/encounters/patient/:healthId` - Get patient encounters
- POST `/api/encounters` - Create new encounter
- GET `/api/encounters/:id` - Get specific encounter
- PUT `/api/encounters/:id` - Update encounter

### Database Models

**Patient**
```javascript
{
  healthId: "MTN-XXXXXXXX", // Unique identifier
  demographics: { name, dateOfBirth, gender, address, phone },
  medicalHistory: [],
  medicationHistory: [],
  immunizationRecords: [],
  biometricId: ""
}
```

**Encounter**
```javascript
{
  patientId: healthId,
  encounterId: "unique-uuid",
  visitDate: Date,
  facilityName: "",
  encounterType: "Outpatient/Inpatient/Emergency",
  chiefComplaint: "",
  clinicalNotes: "",
  diagnosis: "",
  prescriptions: [],
  labResults: [],
  providerName: "",
  providerId: ""
}
```

---

## 🎯 Feature Status

### ✅ Fully Functional
- User authentication (login/logout)
- Patient registration with Health ID generation
- Patient search and directory
- Patient record view (full medical history)
- Encounter creation and documentation
- Doctor directory and management
- Laboratory work list and tracking
- Dashboard overview and statistics
- Navigation between all pages

### 🚧 Visual Only (Mock Data)
- Appointments page
- Emergency page
- Pharmacy page
- Staffs page
- Bills & Payments page
- Accounts page
- Settings page

### 📋 Planned Enhancements
- Real-time lab result entry
- Appointment scheduling integration
- Pharmacy inventory management
- Billing system integration
- Report generation (PDF exports)
- Advanced analytics and insights
- Mobile application

---

## 💡 Tips & Best Practices

1. **Always use Health ID**: Search by Health ID (MTN-XXXXXXXX) for accurate results
2. **Complete medical history**: Fill in all available fields when registering patients
3. **Document thoroughly**: Add detailed clinical notes in encounters
4. **Link lab results**: Always associate lab tests with patient Health ID
5. **Update medications**: Keep medication list current in encounters
6. **Track immunizations**: Record all vaccinations in patient profile
7. **Multi-facility**: Specify facility name in each encounter for tracking

---

## 🆘 Troubleshooting

### Can't Find Patient
- Verify Health ID format: MTN-XXXXXXXX (8 characters after MTN-)
- Try searching by patient name
- Check if patient is registered (go to Patients page)

### Encounter Not Saving
- Ensure all required fields are filled
- Check patient Health ID is valid
- Verify you're logged in (check for token)

### Navigation Not Working
- Make sure both servers are running (backend on 5000, frontend on 3000)
- Check browser console for errors
- Clear browser cache and reload

### Login Issues
- Verify credentials are correct
- Ensure backend server is running
- Check network connection
- Register new provider if needed

---

## 📞 System Information

**Frontend**: React 18 + Vite + Tailwind CSS
**Backend**: Node.js + Express.js + MongoDB Atlas
**Authentication**: JWT (JSON Web Tokens)
**Database**: MongoDB Atlas (Cloud)
**Ports**: Backend (5000), Frontend (3000)

**Project Goal**: Secure, centralized digital medical history record-keeping system for Nigerian citizens

**Health ID Format**: MTN-XXXXXXXX (e.g., MTN-A1B2C3D4)
