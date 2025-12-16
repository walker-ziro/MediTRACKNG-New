const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const ProviderAuth = require('../models/ProviderAuth');
const Provider = require('../models/Provider');

async function checkProviderData() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditracking';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const email = 'successe911@gmail.com';
    
    console.log('--- Checking ProviderAuth (Login Data) ---');
    const auth = await ProviderAuth.findOne({ email });
    if (auth) {
        console.log('Auth ID:', auth._id);
        console.log('Provider ID:', auth.providerId);
        console.log('First Name:', auth.firstName);
        console.log('Last Name:', auth.lastName);
    } else {
        console.log('❌ ProviderAuth not found');
    }

    if (auth && auth.providerId) {
        console.log('\n--- Checking Provider (Profile Data) ---');
        const profile = await Provider.findOne({ providerId: auth.providerId });
        if (profile) {
            console.log('Profile ID:', profile._id);
            console.log('First Name:', profile.firstName);
            console.log('Last Name:', profile.lastName);
        } else {
            console.log('❌ Provider Profile not found for ID:', auth.providerId);
        }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Script Error:', error);
    process.exit(1);
  }
}

checkProviderData();
