const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const auth = require('../middleware/auth');

// Create a new emergency case
router.post('/', auth, async (req, res) => {
  try {
    const {
      healthId,
      patientName,
      age,
      gender,
      chiefComplaint,
      severity,
      assignedTo,
      vitalSigns,
      allergies,
      medications,
      notes
    } = req.body;

    // Validate required fields
    if (!patientName || !age || !gender || !chiefComplaint || !severity) {
      return res.status(400).json({
        message: 'Please provide all required fields: patientName, age, gender, chiefComplaint, and severity'
      });
    }

    // Create emergency case
    const emergency = new Emergency({
      healthId,
      patientName,
      age,
      gender,
      chiefComplaint,
      severity,
      assignedTo,
      vitalSigns,
      allergies,
      medications,
      notes,
      status: 'Waiting',
      arrivalTime: new Date(),
      createdBy: req.user.id
    });

    await emergency.save();

    res.status(201).json({
      message: 'Emergency case created successfully',
      emergency
    });
  } catch (error) {
    console.error('Error creating emergency case:', error);
    res.status(500).json({
      message: 'Failed to create emergency case',
      error: error.message
    });
  }
});

// Get all emergency cases
router.get('/', auth, async (req, res) => {
  try {
    const { severity, status } = req.query;
    
    let query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const emergencies = await Emergency.find(query)
      .sort({ arrivalTime: -1 });

    res.json(emergencies);
  } catch (error) {
    console.error('Error fetching emergency cases:', error);
    res.status(500).json({
      message: 'Failed to fetch emergency cases',
      error: error.message
    });
  }
});

// Get emergency case by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency case not found' });
    }

    res.json(emergency);
  } catch (error) {
    console.error('Error fetching emergency case:', error);
    res.status(500).json({
      message: 'Failed to fetch emergency case',
      error: error.message
    });
  }
});

// Update emergency case
router.put('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency case not found' });
    }

    res.json({
      message: 'Emergency case updated successfully',
      emergency
    });
  } catch (error) {
    console.error('Error updating emergency case:', error);
    res.status(500).json({
      message: 'Failed to update emergency case',
      error: error.message
    });
  }
});

// Delete emergency case
router.delete('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndDelete(req.params.id);

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency case not found' });
    }

    res.json({ message: 'Emergency case deleted successfully' });
  } catch (error) {
    console.error('Error deleting emergency case:', error);
    res.status(500).json({
      message: 'Failed to delete emergency case',
      error: error.message
    });
  }
});

module.exports = router;
