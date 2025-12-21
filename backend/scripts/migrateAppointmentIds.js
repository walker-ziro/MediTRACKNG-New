const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
require('dotenv').config();

async function migrateAppointmentIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all appointments without appointmentId
    const appointmentsWithoutId = await Appointment.find({ 
      $or: [
        { appointmentId: { $exists: false } },
        { appointmentId: null }
      ]
    });

    console.log(`Found ${appointmentsWithoutId.length} appointments without appointmentId`);

    // Update each appointment
    let updated = 0;
    for (const appointment of appointmentsWithoutId) {
      const newAppointmentId = `APT-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      
      // Use updateOne to bypass validation
      await Appointment.updateOne(
        { _id: appointment._id },
        { $set: { appointmentId: newAppointmentId } }
      );
      updated++;
      
      // Add small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`✓ Successfully updated ${updated} appointments`);
    
    // Verify
    const remaining = await Appointment.countDocuments({ 
      $or: [
        { appointmentId: { $exists: false } },
        { appointmentId: null }
      ]
    });
    
    console.log(`${remaining} appointments still without appointmentId`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAppointmentIds();
