const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

// Create a new doctor
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      specialization,
      department,
      phone,
      email
    } = req.body;

    if (!name || !specialization || !department || !phone || !email) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    const doctor = new Doctor(req.body);
    await doctor.save();

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({
      message: 'Failed to create doctor',
      error: error.message
    });
  }
});

// Get all doctors
router.get('/', auth, async (req, res) => {
  try {
    const { status, department, specialization } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (specialization) query.specialization = specialization;

    const doctors = await Doctor.find(query)
      .sort({ name: 1 });

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// Get doctor by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
});

// Update doctor
router.put('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({
      message: 'Doctor updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      message: 'Failed to update doctor',
      error: error.message
    });
  }
});

// Delete doctor
router.delete('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
});

module.exports = router;
