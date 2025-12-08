const express = require('express');
const router = express.Router();
const Consent = require('../models/Consent');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const Facility = require('../models/Facility');

// @route   GET /api/consent/patient/:patientId
// @desc    Get all consents for a patient
// @access  Private (Patient or authorized provider)
router.get('/patient/:patientId', async (req, res) => {
  try {
    const consents = await Consent.find({ patient: req.params.patientId })
      .populate('provider', 'firstName lastName specialization')
      .populate('facility', 'name type')
      .sort({ createdAt: -1 });
    
    res.json(consents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/consent/provider/:providerId
// @desc    Get all consents for a provider
// @access  Private
router.get('/provider/:providerId', async (req, res) => {
  try {
    const consents = await Consent.find({ provider: req.params.providerId })
      .populate('patient', 'firstName lastName dateOfBirth')
      .populate('facility', 'name type')
      .sort({ createdAt: -1 });
    
    res.json(consents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/consent/request
// @desc    Provider requests consent from patient
// @access  Private (Provider)
router.post('/request', async (req, res) => {
  try {
    const {
      patientId,
      providerId,
      facilityId,
      consentType,
      accessLevel,
      scope,
      validFrom,
      validUntil,
      purpose
    } = req.body;

    // Validate patient, provider, facility exist
    const patient = await Patient.findById(patientId);
    const provider = await Provider.findById(providerId);
    const facility = await Facility.findById(facilityId);

    if (!patient || !provider || !facility) {
      return res.status(404).json({ message: 'Patient, provider, or facility not found' });
    }

    // Create consent with Pending status
    const consent = new Consent({
      patient: patientId,
      provider: providerId,
      facility: facilityId,
      consentType,
      accessLevel,
      scope,
      validFrom: validFrom || new Date(),
      validUntil,
      purpose,
      status: 'Pending'
    });

    await consent.save();

    // TODO: Send notification to patient (SMS/Email)
    
    res.json({ 
      message: 'Consent request sent to patient', 
      consent 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/consent/:id/approve
// @desc    Patient approves consent
// @access  Private (Patient)
router.put('/:id/approve', async (req, res) => {
  try {
    const { verificationMethod, consentGivenBy } = req.body;

    const consent = await Consent.findById(req.params.id);
    
    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }

    if (consent.status !== 'Pending') {
      return res.status(400).json({ message: 'Consent is not pending' });
    }

    consent.status = 'Active';
    consent.verificationMethod = verificationMethod || 'Digital Signature';
    consent.consentGivenBy = consentGivenBy || 'Patient';
    
    await consent.save();

    res.json({ 
      message: 'Consent approved successfully', 
      consent 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/consent/:id/revoke
// @desc    Patient revokes consent
// @access  Private (Patient)
router.put('/:id/revoke', async (req, res) => {
  try {
    const { reason } = req.body;

    const consent = await Consent.findById(req.params.id);
    
    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }

    if (consent.status !== 'Active') {
      return res.status(400).json({ message: 'Consent is not active' });
    }

    consent.status = 'Revoked';
    consent.revokedAt = new Date();
    consent.revokedBy = req.body.revokedBy || 'Patient';
    consent.revocationReason = reason;
    
    await consent.save();

    res.json({ 
      message: 'Consent revoked successfully', 
      consent 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/consent/check
// @desc    Check if active consent exists
// @access  Private
router.get('/check', async (req, res) => {
  try {
    const { patientId, providerId, facilityId, resourceType } = req.query;

    const consent = await Consent.findOne({
      patient: patientId,
      provider: providerId,
      facility: facilityId,
      status: 'Active',
      $or: [
        { validUntil: { $gte: new Date() } },
        { validUntil: null }
      ]
    });

    if (!consent) {
      return res.json({ 
        hasConsent: false,
        message: 'No active consent found'
      });
    }

    // Check scope if resourceType provided
    if (resourceType) {
      const scopeMap = {
        'demographics': consent.scope.demographics,
        'medicalHistory': consent.scope.medicalHistory,
        'medications': consent.scope.medications,
        'labResults': consent.scope.labResults,
        'radiology': consent.scope.radiology,
        'clinicalNotes': consent.scope.clinicalNotes
      };

      const hasAccess = scopeMap[resourceType] || false;
      
      return res.json({
        hasConsent: hasAccess,
        consent,
        message: hasAccess ? 'Access granted' : 'Consent does not include this resource type'
      });
    }

    res.json({ 
      hasConsent: true, 
      consent 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/consent/active/:patientId
// @desc    Get all active consents for a patient
// @access  Private
router.get('/active/:patientId', async (req, res) => {
  try {
    const consents = await Consent.find({
      patient: req.params.patientId,
      status: 'Active',
      $or: [
        { validUntil: { $gte: new Date() } },
        { validUntil: null }
      ]
    })
      .populate('provider', 'firstName lastName specialization providerType')
      .populate('facility', 'name type state')
      .sort({ createdAt: -1 });
    
    res.json(consents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
