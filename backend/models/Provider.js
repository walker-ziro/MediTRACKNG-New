const mongoose = require('mongoose');

// Healthcare providers (doctors, nurses, etc.) in national system
const providerSchema = new mongoose.Schema({
  providerId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Professional Information
  firstName: {
    type: String,
    required: true
  },
  
  lastName: {
    type: String,
    required: true
  },
  
  middleName: String,
  
  specialization: {
    type: String,
    required: true
  },
  
  providerType: {
    type: String,
    enum: [
      'Doctor',
      'Nurse',
      'Pharmacist',
      'Lab Technician',
      'Radiologist',
      'Physiotherapist',
      'Dentist',
      'Optometrist',
      'Psychiatrist',
      'Surgeon',
      'Pediatrician',
      'Obstetrician',
      'Anesthesiologist',
      'Other'
    ],
    required: true
  },
  
  // Licensing
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  licenseIssuer: String, // MDCN, NCN, PCN, etc.
  
  licenseExpiry: Date,
  
  licenseStatus: {
    type: String,
    enum: ['Active', 'Expired', 'Suspended', 'Revoked'],
    default: 'Active'
  },
  
  // Multi-facility support
  primaryFacility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  
  affiliatedFacilities: [{
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    role: String,
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  }],
  
  // Contact
  contact: {
    phone: String,
    email: {
      type: String,
      required: true,
      unique: true
    },
    address: String
  },
  
  // Authentication
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  password: {
    type: String,
    required: true
  },
  
  // Access control
  role: {
    type: String,
    enum: ['Admin', 'Doctor', 'Nurse', 'Pharmacist', 'Lab Tech', 'Reception', 'Billing'],
    default: 'Doctor'
  },
  
  permissions: [{
    type: String,
    enum: [
      'view_patient_records',
      'edit_patient_records',
      'view_lab_results',
      'order_labs',
      'prescribe_medications',
      'view_radiology',
      'order_radiology',
      'view_billing',
      'process_payments',
      'manage_appointments',
      'emergency_override'
    ]
  }],
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Suspended'],
    default: 'Active'
  },
  
  // Statistics (for analytics)
  stats: {
    totalEncounters: {
      type: Number,
      default: 0
    },
    totalPrescriptions: {
      type: Number,
      default: 0
    },
    specializedIn: [String]
  }
}, {
  timestamps: true
});

// Generate unique provider ID
providerSchema.pre('save', async function(next) {
  if (!this.providerId) {
    const prefix = this.providerType === 'Doctor' ? 'DOC' : 
                   this.providerType === 'Nurse' ? 'NRS' :
                   this.providerType === 'Pharmacist' ? 'PHR' : 'PRV';
    
    const count = await mongoose.model('Provider').countDocuments({
      providerId: new RegExp(`^${prefix}`)
    });
    
    this.providerId = `${prefix}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes (licenseNumber already indexed by unique: true)
providerSchema.index({ primaryFacility: 1 });
providerSchema.index({ status: 1 });
providerSchema.index({ providerType: 1 });

module.exports = mongoose.model('Provider', providerSchema);
