const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Unified Patient Identification
  healthId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    // Format: MTN-XXXXXXX (MediTRACKNG National ID)
  },
  
  // Biometric Identification
  biometrics: {
    fingerprintHash: {
      type: String,
      unique: true,
      sparse: true
    },
    facialRecognitionHash: {
      type: String,
      unique: true,
      sparse: true
    },
    biometricVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // National ID Integration
  nationalId: {
    nin: String, // National Identification Number
    bvn: String, // Bank Verification Number (optional)
    votersCard: String
  },
  
  // Demographics
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleName: String,
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  genotype: {
    type: String,
    enum: ['AA', 'AS', 'SS', 'AC', 'SC']
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    email: String,
    address: {
      street: String,
      city: String,
      lga: String, // Local Government Area
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'Nigeria'
      }
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  
  // Chronic Conditions & Allergies
  chronicConditions: [{
    condition: String,
    diagnosedDate: Date,
    diagnosedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider'
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    }
  }],
  
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe']
    },
    recordedDate: Date
  }],
  
  // Current Medications
  currentMedications: [{
    medication: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider'
    }
  }],
  
  // Immunization History
  immunizations: [{
    vaccine: String,
    date: Date,
    nextDueDate: Date,
    administeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider'
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    batchNumber: String
  }],
  
  // Surgical History
  surgeries: [{
    procedure: String,
    date: Date,
    surgeon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider'
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    notes: String
  }],
  
  // Insurance Information
  insurance: {
    provider: String, // NHIS, Private
    policyNumber: String,
    expiryDate: Date,
    coverageType: String
  },
  
  // Data Privacy & Consent
  consent: {
    dataSharing: {
      type: Boolean,
      default: false
    },
    research: {
      type: Boolean,
      default: false
    },
    emergencyAccess: {
      type: Boolean,
      default: true
    }
  },
  
  // Registration Information
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  registrationFacility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Deceased', 'Suspended'],
    default: 'Active'
  },
  deceasedDate: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
