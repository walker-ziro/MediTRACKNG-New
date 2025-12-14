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
      doctorId, // Changed from doctorName to doctorId (or support both)
      doctorName,
      department,
      date,
      time,
      type,
      reason,
      notes
    } = req.body;

    // Validate required fields
    if (!healthId || !date || !time || !type) {
      return res.status(400).json({
        message: 'Please provide required fields'
      });
    }

    // Find Patient
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ healthId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find Doctor (Provider)
    const Provider = require('../models/Provider');
    let doctor;
    if (doctorId) {
      doctor = await Provider.findById(doctorId);
    } else if (doctorName) {
      // Fallback search by name (risky if duplicates)
      const nameParts = doctorName.split(' ');
      const lastName = nameParts[nameParts.length - 1];
      doctor = await Provider.findOne({ lastName: new RegExp(lastName, 'i') });
    }

    // Create appointment
    let finalPatientName = patientName;
    if (!finalPatientName || finalPatientName.includes('undefined')) {
        finalPatientName = `${patient.firstName} ${patient.lastName}`;
    }

    const appointment = new Appointment({
      healthId,
      patientId: patient._id,
      patientName: finalPatientName,
      doctorId: doctor ? doctor._id : null,
      doctorName: doctorName || (doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown'),
      department: department || (doctor ? doctor.specialization : 'General'),
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
