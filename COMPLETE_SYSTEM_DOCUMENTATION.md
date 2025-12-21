# MediTRACKNG - Complete National Health Records System Documentation

> **Version:** 2.0.0
> **Last Updated:** December 21, 2025
> **Status:** MVP / Operational

---

## 📑 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Features](#2-system-architecture--features)
3. [Quick Start Guide](#3-quick-start-guide)
4. [Detailed Setup Guide](#4-detailed-setup-guide)
5. [User Flows & Usage](#5-user-flows--usage)
6. [API Documentation](#6-api-documentation)
7. [Frontend Documentation](#7-frontend-documentation)
8. [Backend Documentation](#8-backend-documentation)
9. [File Structure](#9-file-structure)

---

## 1. Executive Summary

**MediTRACKNG** is a comprehensive, centralized Electronic Health Record (EHR) and Hospital Management System designed to unify healthcare data across Nigeria. It addresses the fragmentation of medical records by providing a single, secure platform where patient data follows the patient, regardless of the healthcare facility they visit.

### Core Value Proposition
- **Unified Patient Identity:** Unique Health IDs (`PID-XXXXXX`) linked to national identity.
- **Interoperability:** Seamless data sharing between clinics, general hospitals, and teaching hospitals.
- **Patient Empowerment:** Citizens have direct access to their own records via the Patient Portal.
- **National Infrastructure:** Built to scale as a national digital health backbone.

---

## 2. System Architecture & Features

### 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│         NATIONAL HEALTH RECORDS SYSTEM              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Patient    │  │   Provider   │  │ Facility │ │
│  │   Portal     │  │   Portal     │  │  Admin   │ │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │                │       │
│         └─────────────────┼────────────────┘       │
│                           │                        │
│                  ┌────────▼────────┐               │
│                  │  Consent Layer  │               │
│                  │   + Audit Log   │               │
│                  └────────┬────────┘               │
│                           │                        │
│                  ┌────────▼────────┐               │
│                  │   National EHR  │               │
│                  │    Database     │               │
│                  └─────────────────┘               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 🔑 Key Modules

#### 1. National Health Infrastructure
- **Consent Management:** Patients control who sees their data (Full, Emergency, View-Only).
- **Audit Trails:** NDPA 2023 compliant logging of every record access.
- **Public Health Analytics:** Disease surveillance and population health insights.

#### 2. Patient Portal (The "Citizen's View")
- **Dashboard:** Vitals, upcoming appointments.
- **Health Records:** Full history, lab results, prescriptions.
- **Nearby Health Centers:** Interactive map finding local facilities (OpenStreetMap).
- **Telemedicine:** Video consultations.

#### 3. Provider Portal (The "Clinician's Workspace")
- **Patient Search:** Global lookup via Health ID.
- **Encounter Management:** SOAP notes, diagnosis, discharge summaries.
- **CPOE:** E-Prescriptions and Lab Orders with interaction checking.

---

## 3. Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

### 🚀 Installation Steps

1.  **Clone & Install Dependencies**
    ```powershell
    # Backend
    cd backend
    npm install

    # Frontend
    cd ../frontend
    npm install
    ```

2.  **Configure Environment**
    Create `backend/.env`:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/meditrackng
    JWT_SECRET=your_secure_secret_key
    ```

3.  **Seed Data (Optional)**
    ```powershell
    cd backend
    npm run seed
    ```

4.  **Start the System**
    **Terminal 1 (Backend):**
    ```powershell
    cd backend
    npm run dev
    ```
    **Terminal 2 (Frontend):**
    ```powershell
    cd frontend
    npm run dev
    ```

5.  **Access the App**
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:5000`

### 👥 Default Credentials (After Seeding)
- **Provider:** `dr.johnson` / `password123`
- **Patient:** `PID-DEMO0001` / `password123`

---

## 4. Detailed Setup Guide

### Database Setup
- **MongoDB Local:** Ensure `mongod` service is running. Default URI is `mongodb://localhost:27017/meditrackng`.
- **MongoDB Atlas:** Replace `MONGODB_URI` in `.env` with your connection string.

### ID Migration
If upgrading from an older version, run migration scripts to standardize IDs:
```powershell
cd backend
node scripts/migrateAppointmentIds.js
node scripts/migrateLabOrderIds.js
```

### Production Checklist
1.  Set `NODE_ENV=production`.
2.  Use a strong `JWT_SECRET`.
3.  Enable HTTPS.
4.  Configure CORS whitelist.
5.  Set up process management (PM2).

---

## 5. User Flows & Usage

### 🔐 Authentication
- **Provider Register:** `/register` -> Create account -> Auto-login.
- **Provider Login:** `/login` -> Enter credentials -> Dashboard.
- **Patient Login:** `/login` -> Select "Patient" -> Enter Health ID & Password.

### 👥 Patient Management
1.  **Create Patient:** Dashboard -> "Create New Patient" -> Fill Form -> Get `PID-XXXXXX`.
2.  **Search Patient:** Dashboard -> Enter `PID-XXXXXX` -> View Record.

### 📋 Encounter Management
1.  **View Record:** Search Patient -> Overview Tab / Encounter History Tab.
2.  **New Encounter:** Click "+ New Encounter" -> Add Notes/Labs/Rx -> Save.
3.  **Timeline:** View chronological history of all visits across all facilities.

### 🗺️ Nearby Health Centers
- **Access:** Patient Portal -> "Nearby Health Centers".
- **Features:** Auto-geolocation, 5km radius search, OpenStreetMap integration.
- **Tech:** Leaflet.js + Overpass API (No API keys required).

---

## 6. API Documentation

**Base URL:** `http://localhost:5000/api`
**Auth Header:** `Authorization: Bearer <token>`

### 🏥 Core Endpoints

#### Patients
- `POST /patients` - Create patient.
- `GET /patients/:healthId` - Get patient profile.
- `GET /patients/:healthId/encounters` - Get history.

#### Encounters
- `POST /encounters` - Create encounter.
- `GET /encounters/:id` - Get details.

#### Prescriptions (E-Rx)
- `POST /prescriptions` - Create prescription.
- `POST /prescriptions/check-interactions` - Check drug interactions.
- `GET /prescriptions/patient/:healthId` - Get active Rx.

#### Telemedicine
- `POST /telemedicine` - Schedule consultation.
- `POST /telemedicine/:id/start` - Start video call.

#### Insurance
- `POST /insurance` - Create policy.
- `POST /insurance/:id/claims` - Submit claim.

---

## 7. Frontend Documentation

**Stack:** React 18, Vite, Tailwind CSS, Leaflet.js.

### Key Components
- **`Dashboard.jsx`**: Main provider hub.
- **`PatientRecord.jsx`**: Comprehensive patient view with tabs.
- **`NearbyHealthCenters.jsx`**: Map interface using OpenStreetMap.
- **`AuthContext.jsx`**: Manages JWT state.

### Map Implementation
The map feature uses a 100% free stack:
- **Leaflet.js**: Rendering engine.
- **OpenStreetMap**: Tile provider.
- **Overpass API**: Data source for hospitals.
- **Backup Servers**: Implemented to handle API load/timeouts.

---

## 8. Backend Documentation

**Stack:** Node.js, Express, MongoDB (Mongoose).

### ID System
- **Patients:** `PID-XXXXXX`
- **Appointments:** `APT-XXXXXX`
- **Lab Orders:** `LAB-XXXXXX`
- **Prescriptions:** `RX-XXXXXX`
- **Encounters:** `ENC-XXXXXX`

### Security
- **JWT:** Stateless authentication.
- **Bcrypt:** Password hashing.
- **Role-Based Access:** Middleware ensures data isolation between Patients and Providers.

---

## 9. File Structure

```
MediTRACKNG/
├── backend/
│   ├── models/              # Mongoose Schemas (Patient, Encounter, etc.)
│   ├── routes/              # API Routes (auth, patients, prescriptions)
│   ├── middleware/          # Auth & Role checks
│   ├── scripts/             # Migration & Seed scripts
│   └── server.js            # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI (Forms, Cards)
    │   ├── pages/           # Route Pages (Dashboard, Login)
    │   ├── context/         # Global State (Auth, Settings)
    │   └── utils/           # API helpers
    └── vite.config.js
```

---

**MediTRACKNG - Transforming Healthcare Record-Keeping in Nigeria** 🇳🇬
*Built for the National Digital Health Strategy*
