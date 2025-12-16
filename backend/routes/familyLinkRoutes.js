const express = require('express');
const router = express.Router();
const FamilyLink = require('../models/FamilyLink');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');
const { createNotification } = require('../utils/notificationService');
const PatientAuth = require('../models/PatientAuth');

// Helper to create notification
const sendNotification = async (healthId, title, message, type = 'system') => {
  try {
    const patientAuth = await PatientAuth.findOne({ healthId });
    if (patientAuth) {
      await createNotification({
        recipient: patientAuth._id,
        recipientModel: 'PatientAuth',
        type,
        title,
        message
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Create family link
router.post('/', auth, async (req, res) => {
  try {
    const { primaryHealthId, emergencyContact, insuranceInfo, settings } = req.body;

    // Get primary member details
    const primaryPatient = await Patient.findOne({ healthId: primaryHealthId });
    if (!primaryPatient) {
      return res.status(404).json({ message: 'Primary member not found' });
    }

    // Calculate age
    const age = Math.floor((new Date() - new Date(primaryPatient.dateOfBirth)) / 31557600000);

    // Create family link
    const familyLink = await FamilyLink.create({
      primaryMember: {
        healthId: primaryHealthId,
        name: `${primaryPatient.firstName} ${primaryPatient.lastName}`,
        phone: primaryPatient.phone,
        email: primaryPatient.email,
        dateOfBirth: primaryPatient.dateOfBirth,
        age
      },
      linkedMembers: [],
      emergencyContact,
      insuranceInfo,
      settings: settings || {}
    });

    // Notify primary member
    await sendNotification(
      primaryHealthId,
      'Family Health Link Created',
      'Your family health link has been created. You can now add family members to share health information.',
      'system'
    );

    res.status(201).json({
      message: 'Family link created successfully',
      familyLink
    });
  } catch (error) {
    console.error('Error creating family link:', error);
    res.status(500).json({ message: 'Error creating family link', error: error.message });
  }
});

// Add family member
router.post('/:linkId/members', auth, async (req, res) => {
  try {
    const {
      healthId,
      relationship,
      accessLevel,
      permissions
    } = req.body;

    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    // Get member details
    const memberPatient = await Patient.findOne({ healthId });
    if (!memberPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if member already linked
    const existingMember = familyLink.linkedMembers.find(m => m.healthId === healthId);
    if (existingMember) {
      return res.status(400).json({ message: 'Member already linked' });
    }

    // Calculate age
    const age = Math.floor((new Date() - new Date(memberPatient.dateOfBirth)) / 31557600000);
    const isMinor = age < 18;

    // Add member with pending status
    const newMember = {
      healthId,
      name: `${memberPatient.firstName} ${memberPatient.lastName}`,
      relationship,
      dateOfBirth: memberPatient.dateOfBirth,
      age,
      isMinor,
      accessLevel: accessLevel || (isMinor ? 'Full' : 'Limited'),
      permissions: permissions || (isMinor ? {
        viewMedicalHistory: true,
        viewPrescriptions: true,
        viewAppointments: true,
        viewLabResults: true,
        bookAppointments: true,
        manageConsents: true
      } : {}),
      verification: {
        verified: false
      },
      status: 'Pending'
    };

    // If minor, auto-calculate guardianUntil date
    if (isMinor) {
      const guardianUntil = new Date(memberPatient.dateOfBirth);
      guardianUntil.setFullYear(guardianUntil.getFullYear() + 18);
      newMember.guardianUntil = guardianUntil;
    }

    familyLink.linkedMembers.push(newMember);
    await familyLink.save();

    // Notify both members
    await sendNotification(
      familyLink.primaryMember.healthId,
      'Family Member Added',
      `${newMember.name} has been added to your family health link. Status: Pending verification.`,
      'system'
    );

    await sendNotification(
      healthId,
      'Family Link Request',
      `${familyLink.primaryMember.name} has requested to link your health records as ${relationship}. Please verify to activate.`,
      'system'
    );

    res.status(201).json({
      message: 'Family member added successfully',
      familyLink
    });
  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({ message: 'Error adding family member', error: error.message });
  }
});

// Get family links where user is primary member
router.get('/primary/:healthId', auth, async (req, res) => {
  try {
    const familyLinks = await FamilyLink.find({ 
      'primaryMember.healthId': req.params.healthId 
    });

    res.json(familyLinks);
  } catch (error) {
    console.error('Error fetching family links:', error);
    res.status(500).json({ message: 'Error fetching family links', error: error.message });
  }
});

// Get family links where user is a linked member
router.get('/member/:healthId', auth, async (req, res) => {
  try {
    const familyLinks = await FamilyLink.find({ 
      'linkedMembers.healthId': req.params.healthId 
    });

    res.json(familyLinks);
  } catch (error) {
    console.error('Error fetching family links:', error);
    res.status(500).json({ message: 'Error fetching family links', error: error.message });
  }
});

// Get single family link
router.get('/:linkId', auth, async (req, res) => {
  try {
    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    res.json(familyLink);
  } catch (error) {
    console.error('Error fetching family link:', error);
    res.status(500).json({ message: 'Error fetching family link', error: error.message });
  }
});

// Verify family member
router.put('/:linkId/members/:memberId/verify', auth, async (req, res) => {
  try {
    const { method, otp } = req.body;

    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    const member = familyLink.linkedMembers.id(req.params.memberId);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // In production, verify OTP or biometric
    // For now, we'll mark as verified
    member.verification = {
      verified: true,
      method: method || 'OTP',
      verifiedAt: new Date()
    };
    member.status = 'Active';
    member.linkedAt = new Date();

    await familyLink.save();

    // Notify both members
    await sendNotification(
      familyLink.primaryMember.healthId,
      'Member Verified',
      `${member.name} has verified and accepted the family link. Status: Active.`,
      'system'
    );

    await sendNotification(
      member.healthId,
      'Family Link Activated',
      `Your family health link with ${familyLink.primaryMember.name} is now active.`,
      'system'
    );

    res.json({
      message: 'Member verified successfully',
      familyLink
    });
  } catch (error) {
    console.error('Error verifying member:', error);
    res.status(500).json({ message: 'Error verifying member', error: error.message });
  }
});

// Update member permissions
router.put('/:linkId/members/:memberId/permissions', auth, async (req, res) => {
  try {
    const { permissions, accessLevel } = req.body;

    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    const member = familyLink.linkedMembers.id(req.params.memberId);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (permissions) {
      member.permissions = { ...member.permissions, ...permissions };
    }

    if (accessLevel) {
      member.accessLevel = accessLevel;
    }

    await familyLink.save();

    // Notify member
    await sendNotification(
      member.healthId,
      'Permissions Updated',
      `Your access permissions for ${familyLink.primaryMember.name}'s health records have been updated.`,
      'system'
    );

    res.json({
      message: 'Permissions updated successfully',
      familyLink
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: 'Error updating permissions', error: error.message });
  }
});

// Revoke member access
router.post('/:linkId/members/:memberId/revoke', auth, async (req, res) => {
  try {
    const { reason, revokedBy } = req.body;

    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    const member = familyLink.linkedMembers.id(req.params.memberId);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.status = 'Revoked';
    member.revokedAt = new Date();
    member.revokedBy = revokedBy || familyLink.primaryMember.healthId;
    member.revocationReason = reason;

    await familyLink.save();

    // Notify both members
    await sendNotification(
      familyLink.primaryMember.healthId,
      'Member Access Revoked',
      `Access for ${member.name} has been revoked.`,
      'system'
    );

    await sendNotification(
      member.healthId,
      'Family Link Revoked',
      `Your access to ${familyLink.primaryMember.name}'s health records has been revoked. ${reason ? `Reason: ${reason}` : ''}`,
      'system'
    );

    res.json({
      message: 'Member access revoked',
      familyLink
    });
  } catch (error) {
    console.error('Error revoking member access:', error);
    res.status(500).json({ message: 'Error revoking access', error: error.message });
  }
});

// Get family health summary
router.get('/:linkId/health-summary', auth, async (req, res) => {
  try {
    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    const summary = {
      familyProfile: familyLink.familyHealthProfile,
      memberCount: familyLink.linkedMembers.length + 1, // +1 for primary
      activeMembers: familyLink.linkedMembers.filter(m => m.status === 'Active').length,
      minors: familyLink.linkedMembers.filter(m => m.isMinor).length,
      emergencyContact: familyLink.emergencyContact,
      insuranceInfo: familyLink.insuranceInfo,
      sharedDocuments: familyLink.sharedDocuments.length
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching health summary:', error);
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

// Add shared document
router.post('/:linkId/documents', auth, async (req, res) => {
  try {
    const { documentType, documentUrl, uploadedBy, accessibleTo } = req.body;

    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    familyLink.sharedDocuments.push({
      documentType,
      documentUrl,
      uploadedBy,
      uploadedAt: new Date(),
      accessibleTo: accessibleTo || [] // Empty means all members
    });

    await familyLink.save();

    res.json({
      message: 'Document added successfully',
      familyLink
    });
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ message: 'Error adding document', error: error.message });
  }
});

// Update family health profile
router.put('/:linkId/health-profile', auth, async (req, res) => {
  try {
    const { geneticConditions, commonAllergies, bloodTypes, genotypes } = req.body;

    const familyLink = await FamilyLink.findById(req.params.linkId);
    
    if (!familyLink) {
      return res.status(404).json({ message: 'Family link not found' });
    }

    if (geneticConditions) {
      familyLink.familyHealthProfile.geneticConditions = geneticConditions;
    }
    if (commonAllergies) {
      familyLink.familyHealthProfile.commonAllergies = commonAllergies;
    }
    if (bloodTypes) {
      familyLink.familyHealthProfile.bloodTypes = bloodTypes;
    }
    if (genotypes) {
      familyLink.familyHealthProfile.genotypes = genotypes;
    }

    await familyLink.save();

    res.json({
      message: 'Family health profile updated',
      familyLink
    });
  } catch (error) {
    console.error('Error updating health profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;
