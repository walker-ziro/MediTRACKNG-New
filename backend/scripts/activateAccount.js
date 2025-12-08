/**
 * Quick Account Activation Script
 * Usage: node scripts/activateAccount.js <email>
 * 
 * This script activates a provider, patient, or admin account by email.
 * Used for development/testing purposes.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const ProviderAuth = require('../models/ProviderAuth');
const PatientAuth = require('../models/PatientAuth');
const AdminAuth = require('../models/AdminAuth');

const activateAccount = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrackng');
    console.log('✅ Connected to MongoDB');

    // Try to find and activate in each collection
    let provider = await ProviderAuth.findOne({ email });
    if (provider) {
      provider.isActive = true;
      await provider.save();
      console.log('✅ Provider account activated successfully!');
      console.log(`   Provider ID: ${provider.providerId}`);
      console.log(`   Name: ${provider.firstName} ${provider.lastName}`);
      console.log(`   Email: ${provider.email}`);
      mongoose.connection.close();
      return;
    }

    let patient = await PatientAuth.findOne({ email });
    if (patient) {
      patient.isActive = true;
      await patient.save();
      console.log('✅ Patient account activated successfully!');
      console.log(`   Health ID: ${patient.healthId}`);
      console.log(`   Name: ${patient.firstName} ${patient.lastName}`);
      console.log(`   Email: ${patient.email}`);
      mongoose.connection.close();
      return;
    }

    let admin = await AdminAuth.findOne({ email });
    if (admin) {
      admin.isActive = true;
      await admin.save();
      console.log('✅ Admin account activated successfully!');
      console.log(`   Admin ID: ${admin.adminId}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email: ${admin.email}`);
      mongoose.connection.close();
      return;
    }

    console.log('❌ No account found with email:', email);
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error activating account:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/activateAccount.js <email>');
  console.log('Example: node scripts/activateAccount.js doctor@example.com');
  process.exit(1);
}

activateAccount(email);
