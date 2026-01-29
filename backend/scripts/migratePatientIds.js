const mongoose = require('mongoose');
require('dotenv').config();

const PatientAuth = require('../models/PatientAuth');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Encounter = require('../models/Encounter');

const migratePatientIds = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all patients with HID prefix
    const patientsWithHID = await PatientAuth.find({ 
      healthId: /^HID-/ 
    });

    console.log(`Found ${patientsWithHID.length} patients with HID prefix`);

    if (patientsWithHID.length === 0) {
      console.log('No patients to migrate');
      await mongoose.disconnect();
      process.exit(0);
    }

    let migratedCount = 0;
    const migrations = [];

    for (const patient of patientsWithHID) {
      const oldHealthId = patient.healthId;
      const newHealthId = oldHealthId.replace(/^HID-/, 'PID-');

      migrations.push({ oldHealthId, newHealthId });

      // Update PatientAuth
      patient.healthId = newHealthId;
      await patient.save({ validateBeforeSave: false });

      // Update Patient model if it exists
      await Patient.updateMany(
        { healthId: oldHealthId },
        { $set: { healthId: newHealthId } }
      );

      // Update Appointments
      await Appointment.updateMany(
        { healthId: oldHealthId },
        { $set: { healthId: newHealthId } }
      );

      // Update Encounters
      await Encounter.updateMany(
        { healthId: oldHealthId },
        { $set: { healthId: newHealthId } }
      );

      migratedCount++;
      console.log(`✓ Migrated: ${oldHealthId} → ${newHealthId}`);
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total patients migrated: ${migratedCount}`);
    console.log('\nMigrated IDs:');
    migrations.forEach(({ oldHealthId, newHealthId }) => {
      console.log(`  ${oldHealthId} → ${newHealthId}`);
    });

    console.log('\n✓ Migration completed successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migratePatientIds();
