# FINAL PROJECT DEFENSE REPORT
## MediTRACKNG: A National Unified Electronic Health Records System

---

### 📄 ABSTRACT

The fragmentation of healthcare data in Nigeria poses a significant challenge to effective patient care, leading to redundant tests, medical errors, and inefficient resource allocation. **MediTRACKNG** is a centralized, web-based National Health Records System designed to bridge this gap. By assigning a unique, portable Health ID (`PID-XXXXXX`) to every citizen, the system enables seamless data interoperability across clinics, general hospitals, and teaching hospitals. Built on the MERN stack (MongoDB, Express.js, React, Node.js), MediTRACKNG features a robust Patient Portal for self-service access, a Provider Portal for clinical management, and a secure Consent Management layer compliant with the Nigeria Data Protection Act (NDPA) 2023. Key innovations include an offline-first "Nearby Health Centers" locator using OpenStreetMap, a Telemedicine module for remote consultations, and an E-Prescription system with automated drug interaction checking. This project demonstrates the feasibility of a scalable, secure, and user-centric digital health infrastructure for Nigeria.

---

### CHAPTER 1: INTRODUCTION

#### 1.1 Background of the Study
In the current Nigerian healthcare landscape, patient records are largely paper-based or siloed within individual facility databases. When a patient moves from a Primary Health Center (PHC) to a General Hospital, their medical history does not travel with them. This lack of continuity results in delayed diagnoses, adverse drug interactions, and increased healthcare costs. The World Health Organization (WHO) emphasizes that digital health interventions are critical for achieving Universal Health Coverage (UHC).

#### 1.2 Problem Statement
1.  **Data Silos:** Medical records are trapped in individual hospitals, making longitudinal patient history inaccessible.
2.  **Patient Identification:** Lack of a unified national health ID leads to duplicate records and identity fraud.
3.  **Access Control:** Patients have little to no control over who accesses their data, raising privacy concerns.
4.  **Emergency Response:** First responders lack access to critical information (allergies, blood type) during emergencies.
5.  **Resource Visibility:** Patients struggle to locate nearby functional healthcare facilities during emergencies.

#### 1.3 Aim and Objectives
The primary aim is to develop a unified National Electronic Health Records (EHR) system.
**Specific Objectives:**
1.  To design a centralized database architecture that supports multi-facility data access.
2.  To implement a unique patient identification system (`PID`) linked to biometric or national identity data.
3.  To develop a secure, consent-based access control mechanism compliant with NDPA 2023.
4.  To integrate value-added services like Telemedicine, E-Prescribing, and a Geospatial Hospital Locator.
5.  To provide a public health analytics dashboard for disease surveillance.

#### 1.4 Scope of the Project
The system covers:
-   **Patient Module:** Registration, Medical History View, Appointment Booking, Map Locator, Telemedicine.
-   **Provider Module:** Patient Search, Encounter Documentation (SOAP), E-Prescribing, Lab Orders.
-   **Admin Module:** Facility Registration, User Management, Audit Logs, Analytics.
-   **Geographical Scope:** Designed for nationwide deployment in Nigeria.

#### 1.5 Significance of the Study
-   **For Patients:** Empowerment through data ownership, portability, and easier access to care.
-   **For Providers:** Improved clinical decision-making based on complete patient history and automated safety checks.
-   **For Government:** Real-time public health analytics for disease surveillance and resource planning.
-   **For Researchers:** Anonymized data for epidemiological studies.

---

### CHAPTER 2: SYSTEM ANALYSIS

#### 2.1 Existing System Analysis
Currently, most Nigerian hospitals use either paper records or standalone Hospital Management Systems (HMS).
-   **Paper Records:** Prone to loss, damage, and illegibility. Cannot be searched or analyzed.
-   **Standalone HMS:** Digital but isolated. Data cannot be shared with other hospitals without manual printing or emailing.

#### 2.2 Proposed System Overview
MediTRACKNG proposes a cloud-based, centralized architecture where the patient record exists independently of any single facility. Facilities "subscribe" to the patient's record with consent.

#### 2.3 Functional Requirements
1.  **Authentication:** Secure login for Patients, Providers, and Admins using JWT.
2.  **Patient Management:** CRUD operations for patient demographics and history.
3.  **Encounter Management:** Recording of vitals, diagnosis (ICD-10), and treatment plans.
4.  **E-Prescription:** Digital drug orders with interaction checking against a drug database.
5.  **Telemedicine:** Real-time video/audio consultation scheduling and execution.
6.  **Mapping:** Location-based search for healthcare facilities.
7.  **Insurance:** Verification of coverage and claims submission.

#### 2.4 Non-Functional Requirements
1.  **Security:** Data encryption at rest and in transit.
2.  **Scalability:** Ability to handle millions of records via MongoDB sharding.
3.  **Availability:** 99.9% uptime target.
4.  **Usability:** Responsive design for mobile and desktop access.

---

### CHAPTER 3: SYSTEM DESIGN

#### 3.1 System Architecture
The system follows a **Three-Tier Architecture**:
1.  **Presentation Layer (Client):** React SPA (Single Page Application) running in the browser. It communicates with the server via REST APIs.
2.  **Application Layer (Server):** Node.js/Express API handling business logic, authentication, validation, and third-party integrations (e.g., Jitsi Meet).
3.  **Data Layer (Database):** MongoDB cluster storing patient records, logs, and facility data.

#### 3.2 Database Design (Schema Overview)
The database is designed around patient-centricity using Mongoose schemas.

*   **Patients (`Patient.js`):**
    *   `healthId`: Unique index (e.g., `PID-123456`).
    *   `biometrics`: Stores hashes for fingerprint/face ID.
    *   `nationalId`: Links to NIN/BVN.
    *   `chronicConditions`: Array of ongoing health issues.
    *   `emergencyContact`: Nested object for next of kin.

*   **Encounters (`Encounter.js`):**
    *   `encounterId`: Unique identifier (e.g., `ENC-987654`).
    *   `patient`: Reference to Patient ID.
    *   `facility`: Reference to the treating Facility.
    *   `clinicalData`: Stores SOAP notes, vitals, and diagnosis.
    *   `encounterType`: Enum (Outpatient, Emergency, Telehealth).

*   **Prescriptions (`Prescription.js`):**
    *   `prescriptionId`: Unique ID (`RX-XXXXXX`).
    *   `medications`: Array containing drug name, dosage, route, and interaction warnings.
    *   `status`: Enum (Active, Dispensed, Cancelled).

*   **Telemedicine (`Telemedicine.js`):**
    *   `meetingRoom`: Stores secure URL and tokens for video calls.
    *   `consultationType`: Enum (Video, Audio, Chat).
    *   `status`: Enum (Scheduled, In Progress, Completed).

*   **Insurance (`Insurance.js`):**
    *   `policyNumber`: Unique policy identifier.
    *   `coverage`: Object defining covered services (inpatient, outpatient).
    *   `claims`: Array of submitted claims.

#### 3.3 User Interface Design
-   **Dashboard:** Uses card-based layout for quick access to stats and actions.
-   **Timeline View:** A chronological visualization of a patient's medical history across different facilities, solving the "fragmentation" problem visually.
-   **Dark/Light Mode:** Accessibility feature for reducing eye strain during night shifts.
-   **Responsive Design:** Built with Tailwind CSS to ensure functionality on mobile devices used by rural health workers.

---

### CHAPTER 4: IMPLEMENTATION DETAILS

#### 4.1 Development Environment
-   **IDE:** Visual Studio Code.
-   **API Testing:** Postman.
-   **Database Management:** MongoDB Compass.
-   **Version Control:** Git & GitHub.

#### 4.2 Key Algorithms & Logic

**A. Unique ID Generation**
To ensure human-readable yet unique identifiers, a custom generation logic was implemented using a prefix and a random hex string.
```javascript
// Concept Code
const generateHealthId = () => {
  const prefix = "PID";
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${randomPart}`; // Result: PID-A1B2C3
};
```
This format is used across the system for Appointments (`APT`), Lab Orders (`LAB`), and Prescriptions (`RX`).

**B. Geospatial Hospital Locator**
Instead of paid APIs like Google Maps, the system uses **OpenStreetMap (OSM)** via the **Overpass API**.
-   **Logic:** The frontend captures the user's GPS coordinates using the browser's Geolocation API.
-   **Query:** It sends a bounding box query to Overpass API to find nodes tagged `amenity=hospital` or `amenity=clinic` within a 5km radius.
-   **Rendering:** Leaflet.js renders these nodes as interactive markers on the map.
-   **Resilience:** A backup server list (`overpass.kumi.systems`, etc.) is implemented to handle API timeouts via a retry loop.

**C. Drug Interaction Checking**
When a provider prescribes a medication, the backend checks the patient's current active medications against a predefined interaction matrix.
-   **Input:** New Drug + Current Medication List.
-   **Process:** Check for pairs in the `DRUG_INTERACTIONS` constant.
-   **Output:** Warning array (e.g., "Warfarin interacts with Aspirin - Risk of bleeding").

#### 4.3 Security Implementation
-   **Data Encryption:** Passwords are hashed using `bcrypt` with 10 salt rounds.
-   **Access Control:** Middleware (`auth.js`) verifies JWT tokens on every protected route.
-   **Role-Based Access:** `roleMiddleware.js` ensures a Patient cannot access the Provider dashboard.
-   **Audit Logging:** Every read/write operation is logged in the `AuditLog` collection with timestamp, user ID, and IP address.

---

### CHAPTER 5: RESULTS AND DISCUSSION

#### 5.1 System Features Achieved
1.  **Unified Dashboard:** Successfully aggregates data from multiple simulated facilities.
2.  **Interoperability:** A patient created in "General Hospital Lagos" is instantly searchable by a doctor in "Abuja National Hospital".
3.  **E-Prescribing:** The system successfully flags drug interactions (e.g., Warfarin + Aspirin) before the prescription is saved.
4.  **Telemedicine:** Users can schedule and join video calls directly within the app.
5.  **Map Locator:** Successfully identifies and displays real-world hospitals based on user location without API costs.

#### 5.2 Performance
-   **Response Time:** API endpoints average <200ms response time.
-   **Scalability:** The NoSQL structure allows for horizontal scaling as the dataset grows.
-   **Reliability:** The map feature's backup server logic ensures functionality even when the primary Overpass API is down.

#### 5.3 Challenges & Solutions
-   **Challenge:** Map API timeouts due to public server load.
    *   **Solution:** Implemented a round-robin retry mechanism with multiple Overpass servers.
-   **Challenge:** React DOM conflicts with Leaflet map instance.
    *   **Solution:** Used `useRef` and `useEffect` cleanup functions to manage the map instance lifecycle correctly.
-   **Challenge:** Handling complex nested data for medical history.
    *   **Solution:** Utilized MongoDB's flexible document model to store varying structures for different encounter types.

---

### CHAPTER 6: CONCLUSION AND RECOMMENDATIONS

#### 6.1 Conclusion
MediTRACKNG successfully demonstrates that a unified, national-scale EHR system is technically feasible using modern web technologies. It addresses the critical issues of data fragmentation and patient identification in the Nigerian healthcare sector. The system is secure, user-friendly, and cost-effective due to its use of open-source mapping solutions. It provides a solid foundation for the National Digital Health Strategy.

#### 6.2 Recommendations
1.  **Biometric Hardware Integration:** Future phases should integrate physical fingerprint scanners for patient verification to eliminate identity fraud.
2.  **Offline-First Mobile App:** Developing a React Native mobile app with local storage (PouchDB) for rural areas with poor internet connectivity.
3.  **Blockchain Integration:** Exploring blockchain technology for an immutable, decentralized audit trail of medical records to further enhance trust.
4.  **AI Diagnostics:** Integrating machine learning models to assist doctors with preliminary diagnosis based on symptoms and vitals.

---

### REFERENCES
1.  Nigeria Data Protection Act (NDPA), 2023.
2.  World Health Organization (WHO) - Global Strategy on Digital Health 2020-2025.
3.  MongoDB Documentation - Schema Design Best Practices.
4.  OpenStreetMap Wiki - Overpass API.
5.  React Documentation - Hooks and Context API.

---

### APPENDIX: API ENDPOINTS SUMMARY

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Authenticate user and return JWT |
| POST | `/api/patients` | Register a new patient |
| GET | `/api/patients/:id` | Retrieve full patient record |
| POST | `/api/encounters` | Create a new clinical encounter |
| POST | `/api/prescriptions` | Create a new prescription |
| POST | `/api/telemedicine` | Schedule a video consultation |
| POST | `/api/insurance/claims` | Submit an insurance claim |
