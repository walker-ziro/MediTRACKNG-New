# 📡 MediTRACKNG API Documentation - New Features

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT authentication unless specified otherwise.

**Header Format:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 E-PRESCRIPTION API

### Create Prescription
```http
POST /prescriptions
```

**Request Body:**
```json
{
  "patient": {
    "healthId": "HID-12345678",
    "name": "John Doe",
    "allergies": ["Penicillin"]
  },
  "provider": {
    "providerId": "PROV-001",
    "name": "Dr. Jane Smith",
    "licenseNumber": "MDL-12345"
  },
  "medications": [
    {
      "drugName": "Amoxicillin",
      "genericName": "Amoxicillin",
      "brandName": "Amoxil",
      "dosage": { "amount": 500, "unit": "mg" },
      "form": "Capsule",
      "frequency": "Three Times Daily",
      "route": "Oral",
      "duration": { "value": 7, "unit": "days" },
      "quantity": 21,
      "refills": 0,
      "instructions": "Take with food"
    }
  ],
  "diagnosis": "Bacterial infection",
  "notes": "Patient reported fever for 3 days"
}
```

**Response:**
```json
{
  "message": "Prescription created successfully",
  "prescription": {
    "prescriptionId": "RX-20251208-00001",
    "patient": { ... },
    "provider": { ... },
    "medications": [ ... ],
    "status": "Active",
    "validFrom": "2025-12-08T10:00:00Z",
    "validUntil": "2026-01-07T10:00:00Z"
  },
  "warnings": ["Warfarin interacts with Aspirin"]
}
```

### Check Drug Interactions
```http
POST /prescriptions/check-interactions
```

**Request Body:**
```json
{
  "patientHealthId": "HID-12345678",
  "medications": ["Warfarin", "Aspirin", "Ibuprofen"]
}
```

**Response:**
```json
{
  "interactions": [
    "⚠️ Warfarin interacts with Aspirin - Increased bleeding risk",
    "⚠️ Warfarin interacts with Ibuprofen - Increased bleeding risk"
  ],
  "allergies": [],
  "contraindications": []
}
```

### Get Patient Prescriptions
```http
GET /prescriptions/patient/:healthId?status=Active
```

**Response:**
```json
[
  {
    "prescriptionId": "RX-20251208-00001",
    "status": "Active",
    "medications": [ ... ],
    "createdAt": "2025-12-08T10:00:00Z",
    "validUntil": "2026-01-07T10:00:00Z"
  }
]
```

### Send to Pharmacy
```http
POST /prescriptions/:id/send-to-pharmacy
```

**Request Body:**
```json
{
  "pharmacyId": "PHARM-001",
  "pharmacyName": "HealthPlus Pharmacy"
}
```

### Mark Medication Dispensed
```http
PUT /prescriptions/:id/dispense/:medIndex
```

**Request Body:**
```json
{
  "pharmacyId": "PHARM-001",
  "pharmacyName": "HealthPlus Pharmacy",
  "pharmacist": "John Pharmacist"
}
```

### Cancel Prescription
```http
PUT /prescriptions/:id/cancel
```

**Request Body:**
```json
{
  "cancelledBy": "Dr. Jane Smith",
  "reason": "Alternative treatment chosen"
}
```

---

## 💻 TELEMEDICINE API

### Schedule Consultation
```http
POST /telemedicine
```

**Request Body:**
```json
{
  "patientHealthId": "HID-12345678",
  "providerId": "PROV-001",
  "providerName": "Dr. Jane Smith",
  "providerSpecialization": "General Practitioner",
  "facilityName": "Lagos General Hospital",
  "scheduledDate": "2025-12-10T10:00:00Z",
  "duration": 30,
  "consultationType": "Video",
  "chiefComplaint": "Persistent headache",
  "symptoms": ["Headache", "Nausea"],
  "urgency": "Routine"
}
```

**Response:**
```json
{
  "message": "Telemedicine consultation scheduled successfully",
  "consultation": {
    "consultationId": "TLM-20251208-00001",
    "patient": { ... },
    "provider": { ... },
    "scheduledDate": "2025-12-10T10:00:00Z",
    "status": "Scheduled",
    "meetingRoom": {
      "roomId": "abc123",
      "meetingUrl": "https://meet.meditrackng.ng/room/abc123",
      "password": "xyz789"
    }
  },
  "meetingUrl": "https://meet.meditrackng.ng/room/abc123"
}
```

### Start Consultation
```http
POST /telemedicine/:id/start
```

**Response:**
```json
{
  "message": "Consultation started",
  "consultation": { ... },
  "meetingUrl": "https://meet.meditrackng.ng/room/abc123"
}
```

### Complete Consultation
```http
POST /telemedicine/:id/complete
```

**Request Body:**
```json
{
  "clinicalNotes": {
    "subjective": "Patient complains of persistent headache",
    "objective": "BP: 120/80, Temp: 37.2°C",
    "assessment": "Tension headache",
    "plan": "Prescribe pain relievers, rest"
  },
  "vitals": {
    "bloodPressure": { "systolic": 120, "diastolic": 80 },
    "heartRate": 75,
    "temperature": 37.2
  },
  "diagnosis": ["Tension headache"],
  "prescriptions": [
    {
      "prescriptionId": "RX-20251208-00002",
      "medications": ["Paracetamol 500mg"]
    }
  ],
  "followUp": {
    "required": true,
    "scheduledDate": "2025-12-17T10:00:00Z",
    "type": "Telemedicine"
  },
  "connectionQuality": "Good"
}
```

### Submit Patient Feedback
```http
POST /telemedicine/:id/feedback
```

**Request Body:**
```json
{
  "rating": 5,
  "comments": "Excellent consultation, very helpful"
}
```

---

## 🏥 INSURANCE API

### Create Insurance Policy
```http
POST /insurance
```

**Request Body:**
```json
{
  "patientHealthId": "HID-12345678",
  "provider": {
    "name": "NHIS",
    "type": "NHIS",
    "code": "NHIS-001",
    "contactEmail": "info@nhis.gov.ng",
    "contactPhone": "+234-800-123-4567"
  },
  "policyNumber": "POL-2025-001",
  "policyType": "Individual",
  "effectiveDate": "2025-01-01",
  "expiryDate": "2025-12-31",
  "coverage": {
    "outpatient": true,
    "inpatient": true,
    "emergency": true,
    "surgery": true,
    "maternity": false,
    "dental": true,
    "optical": true,
    "pharmacy": true,
    "laboratory": true
  },
  "limits": {
    "annualLimit": 500000,
    "perVisitLimit": 50000,
    "emergencyLimit": 200000
  },
  "costSharing": {
    "deductible": 5000,
    "copayPercentage": 10
  }
}
```

### Verify Insurance Policy
```http
POST /insurance/:id/verify
```

**Request Body:**
```json
{
  "verifiedBy": "Insurance Clerk",
  "method": "API"
}
```

### Check Coverage
```http
POST /insurance/:id/check-coverage
```

**Request Body:**
```json
{
  "serviceType": "outpatient",
  "estimatedCost": 25000
}
```

**Response:**
```json
{
  "covered": true,
  "serviceType": "outpatient",
  "estimatedCost": 25000,
  "insuranceShare": 22500,
  "patientShare": 2500,
  "remainingLimit": 450000,
  "requiresPreAuth": false,
  "message": "Service is covered"
}
```

### Submit Claim
```http
POST /insurance/:id/claims
```

**Request Body:**
```json
{
  "encounterId": "ENC123",
  "facilityName": "Lagos General Hospital",
  "serviceDate": "2025-12-08",
  "amount": 25000,
  "serviceDetails": "Outpatient consultation and lab tests",
  "diagnosisCodes": ["J00", "R50.9"],
  "procedureCodes": ["99213", "80053"]
}
```

### Get Utilization Summary
```http
GET /insurance/:id/utilization
```

**Response:**
```json
{
  "totalLimit": 500000,
  "totalUtilized": 75000,
  "remainingLimit": 425000,
  "utilizationPercentage": "15.00",
  "claimsSummary": {
    "total": 5,
    "approved": 4,
    "pending": 1,
    "denied": 0
  },
  "byCategory": {
    "outpatient": 30000,
    "inpatient": 0,
    "emergency": 45000
  }
}
```

---

## 👨‍👩‍👧 FAMILY LINKS API

### Create Family Link
```http
POST /family-links
```

**Request Body:**
```json
{
  "primaryHealthId": "HID-12345678",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+234-801-234-5678",
    "email": "jane@example.com"
  }
}
```

### Add Family Member
```http
POST /family-links/:linkId/members
```

**Request Body:**
```json
{
  "healthId": "HID-87654321",
  "relationship": "Child",
  "accessLevel": "Full",
  "permissions": {
    "viewMedicalHistory": true,
    "viewPrescriptions": true,
    "viewAppointments": true,
    "viewLabResults": true,
    "bookAppointments": true,
    "manageConsents": true
  }
}
```

### Verify Family Member
```http
PUT /family-links/:linkId/members/:memberId/verify
```

**Request Body:**
```json
{
  "method": "OTP",
  "otp": "123456"
}
```

### Update Member Permissions
```http
PUT /family-links/:linkId/members/:memberId/permissions
```

**Request Body:**
```json
{
  "accessLevel": "Limited",
  "permissions": {
    "viewMedicalHistory": true,
    "viewPrescriptions": false,
    "bookAppointments": false
  }
}
```

### Revoke Member Access
```http
POST /family-links/:linkId/members/:memberId/revoke
```

**Request Body:**
```json
{
  "reason": "No longer authorized",
  "revokedBy": "HID-12345678"
}
```

### Get Family Health Summary
```http
GET /family-links/:linkId/health-summary
```

**Response:**
```json
{
  "familyProfile": {
    "geneticConditions": ["Diabetes", "Hypertension"],
    "commonAllergies": ["Penicillin"],
    "bloodTypes": ["O+", "A+"],
    "genotypes": ["AA", "AS"]
  },
  "memberCount": 4,
  "activeMembers": 3,
  "minors": 2,
  "emergencyContact": { ... },
  "sharedDocuments": 5
}
```

---

## 🚑 EMERGENCY ACCESS API

### Quick Patient Lookup
```http
POST /emergency-access/lookup
```

**Request Body:**
```json
{
  "healthId": "HID-12345678",
  "responderId": "EMT-001",
  "responderName": "John Paramedic",
  "organization": "Lagos Ambulance Service",
  "accessReason": "Road traffic accident",
  "incidentType": "Trauma",
  "incidentLocation": "Lagos-Ibadan Expressway, KM 15",
  "severity": "Critical"
}
```

**Response:**
```json
{
  "message": "Patient information retrieved",
  "accessId": "EMG-20251208-00001",
  "patientInfo": {
    "healthId": "HID-12345678",
    "name": "John Doe",
    "age": 35,
    "gender": "Male",
    "bloodType": "O+",
    "genotype": "AA"
  },
  "criticalInfo": {
    "bloodType": "O+",
    "genotype": "AA",
    "allergies": ["Penicillin"],
    "chronicConditions": ["Hypertension"],
    "currentMedications": ["Lisinopril 10mg"],
    "emergencyContacts": [
      {
        "name": "Jane Doe",
        "relationship": "Wife",
        "phone": "+234-801-234-5678"
      }
    ]
  }
}
```

### Record Scene Vitals
```http
POST /emergency-access/:accessId/vitals
```

**Request Body:**
```json
{
  "consciousness": "Responsive",
  "bloodPressure": { "systolic": 100, "diastolic": 60 },
  "heartRate": 110,
  "respiratoryRate": 22,
  "oxygenSaturation": 92,
  "temperature": 36.5,
  "glasgowComaScale": 14,
  "painLevel": 8,
  "recordedBy": "John Paramedic"
}
```

### Add Emergency Treatment
```http
POST /emergency-access/:accessId/treatment
```

**Request Body:**
```json
{
  "treatment": "IV fluid administration",
  "medication": "Normal Saline",
  "dosage": "1000ml",
  "route": "IV",
  "givenBy": "John Paramedic"
}
```

### Initiate Transport
```http
POST /emergency-access/:accessId/transport
```

**Request Body:**
```json
{
  "ambulanceId": "AMB-001",
  "destinationFacility": "Lagos University Teaching Hospital",
  "facilityId": "FAC-001",
  "eta": "2025-12-08T11:30:00Z",
  "initiatedBy": "John Paramedic"
}
```

### Complete Handover
```http
POST /emergency-access/:accessId/handover
```

**Request Body:**
```json
{
  "handedOverTo": "Dr. Emergency Smith",
  "facilityName": "Lagos University Teaching Hospital",
  "notes": "Patient conscious, vitals stable, IV running"
}
```

### Get Active Emergencies
```http
GET /emergency-access/active/list?severity=Critical
```

**Response:**
```json
[
  {
    "accessId": "EMG-20251208-00001",
    "patient": { ... },
    "incident": {
      "type": "Trauma",
      "severity": "Critical",
      "location": "Lagos-Ibadan Expressway",
      "timestamp": "2025-12-08T10:00:00Z"
    },
    "status": "Active",
    "transport": { ... }
  }
]
```

---

## 🔐 ERROR RESPONSES

### 400 Bad Request
```json
{
  "message": "Validation error",
  "error": "Missing required field: patientHealthId"
}
```

### 401 Unauthorized
```json
{
  "message": "Token is not valid"
}
```

### 404 Not Found
```json
{
  "message": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating prescription",
  "error": "Database connection failed"
}
```

---

## 📝 NOTES

### Rate Limiting
Currently no rate limiting implemented. Consider adding for production.

### Pagination
List endpoints don't currently support pagination. Add `?page=1&limit=10` for production.

### File Uploads
Attachment/document endpoints expect file URLs. Implement file upload service separately.

### Notifications
All endpoints automatically create notifications for relevant users.

### Audit Trail
All critical actions are logged automatically.

---

**For complete feature documentation, see `NEW_FEATURES_SUMMARY.md`**
