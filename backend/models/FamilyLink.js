const mongoose = require('mongoose');

// Family Health Records - Link family members for shared health management
const familyLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Primary Account Holder
  primaryMember: {
    healthId: {
      type: String,
      required: true,
      index: true
    },
    name: String,
    relationship: {
      type: String,
      default: 'Self'
    }
  },
  
  // Linked Family Members
  linkedMembers: [{
    healthId: {
      type: String,
      required: true
    },
    name: String,
    relationship: {
      type: String,
      enum: ['Spouse', 'Child', 'Parent', 'Sibling', 'Guardian', 'Dependent', 'Other'],
      required: true
    },
    dateOfBirth: Date,
    
    // Access Permissions
    accessLevel: {
      type: String,
      enum: ['Full', 'Limited', 'Emergency Only', 'None'],
      default: 'Full'
    },
    
    // What the primary member can see/do
    permissions: {
      viewMedicalHistory: {
        type: Boolean,
        default: true
      },
      viewPrescriptions: {
        type: Boolean,
        default: true
      },
      viewAppointments: {
        type: Boolean,
        default: true
      },
      viewLabResults: {
        type: Boolean,
        default: true
      },
      bookAppointments: {
        type: Boolean,
        default: false
      },
      manageConsents: {
        type: Boolean,
        default: false
      }
    },
    
    // Age-based auto-permissions (for minors)
    isMinor: Boolean,
    guardianUntil: Date, // When they turn 18
    
    // Verification
    verified: {
      type: Boolean,
      default: false
    },
    verificationMethod: String, // 'OTP', 'Biometric', 'Document'
    verifiedAt: Date,
    
    // Status
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Declined', 'Revoked', 'Expired'],
      default: 'Pending'
    },
    
    linkedAt: Date,
    revokedAt: Date,
    revokedBy: String,
    revocationReason: String
  }],
  
  // Family Health Summary
  familyHealthProfile: {
    geneticConditions: [String],    // Conditions that run in family
    commonAllergies: [String],
    bloodTypes: [String],
    genotypes: [String]
  },
  
  // Shared Documents
  sharedDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedBy: String,
    uploadedAt: Date,
    accessibleTo: [String] // Array of healthIds
  }],
  
  // Emergency Contact Information
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    alternatePhone: String,
    email: String,
    address: String
  },
  
  // Insurance Information (Family plan)
  insurance: {
    provider: String,
    policyNumber: String,
    policyHolder: String,
    members: [String], // healthIds covered
    expiryDate: Date
  },
  
  // Settings
  settings: {
    allowChildrenToViewParents: Boolean,
    allowSpouseFullAccess: Boolean,
    notifyOnAccess: Boolean,
    sharedAppointmentCalendar: Boolean
  },
  
  notes: String
}, {
  timestamps: true
});

// Generate unique link ID
familyLinkSchema.pre('save', async function(next) {
  if (!this.linkId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('FamilyLink').countDocuments({
      linkId: new RegExp(`^FAM-${dateStr}`)
    });
    this.linkId = `FAM-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Auto-calculate if member is minor
familyLinkSchema.pre('save', function(next) {
  this.linkedMembers.forEach(member => {
    if (member.dateOfBirth) {
      const age = calculateAge(member.dateOfBirth);
      member.isMinor = age < 18;
      
      if (member.isMinor) {
        // Set guardian until 18th birthday
        const eighteenthBirthday = new Date(member.dateOfBirth);
        eighteenthBirthday.setFullYear(eighteenthBirthday.getFullYear() + 18);
        member.guardianUntil = eighteenthBirthday;
        
        // Auto-grant full access for minors
        member.accessLevel = 'Full';
      }
    }
  });
  next();
});

// Methods
familyLinkSchema.methods.addMember = function(memberData) {
  this.linkedMembers.push({
    ...memberData,
    linkedAt: new Date(),
    status: 'Pending'
  });
};

familyLinkSchema.methods.revokeMember = function(healthId, reason, revokedBy) {
  const member = this.linkedMembers.find(m => m.healthId === healthId);
  if (member) {
    member.status = 'Revoked';
    member.revokedAt = new Date();
    member.revokedBy = revokedBy;
    member.revocationReason = reason;
  }
};

// Indexes
familyLinkSchema.index({ 'primaryMember.healthId': 1 });
familyLinkSchema.index({ 'linkedMembers.healthId': 1 });
familyLinkSchema.index({ 'linkedMembers.status': 1 });

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

module.exports = mongoose.model('FamilyLink', familyLinkSchema);
