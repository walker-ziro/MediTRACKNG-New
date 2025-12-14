const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import models
const Provider = require('../models/Provider');
const Patient = require('../models/Patient');
const ProviderAuth = require('../models/ProviderAuth');
const PatientAuth = require('../models/PatientAuth');
const AdminAuth = require('../models/AdminAuth');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');

async function cleanupUsers() {
  try {
    // Connect to MongoDB
    // If MONGODB_URI is not in process.env (because of path issues), try to load it explicitly or use default
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditracking';
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Delete Legacy Users
    const deletedProviders = await Provider.deleteMany({});
    console.log(`🗑️  Deleted ${deletedProviders.deletedCount} legacy providers`);

    const deletedPatients = await Patient.deleteMany({});
    console.log(`🗑️  Deleted ${deletedPatients.deletedCount} legacy patients`);

    // Delete Multi-Auth Users
    const deletedProviderAuths = await ProviderAuth.deleteMany({});
    console.log(`🗑️  Deleted ${deletedProviderAuths.deletedCount} provider accounts`);

    const deletedPatientAuths = await PatientAuth.deleteMany({});
    console.log(`🗑️  Deleted ${deletedPatientAuths.deletedCount} patient accounts`);

    // Delete Profiles
    const deletedDoctors = await Doctor.deleteMany({});
    console.log(`🗑️  Deleted ${deletedDoctors.deletedCount} doctor profiles`);

    const deletedStaff = await Staff.deleteMany({});
    console.log(`🗑️  Deleted ${deletedStaff.deletedCount} staff profiles`);

    // Delete Admins except Super Admin
    const superAdminEmail = 'walkertech001@gmail.com';
    const deletedAdmins = await AdminAuth.deleteMany({ email: { $ne: superAdminEmail } });
    console.log(`🗑️  Deleted ${deletedAdmins.deletedCount} admin accounts (kept ${superAdminEmail})`);

    console.log('✨ User cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up users:', error);
    process.exit(1);
  }
}

cleanupUsers();
