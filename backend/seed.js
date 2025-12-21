require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Provider = require('./models/Provider');
const Patient = require('./models/Patient');
const Encounter = require('./models/Encounter');

// Sample data
const sampleProviders = [
  {
    username: 'dr.johnson',
    password: 'password123',
    facilityName: 'General Hospital Lagos'
  },
  {
    username: 'dr.adeyemi',
    password: 'password123',
    facilityName: 'Federal Medical Centre Abuja'
  }
];

const samplePatients = [
  {
    healthId: 'PID-DEMO0001',
    demographics: {
      name: 'Oluwaseun Adebayo',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'Male',
      address: '123 Victoria Island, Lagos',
      phone: '+234-801-234-5678'
    },
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    medicationHistory: ['Lisinopril 10mg', 'Metformin 500mg'],
    immunizationRecords: ['COVID-19 (Pfizer)', 'Hepatitis B', 'Yellow Fever']
  },
  {
    healthId: 'PID-DEMO0002',
    demographics: {
      name: 'Amina Mohammed',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'Female',
      address: '456 Garki District, Abuja',
      phone: '+234-802-345-6789'
    },
    medicalHistory: ['Asthma'],
    medicationHistory: ['Albuterol Inhaler'],
    immunizationRecords: ['COVID-19 (Moderna)', 'Tetanus']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Provider.deleteMany({});
    await Patient.deleteMany({});
    await Encounter.deleteMany({});

    // Create providers
    console.log('👨‍⚕️  Creating sample providers...');
    const providers = [];
    for (const providerData of sampleProviders) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(providerData.password, salt);
      const provider = await Provider.create({
        ...providerData,
        password: hashedPassword
      });
      providers.push(provider);
      console.log(`   ✓ Created provider: ${provider.username}`);
    }

    // Create patients
    console.log('👥 Creating sample patients...');
    const patients = [];
    for (const patientData of samplePatients) {
      const patient = await Patient.create(patientData);
      patients.push(patient);
      console.log(`   ✓ Created patient: ${patient.demographics.name} (${patient.healthId})`);
    }

    // Create sample encounters
    console.log('📋 Creating sample encounters...');
    
    // Encounter 1 for Patient 1
    await Encounter.create({
      patientId: patients[0]._id,
      providerName: providers[0].facilityName,
      providerId: providers[0]._id.toString(),
      date: new Date('2024-11-15'),
      clinicalNotes: 'Patient presented with elevated blood pressure (160/95). Complained of occasional headaches. Physical examination normal. Advised to continue current medication and monitor BP at home daily.',
      labResults: [
        {
          name: 'Blood Glucose Test',
          status: 'Completed',
          link: '',
          date: new Date('2024-11-15')
        },
        {
          name: 'Lipid Panel',
          status: 'Completed',
          link: '',
          date: new Date('2024-11-15')
        }
      ],
      dischargeSummary: 'Continue Lisinopril 10mg daily and Metformin 500mg twice daily. Follow-up in 2 weeks. Advised on low-salt diet and regular exercise.'
    });

    // Encounter 2 for Patient 1 (different facility)
    await Encounter.create({
      patientId: patients[0]._id,
      providerName: providers[1].facilityName,
      providerId: providers[1]._id.toString(),
      date: new Date('2024-12-01'),
      clinicalNotes: 'Follow-up visit. Blood pressure improved (135/85). Patient reports better adherence to diet recommendations. No new complaints.',
      labResults: [
        {
          name: 'HbA1c Test',
          status: 'Pending',
          link: '',
          date: new Date('2024-12-01')
        }
      ],
      dischargeSummary: 'Good progress. Continue current treatment plan. Next follow-up in 1 month.'
    });

    // Encounter for Patient 2
    await Encounter.create({
      patientId: patients[1]._id,
      providerName: providers[0].facilityName,
      providerId: providers[0]._id.toString(),
      date: new Date('2024-11-20'),
      clinicalNotes: 'Patient presented with acute asthma exacerbation. Wheezing on auscultation. Administered nebulizer treatment in clinic with good response.',
      labResults: [
        {
          name: 'Peak Flow Measurement',
          status: 'Completed',
          link: '',
          date: new Date('2024-11-20')
        }
      ],
      dischargeSummary: 'Prescribed oral corticosteroids for 5 days. Continue regular inhaler use. Advised to avoid triggers. Follow-up if symptoms worsen.'
    });

    console.log('   ✓ Created 3 sample encounters');

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('   Username: dr.johnson');
    console.log('   Password: password123');
    console.log('   Facility: General Hospital Lagos');
    console.log('\n   Username: dr.adeyemi');
    console.log('   Password: password123');
    console.log('   Facility: Federal Medical Centre Abuja');
    console.log('\n🏥 Sample Patients:');
    console.log('   Health ID: PID-DEMO0001 (Oluwaseun Adebayo)');
    console.log('   Health ID: PID-DEMO0002 (Amina Mohammed)');
    console.log('\n🚀 You can now login and test the system!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
