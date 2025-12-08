const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// Create a new appointment
router.post('/', auth, async (req, res) => {
  try {
    const {
      healthId,
      patientName,
      doctorName,
      department,
      date,
      time,
      type,
      reason,
      notes
    } = req.body;

    // Validate required fields
    if (!healthId || !patientName || !doctorName || !department || !date || !time || !type) {
      return res.status(400).json({
        message: 'Please provide all required fields: healthId, patientName, doctorName, department, date, time, and type'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      healthId,
      patientName,
      doctorName,
      department,
      date,
      time,
      type,
      reason,
      notes,
      status: 'scheduled',
      createdBy: req.user.id
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// Get all appointments
router.get('/', auth, async (req, res) => {
  try {
    const { status, healthId, department } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (healthId) query.healthId = healthId;
    if (department) query.department = department;

    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      message: 'Failed to update appointment',
      error: error.message
    });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
});

module.exports = router;
