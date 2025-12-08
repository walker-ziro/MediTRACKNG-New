const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Encounter = require('../models/Encounter');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Helper function to generate unique Health ID
const generateHealthId = () => {
  const prefix = 'MTN';
  const uniqueId = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${uniqueId}`;
};

// GET /api/patients - Get all patients
router.get('/', auth, async (req, res) => {
  try {
    const { search, gender, status } = req.query;
    
    let query = {};
    if (gender) query['demographics.gender'] = gender;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { healthId: { $regex: search, $options: 'i' } },
        { 'demographics.firstName': { $regex: search, $options: 'i' } },
        { 'demographics.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
});

// POST /api/patients - Create a new patient
router.post('/', auth, async (req, res) => {
  try {
    const { demographics, medicalHistory, medicationHistory, immunizationRecords } = req.body;

    // Validation
    if (!demographics || !demographics.name || !demographics.dateOfBirth || !demographics.gender) {
      return res.status(400).json({ message: 'Please provide required demographic information' });
    }

    // Generate unique Health ID
    let healthId;
    let isUnique = false;
    while (!isUnique) {
      healthId = generateHealthId();
      const existing = await Patient.findOne({ healthId });
      if (!existing) isUnique = true;
    }

    // Create new patient
    const patient = new Patient({
      healthId,
      demographics,
      medicalHistory: medicalHistory || [],
      medicationHistory: medicationHistory || [],
      immunizationRecords: immunizationRecords || []
    });

    await patient.save();

    res.status(201).json({
      message: 'Patient created successfully',
      patient
    });
  } catch (error) {
    console.error('Patient creation error:', error);
    res.status(500).json({ message: 'Server error during patient creation' });
  }
});

// GET /api/patients/:healthId - Get patient by Health ID
router.get('/:healthId', auth, async (req, res) => {
  try {
    const { healthId } = req.params;

    const patient = await Patient.findOne({ healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Patient retrieval error:', error);
    res.status(500).json({ message: 'Server error during patient retrieval' });
  }
});

// GET /api/patients/:healthId/encounters - Get all encounters for a patient
router.get('/:healthId/encounters', auth, async (req, res) => {
  try {
    const { healthId } = req.params;

    // Find patient
    const patient = await Patient.findOne({ healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find all encounters for this patient (sorted by date, most recent first)
    const encounters = await Encounter.find({ patientId: patient._id })
      .sort({ date: -1 });

    res.json({
      patient: {
        healthId: patient.healthId,
        name: patient.demographics.name
      },
      encounters
    });
  } catch (error) {
    console.error('Encounters retrieval error:', error);
    res.status(500).json({ message: 'Server error during encounters retrieval' });
  }
});

// PUT /api/patients/:healthId - Update patient information
router.put('/:healthId', auth, async (req, res) => {
  try {
    const { healthId } = req.params;
    const updates = req.body;

    const patient = await Patient.findOneAndUpdate(
      { healthId },
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Patient update error:', error);
    res.status(500).json({ message: 'Server error during patient update' });
  }
});

module.exports = router;
