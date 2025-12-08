# MediTRACKNG - User Flows & Screenshots Guide

## 🔐 Authentication Flow

### Flow 1: Provider Registration
```
1. Visit http://localhost:3000
   └─→ Redirects to /login (not authenticated)

2. Click "Don't have an account? Register"
   └─→ Form switches to registration mode

3. Fill in registration form:
   - Username: dr.smith
   - Password: ********
   - Facility Name: General Hospital Lagos

4. Click "Register"
   └─→ API: POST /api/auth/register
   └─→ JWT token generated
   └─→ Token saved to localStorage
   └─→ Redirect to /dashboard
```

**What happens behind the scenes:**
- Password is hashed with bcrypt (10 salt rounds)
- Provider record created in MongoDB
- JWT signed with secret key (24h expiration)
- Token includes: provider ID, username, facility name

### Flow 2: Provider Login
```
1. Visit /login page

2. Enter credentials:
   - Username: dr.smith
   - Password: ********

3. Click "Login"
   └─→ API: POST /api/auth/login
   └─→ Password verified with bcrypt
   └─→ JWT token returned
   └─→ Redirect to /dashboard
```

## 👥 Patient Management Flow

### Flow 3: Create New Patient
```
1. From Dashboard
   └─→ Click "Create New Patient" button

2. Modal opens with form
   └─→ Fill in required fields:
       • Full Name: Oluwaseun Adebayo
       • Date of Birth: 15/03/1985
       • Gender: Male
       • Phone: +234-801-234-5678
       • Address: 123 Victoria Island, Lagos

3. Add optional medical information:
   └─→ Medical History: Hypertension, Type 2 Diabetes
   └─→ Medications: Lisinopril 10mg, Metformin 500mg
   └─→ Immunizations: COVID-19, Hepatitis B

4. Click "Create Patient"
   └─→ API: POST /api/patients
   └─→ Unique Health ID generated: MTN-A1B2C3D4
   └─→ Patient saved to MongoDB
   └─→ Redirect to /patient/MTN-A1B2C3D4
```

**Health ID Generation Logic:**
```javascript
Format: MTN-XXXXXXXX
- MTN: Prefix (MediTRACKNG Nigeria)
- XXXXXXXX: 8-character unique identifier from UUID
- Example: MTN-A1B2C3D4, MTN-F7E8D9C0
```

### Flow 4: Search for Patient
```
1. From Dashboard
   └─→ Enter Health ID in search bar: MTN-A1B2C3D4

2. Click "Search" button
   └─→ API: GET /api/patients/MTN-A1B2C3D4
   └─→ Loading spinner appears

3. Patient found:
   └─→ Redirect to /patient/MTN-A1B2C3D4
   └─→ Display complete patient record

   OR

   Patient not found:
   └─→ Error message: "Patient not found. Please check the Health ID."
   └─→ Stay on dashboard for retry
```

## 📋 Encounter Management Flow

### Flow 5: View Patient Record
```
1. Navigate to /patient/:healthId

2. Patient Record Page Loads:
   └─→ API: GET /api/patients/:healthId (demographics)
   └─→ API: GET /api/patients/:healthId/encounters (history)

3. Two tabs available:
   ├─→ Overview Tab (default)
   │   ├─ Demographics Card
   │   ├─ Medical History Card (red theme)
   │   ├─ Medication History Card (green theme)
   │   └─ Immunization Records Card (purple theme)
   │
   └─→ Encounter History Tab
       └─ Timeline of all encounters
          ├─ Encounter 1 (most recent)
          ├─ Encounter 2
          └─ Encounter 3 (oldest)
```

**Timeline Features:**
- Numbered encounters (1, 2, 3...)
- Vertical line connecting encounters
- Provider name and facility
- Date and time of visit
- Expandable details (click to show/hide)
- Color-coded lab result status badges

### Flow 6: Create New Encounter
```
1. From Patient Record page
   └─→ Click "+ New Encounter" button

2. New Encounter Form opens
   └─→ URL: /patient/:healthId/new-encounter
   └─→ Patient info displayed at top

3. Fill in Clinical Notes (required):
   "Patient presented with elevated blood pressure (160/95).
    Complained of occasional headaches. Physical examination normal.
    Advised to continue current medication and monitor BP at home."

4. Add Lab Results (optional):
   └─→ Click "+ Add Lab Test"
   └─→ Enter test name: "Blood Glucose Test"
   └─→ Select status: "Pending" / "In Progress" / "Completed"
   └─→ Add link (optional): "https://lab.example.com/report/123"
   └─→ Can add multiple tests
   └─→ Can remove tests before saving

5. Add Discharge Summary (optional):
   "Continue Lisinopril 10mg daily and Metformin 500mg twice daily.
    Follow-up in 2 weeks. Advised on low-salt diet."

6. Click "Save Encounter"
   └─→ API: POST /api/encounters
   └─→ Request body includes:
       • healthId or patientId
       • clinicalNotes
       • labResults array
       • dischargeSummary
   └─→ Provider info automatically added from JWT
   └─→ Success message appears
   └─→ Auto-redirect to patient record after 2 seconds

7. Encounter appears in timeline
   └─→ Most recent encounter at top
   └─→ All details saved correctly
```

## 🔄 Multi-Facility Flow

### Flow 7: Cross-Facility Patient Access
```
Scenario: Patient visits two different hospitals

1. Hospital A (General Hospital Lagos)
   └─→ Provider: dr.johnson
   └─→ Creates patient: MTN-A1B2C3D4
   └─→ Adds Encounter 1: Initial consultation
   └─→ Patient data saved to central database

2. Patient visits Hospital B (Federal Medical Centre Abuja)
   └─→ Provider: dr.adeyemi logs in
   └─→ Searches patient: MTN-A1B2C3D4
   └─→ Can view ALL previous encounters (including Hospital A)

3. Provider at Hospital B views timeline:
   ├─→ Encounter 1 - General Hospital Lagos (dr.johnson)
   └─→ Complete clinical notes and lab results visible

4. Provider at Hospital B adds new encounter:
   └─→ Encounter 2 - Federal Medical Centre Abuja (dr.adeyemi)
   └─→ New encounter saved

5. Result: Complete patient history across facilities
   ├─→ Encounter 2 - Federal Medical Centre Abuja (most recent)
   └─→ Encounter 1 - General Hospital Lagos
```

**Key Feature:** Informed consent is assumed for MVP. In production:
- Add consent management system
- Log access attempts
- Notify patient of record access
- Implement role-based access control

## 🎨 UI State Indicators

### Loading States
```
Search Patient:
└─→ Button text: "Searching..." (disabled)
└─→ Spinner visible

Create Patient:
└─→ Button text: "Creating..." (disabled)
└─→ Form inputs disabled

Save Encounter:
└─→ Button text: "Saving Encounter..." (disabled)
└─→ All buttons disabled

Load Patient Record:
└─→ Full-page spinner with message
└─→ "Loading patient data..."
```

### Success States
```
Login Success:
└─→ Immediate redirect to dashboard
└─→ Welcome message (optional enhancement)

Patient Created:
└─→ Modal closes
└─→ Redirect to patient record
└─→ Success message on new page

Encounter Saved:
└─→ Green success banner
└─→ Checkmark icon
└─→ "Encounter created successfully! Redirecting..."
└─→ Auto-redirect after 2 seconds
```

### Error States
```
Login Failed:
└─→ Red error banner above form
└─→ Message: "Invalid credentials"
└─→ Form remains filled for retry

Patient Not Found:
└─→ Red error banner
└─→ Message: "Patient not found. Please check the Health ID."
└─→ Search bar remains for retry

Network Error:
└─→ Red error banner
└─→ Message: "Failed to connect. Please try again."
└─→ Retry button available
```

## 📱 Responsive Behavior

### Desktop (1920px)
```
Dashboard:
├─ Full-width search bar
├─ 3-column quick stats
└─ Large "Create Patient" button

Patient Record:
├─ Wide cards with padding
├─ 4-column demographics grid
└─ Side-by-side timeline view
```

### Tablet (768px)
```
Dashboard:
├─ Stacked search and create button
├─ 2-column quick stats
└─ Medium-sized cards

Patient Record:
├─ 2-column demographics grid
├─ Stacked cards
└─ Full-width timeline
```

### Mobile (375px)
```
Dashboard:
├─ Full-width elements
├─ Single-column layout
├─ Stacked quick stats
└─ Large touch targets

Patient Record:
├─ Single-column layout
├─ Collapsible sections
├─ Vertical timeline
└─ Scrollable content
```

## 🔒 Security Flow

### Authentication Check
```
Every Route Request:
1. Check localStorage for token
   ├─ No token? → Redirect to /login
   └─ Has token? → Continue

2. API Request includes token:
   └─→ Header: Authorization: Bearer <token>

3. Backend validates token:
   ├─ Valid? → Process request
   ├─ Expired? → Return 401 → Redirect to /login
   └─ Invalid? → Return 401 → Redirect to /login

4. Token cleared on:
   ├─ Logout button click
   ├─ 401 response from API
   └─ Manual localStorage clear
```

## 📊 Data Flow Diagram

```
[Provider] → [Login Form] → [Backend API]
                                  ↓
                            [MongoDB: Providers]
                                  ↓
                            [JWT Token] → [localStorage]
                                  ↓
[Dashboard] ← [Token] → [Protected Routes]
     ↓
[Search Patient] → [Backend API] → [MongoDB: Patients]
     ↓                                     ↓
[Patient Record] ←──────────────────────────
     ↓
[View Encounters] → [Backend API] → [MongoDB: Encounters]
     ↓                                     ↓
[Encounter Timeline] ←──────────────────────
     ↓
[Create Encounter] → [Form Data] → [Backend API]
                                         ↓
                                   [MongoDB: Encounters]
                                         ↓
                                   [Success] → [Redirect]
```

## 🎯 Critical User Paths

### Path 1: First-Time Provider Setup (2-3 minutes)
```
1. Register → 2. Create First Patient → 3. Add First Encounter → 4. View Timeline
```

### Path 2: Daily Provider Workflow (30 seconds)
```
1. Login → 2. Search Patient → 3. View Record → 4. Add Encounter
```

### Path 3: Emergency Access (10 seconds)
```
1. Login → 2. Quick Search → 3. View Critical Info (Medical History)
```

---

## 💡 Pro Tips for Users

**For Providers:**
1. Keep Health IDs accessible (bookmark, save, or print)
2. Always add detailed clinical notes
3. Update lab results status when reports are ready
4. Include follow-up instructions in discharge summary
5. Review complete encounter history before adding new encounter

**For Testing:**
1. Use sample data (npm run seed) for quick testing
2. Test with multiple providers to see multi-facility feature
3. Create patients with various medical histories
4. Add encounters with different lab result statuses
5. Test error cases (invalid Health ID, network errors)

**Common Shortcuts:**
- From Dashboard: Type Health ID and press Enter to search
- From Patient Record: Click patient name to copy Health ID (future enhancement)
- Use browser back button to navigate (React Router supports it)

---

**This completes the MediTRACKNG MVP user flow documentation!**
