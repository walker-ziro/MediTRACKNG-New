const express = require('express');
const router = express.Router();
const Encounter = require('../models/Encounter');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/encounters - Get all encounters
router.get('/', auth, async (req, res) => {
  try {
    const encounters = await Encounter.find()
      .populate('patient', 'firstName lastName healthId')
      .populate('provider', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(encounters);
  } catch (error) {
    console.error('Error fetching encounters:', error);
    res.status(500).json({ message: 'Server error fetching encounters' });
  }
});

// POST /api/encounters - Create a new encounter
router.post('/', auth, async (req, res) => {
  try {
    const { healthId, patientId, type, date, time, status, clinicalNotes } = req.body;

    // Find patient by healthId or patientId
    let patient;
    if (healthId) {
      patient = await Patient.findOne({ healthId });
    } else if (patientId) {
      patient = await Patient.findById(patientId);
    }

    if (!patient) {
      console.log('Encounter creation failed: Patient not found', { healthId, patientId });
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get Provider to find Facility
    // Fix: Use providerId from token (stored as userId) to find Provider
    // The token structure is { id, userId, userType, role } where userId is the providerId
    const providerId = req.user.providerId || req.user.userId;
    let provider = await Provider.findOne({ providerId: providerId });
    
    if (!provider) {
      // Fallback: try finding by _id if providerId lookup fails (for legacy/dev data)
      // Note: req.user.id comes from the JWT token which is the _id of the Auth record
      // We need to check if there is a Provider record with that _id (unlikely as they are different collections)
      // OR if the Auth record _id matches a Provider record _id (also unlikely)
      
      // Let's try to find the provider by email if providerId fails
      // Note: email might not be in the token depending on how it was generated
      if (req.user.email) {
        provider = await Provider.findOne({ 'contact.email': req.user.email });
      }
      
      if (!provider) {
          console.log('Provider lookup failed for:', req.user);
          return res.status(404).json({ message: 'Provider profile not found. Please contact support.' });
      }
    }

    // Create new encounter
    const encounterDate = date ? new Date(`${date}T${time || '00:00'}`) : new Date();
    
    // Validate date is not in the future
    const now = new Date();
    if (encounterDate > now) {
      return res.status(400).json({ 
        message: 'Encounter date cannot be in the future',
        providedDate: encounterDate,
        currentDate: now
      });
    }

    const encounter = new Encounter({
      encounterId: `ENC-${uuidv4().split('-')[0].toUpperCase()}`,
      patient: patient._id,
      facility: provider.primaryFacility,
      provider: provider._id,
      encounterType: type || 'Outpatient Visit',
      encounterDate: encounterDate,
      status: status || 'Scheduled',
      clinicalNotes: clinicalNotes || ''
    });

    await encounter.save();

    // Populate for response
    await encounter.populate('patient', 'firstName lastName healthId');

    res.status(201).json({
      message: 'Encounter created successfully',
      encounter
    });
  } catch (error) {
    console.error('Encounter creation error:', error);
    res.status(500).json({ message: 'Server error during encounter creation', error: error.message });
  }
});

// GET /api/encounters/:id - Get a specific encounter
router.get('/:id', auth, async (req, res) => {
  try {
    const encounter = await Encounter.findById(req.params.id)
      .populate('patientId', 'healthId demographics');

    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    res.json({ encounter });
  } catch (error) {
    console.error('Encounter retrieval error:', error);
    res.status(500).json({ message: 'Server error during encounter retrieval' });
  }
});

// PUT /api/encounters/:id - Update an encounter
router.put('/:id', auth, async (req, res) => {
  try {
    const { clinicalNotes, labResults, dischargeSummary } = req.body;

    const encounter = await Encounter.findByIdAndUpdate(
      req.params.id,
      { clinicalNotes, labResults, dischargeSummary },
      { new: true, runValidators: true }
    );

    if (!encounter) {
      return res.status(404).json({ message: 'Encounter not found' });
    }

    res.json({
      message: 'Encounter updated successfully',
      encounter
    });
  } catch (error) {
    console.error('Encounter update error:', error);
    res.status(500).json({ message: 'Server error during encounter update' });
  }
});

module.exports = router;
