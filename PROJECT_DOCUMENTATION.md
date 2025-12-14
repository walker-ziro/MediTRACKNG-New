# MediTRACKING - National Health Records System (Nigeria)

## 1. Executive Summary
MediTRACKING is a comprehensive, centralized Electronic Health Record (EHR) and Hospital Management System designed to unify healthcare data across Nigeria. It addresses the fragmentation of medical records by providing a single, secure platform where patient data follows the patient, regardless of the healthcare facility they visit. The system connects Patients, Healthcare Providers, and Administrators into a seamless ecosystem, improving care coordination, reducing medical errors, and enhancing operational efficiency.

## 2. Project Scope
The scope of MediTRACKING extends beyond a single hospital management software; it is architected as a **National Health Infrastructure**.

*   **Unified Patient Identity:** Assigns a unique Health ID to every citizen, linked to biometric and national identity data (NIN).
*   **Interoperability:** Allows different facilities (Clinics, General Hospitals, Teaching Hospitals, Labs) to share data securely.
*   **Telehealth Integration:** Bridges the gap between remote patients and urban specialists.
*   **Resource Management:** Tracks facility resources, bed occupancy, and revenue.

## 3. User Roles & Portals
The application is divided into three distinct but interconnected portals:

### A. Patient Portal (The "Citizen's View")
Empowers individuals to take control of their health.
*   **Dashboard:** Overview of health status, upcoming appointments, and vitals.
*   **Health Records:** Access to full medical history, including past visits, diagnoses, and discharge summaries.
*   **Prescriptions:** View active medications, dosage instructions, and request refills.
*   **Appointments:** Book physical or virtual consultations with doctors.
*   **Telemedicine:** Join video/audio consultations directly from the browser.
*   **Billing:** View invoices and payment history.

### B. Provider Portal (The "Clinician's Workspace")
Tools for doctors, nurses, and pharmacists to deliver care.
*   **Patient Management:** Search patients by Health ID, view comprehensive history before treatment.
*   **Clinical Documentation:** Create encounter notes (SOAP format), record diagnoses, and vital signs.
*   **CPOE (Computerized Physician Order Entry):** Electronically prescribe medications and order lab tests to prevent errors.
*   **Schedule Management:** Manage daily appointments and queue.
*   **Communication:** Secure messaging with other providers for referrals and second opinions.

### C. Admin Portal (The "Oversight Center")
For facility managers and government oversight bodies.
*   **User Management:** Onboard and manage staff accounts (Doctors, Nurses, Front Desk).
*   **Facility Management:** Configure hospital details, departments, and resources.
*   **Analytics Dashboard:** Real-time visualization of patient throughput, disease outbreaks, and revenue.
*   **Audit Logs:** Track system access for security and compliance.

## 4. Key Modules & Features

### 1. Unified Health Record
*   **Centralized Database:** A patient's allergy recorded in Lagos is immediately visible to a doctor in Abuja.
*   **Biometric Verification:** (Planned) Fingerprint/Face ID to prevent identity fraud.

### 2. E-Prescription System
*   **Drug Interaction Checks:** Automatically warns providers of potential adverse drug reactions based on patient history.
*   **Pharmacy Integration:** Prescriptions are sent directly to the pharmacy queue.

### 3. Telemedicine Suite
*   **Integrated Video Conferencing:** Secure, HIPAA-compliant video calls.
*   **Virtual Waiting Room:** Manages patient flow for online visits.

### 4. Laboratory & Diagnostics
*   **Digital Orders:** Providers order tests digitally.
*   **Result Portal:** Labs upload results directly to the patient's file, triggering notifications.

### 5. Billing & Revenue Cycle
*   **Invoicing:** Automated bill generation for services and medications.
*   **Payment Tracking:** Monitor paid, pending, and overdue bills.

## 5. Technical Architecture

### Technology Stack (MERN)
*   **Frontend:** React.js (Vite) with Tailwind CSS for a responsive, modern UI.
*   **Backend:** Node.js with Express.js for a scalable REST API.
*   **Database:** MongoDB (NoSQL) for flexible, document-based health records.
*   **Authentication:** JWT (JSON Web Tokens) with role-based access control (RBAC).

### Security & Compliance
*   **Data Encryption:** Sensitive data is hashed and encrypted.
*   **Access Control:** Strict separation of concerns; patients cannot see other patients' data; providers only access data necessary for care.
*   **Audit Trails:** Every record view and modification is logged.

## 6. Data Flow Scenario
1.  **Patient** books an appointment via the **Patient Portal**.
2.  **Provider** sees the appointment in the **Provider Portal** and accepts it.
3.  During the visit, the **Provider** records notes and orders a lab test.
4.  **Lab Technician** uploads results.
5.  **Provider** reviews results and issues an E-Prescription.
6.  **Patient** receives a notification, views results, and sees the prescription in their portal.
7.  **Admin** views the encounter statistics in the **Admin Dashboard**.

## 7. Future Roadmap
*   **AI-Powered Diagnostics:** Integration with Gemini/OpenAI to assist doctors with preliminary diagnosis suggestions.
*   **Offline Mode:** Mobile app support for rural areas with poor internet connectivity.
*   **Insurance Integration:** Direct claims processing with HMOs.
*   **IoT Integration:** Wearable device data syncing (Apple Health, Fitbit).

## 8. Implementation Details

### A. Project Structure
The project follows a monorepo-style structure with separate directories for the frontend and backend.

```
MediTRACKING/
├── backend/                # Node.js/Express Server
│   ├── models/             # Mongoose Schemas (Database Structure)
│   ├── routes/             # API Endpoints
│   ├── middleware/         # Auth & Error Handling
│   ├── scripts/            # Database Seeding & Maintenance
│   └── server.js           # Entry Point
│
└── frontend/               # React Client
    ├── src/
    │   ├── components/     # Reusable UI Components
    │   ├── context/        # Global State (Auth, Settings, Notifications)
    │   ├── hooks/          # Custom React Hooks (useApi)
    │   ├── layouts/        # Portal-specific Layout Wrappers
    │   ├── pages/          # Application Views
    │   │   ├── admin/      # Admin Portal Pages
    │   │   ├── patient/    # Patient Portal Pages
    │   │   └── provider/   # Provider Portal Pages
    │   └── App.jsx         # Routing Configuration
```

### B. Backend Architecture (Node.js + Express + MongoDB)

#### 1. Database Models (Mongoose)
The data layer is designed for relational integrity within a NoSQL environment.
*   **Core Entities:** `Patient`, `Provider`, `Facility`, `AdminAuth`.
*   **Clinical Data:** `Encounter`, `Prescription`, `Laboratory`, `Appointment`, `Telemedicine`.
*   **Operational Data:** `Bill`, `Inventory`, `Bed`, `Room`.
*   **Security:** `AuditLog`, `Consent`, `ProviderAuth`, `PatientAuth`.

#### 2. API Routes (RESTful)
The backend exposes a comprehensive API divided by domain:
*   `/api/multi-auth`: Handles login/signup for all three portals.
*   `/api/patient-portal`: Specialized endpoints for patient self-service (read-only clinical data).
*   `/api/encounters`: CRUD operations for clinical notes.
*   `/api/prescriptions`: Drug interaction checking and prescription generation.
*   `/api/telemedicine`: Video call token generation and session management.

#### 3. Middleware
*   `auth.js`: Verifies JWT tokens and attaches user context to requests.
*   `roleCheck.js`: Ensures only authorized roles (e.g., 'Doctor', 'Super Admin') access specific routes.

### C. Frontend Architecture (React + Vite)

#### 1. Routing (React Router)
The application uses a split-routing strategy to secure the three distinct portals:
*   **Public Routes:** Landing Page, Login/Signup Pages.
*   **Protected Routes:** Wrapped in `ProtectedProviderRoute`, `ProtectedPatientRoute`, or `ProtectedAdminRoute`.

#### 2. State Management (Context API)
*   `SettingsContext`: Manages Theme (Dark/Light mode) and Language preferences.
*   `NotificationContext`: Global toast notifications for success/error messages.
*   `AuthContext`: Manages user session and token persistence.

#### 3. Key Components
*   **Dashboard Widgets:** Reusable cards for stats (Appointments, Prescriptions).
*   **Data Tables:** Sortable and filterable tables for patient lists and records.
*   **Modals:** For forms like "New Appointment" or "Refill Request".

### D. Key Workflows & Logic

#### 1. Authentication Flow
1.  User selects portal (Patient/Provider/Admin).
2.  Credentials sent to `/api/multi-auth/{type}/login`.
3.  Server validates against specific collection (`PatientAuth`, `ProviderAuth`, etc.).
4.  JWT Token returned with `userType` payload.
5.  Frontend stores token and redirects to specific dashboard.

#### 2. Clinical Encounter Flow
1.  Provider searches for Patient by `healthId`.
2.  Provider creates new `Encounter`.
3.  System logs `AuditLog` entry for "Access".
4.  Provider adds `Prescription`.
5.  Backend checks `DRUG_INTERACTIONS` constant for conflicts.
6.  Data saved; Patient immediately sees update in Patient Portal.

#### 3. Telemedicine Flow
1.  Appointment created with `type: 'Video'`.
2.  Unique `meetingUrl` generated.
3.  At scheduled time, both parties click "Join Call".
4.  (Future) WebRTC connection established.

## 9. Setup & Installation

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas URI)

### Backend Setup
1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment (`.env`):
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    ```
4.  Seed Database (Optional):
    ```bash
    node scripts/seed_data.js
    ```
5.  Start Server:
    ```bash
    npm start
    ```

### Frontend Setup
1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Development Server:
    ```bash
    npm run dev
    ```
4.  Access app at `http://localhost:5173`.

