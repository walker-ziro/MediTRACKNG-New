const express = require('express');
const router = express.Router();
const Encounter = require('../models/Encounter');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

// POST /api/encounters - Create a new encounter
router.post('/', auth, async (req, res) => {
  try {
    const { healthId, patientId, clinicalNotes, labResults, dischargeSummary } = req.body;
    const { facilityName, id: providerId } = req.user;

    // Find patient by healthId or patientId
    let patient;
    if (healthId) {
      patient = await Patient.findOne({ healthId });
    } else if (patientId) {
      patient = await Patient.findById(patientId);
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Create new encounter
    const encounter = new Encounter({
      patientId: patient._id,
      providerName: facilityName,
      providerId: providerId,
      clinicalNotes: clinicalNotes || '',
      labResults: labResults || [],
      dischargeSummary: dischargeSummary || ''
    });

    await encounter.save();

    res.status(201).json({
      message: 'Encounter created successfully',
      encounter
    });
  } catch (error) {
    console.error('Encounter creation error:', error);
    res.status(500).json({ message: 'Server error during encounter creation' });
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
