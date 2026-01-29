const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// Create a new appointment
router.post('/', auth, async (req, res) => {
  console.log('Received appointment request:', req.body);
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
      console.log('Missing required fields:', { healthId, date, time, type });
      return res.status(400).json({
        message: 'Please provide required fields'
      });
    }

    // Ensure healthId is for a patient (starts with PID-)
    if (!healthId.startsWith('PID-') && !healthId.startsWith('HID-')) {
      return res.status(400).json({
        message: 'Invalid patient ID. Only patients can have appointments.'
      });
    }

    // Find Patient
    const Patient = require('../models/Patient');
    console.log('Finding patient with healthId:', healthId);
    const patient = await Patient.findOne({ healthId });
    if (!patient) {
      console.log('Patient not found');
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find Doctor (Provider)
    const Provider = require('../models/Provider');
    const ProviderAuth = require('../models/ProviderAuth');
    let doctor;
    if (doctorId) {
      console.log('Finding doctor with ID:', doctorId);
      try {
        // Try finding in Provider collection
        if (mongoose.Types.ObjectId.isValid(doctorId)) {
          doctor = await Provider.findById(doctorId);
        }
        if (!doctor) {
          doctor = await Provider.findOne({ providerId: doctorId });
        }

        // If not found, try ProviderAuth collection
        if (!doctor) {
          if (mongoose.Types.ObjectId.isValid(doctorId)) {
            doctor = await ProviderAuth.findById(doctorId);
          }
          if (!doctor) {
            doctor = await ProviderAuth.findOne({ providerId: doctorId });
          }
        }
      } catch (err) {
        console.log('Error finding doctor:', err.message);
      }
    } else if (doctorName) {
      console.log('Finding doctor by name:', doctorName);
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

    console.log('Creating appointment object');
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
      status: req.body.status || 'scheduled',
      createdBy: req.user.id
    });

    console.log('Saving appointment');
    await appointment.save();
    console.log('Appointment saved successfully');

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
    const { status, healthId, department, doctorId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (healthId) query.healthId = healthId;
    if (department) query.department = department;
    
    if (doctorId) {
      if (mongoose.Types.ObjectId.isValid(doctorId)) {
        query.doctorId = doctorId;
      } else {
        // Resolve custom providerId to _id
        const Provider = require('../models/Provider');
        const ProviderAuth = require('../models/ProviderAuth');
        
        let provider = await Provider.findOne({ providerId: doctorId });
        if (!provider) {
          provider = await ProviderAuth.findOne({ providerId: doctorId });
        }
        
        if (provider) {
          query.doctorId = provider._id;
        } else {
          // Provider not found, ensure query returns no results for this filter
          // Using a random ObjectId that won't match
          query.doctorId = new mongoose.Types.ObjectId();
        }
      }
    }

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
