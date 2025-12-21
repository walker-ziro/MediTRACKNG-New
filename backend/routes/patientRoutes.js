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
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    // Fetch last visit date for each patient
    const patientsWithLastVisit = await Promise.all(patients.map(async (patient) => {
      const lastEncounter = await Encounter.findOne({ patient: patient._id })
        .sort({ encounterDate: -1 })
        .select('encounterDate');
      
      return {
        ...patient,
        lastVisit: lastEncounter ? lastEncounter.encounterDate : null
      };
    }));

    res.json(patientsWithLastVisit);
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
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      gender, 
      email, 
      phone, 
      address, 
      bloodGroup, 
      emergencyContact 
    } = req.body;

    // Validation
    if (!firstName || !lastName || !dateOfBirth || !gender) {
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
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      contact: {
        email,
        phone,
        address: {
          street: address || '',
          city: '',
          lga: '',
          state: 'Lagos' // Default state, should be from form
        }
      },
      emergencyContact: {
        name: emergencyContact, // Simplified mapping
        relationship: 'Unknown',
        phone: ''
      },
      status: 'Active'
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
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      gender, 
      email, 
      phone, 
      address, 
      bloodGroup, 
      emergencyContact 
    } = req.body;

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (gender) updateFields.gender = gender;
    if (bloodGroup) updateFields.bloodGroup = bloodGroup;
    
    if (email) updateFields['contact.email'] = email;
    if (phone) updateFields['contact.phone'] = phone;
    if (address) updateFields['contact.address.street'] = address;
    
    if (emergencyContact) updateFields['emergencyContact.name'] = emergencyContact;

    const patient = await Patient.findOneAndUpdate(
      { healthId },
      { $set: updateFields },
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
