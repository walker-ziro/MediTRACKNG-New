const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('../models/Patient');

const fixPatient = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const healthId = 'HID-20251209-00001';
    const patient = await Patient.findOne({ healthId });

    if (patient) {
      console.log('Patient already exists:', patient.firstName, patient.lastName);
    } else {
      console.log('Patient not found. Creating...');
      const newPatient = new Patient({
        healthId,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-01-01'),
        gender: 'Male',
        bloodGroup: 'O+',
        contact: {
          email: 'john.doe@example.com',
          phone: '08012345678',
          address: {
            street: '123 Main St',
            city: 'Lagos',
            state: 'Lagos'
          }
        },
        status: 'Active'
      });

      await newPatient.save();
      console.log('Patient created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixPatient();
