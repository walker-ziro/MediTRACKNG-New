const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const Facility = require('../models/Facility');
const Encounter = require('../models/Encounter');
const Prescription = require('../models/Prescription');
const ProviderAuth = require('../models/ProviderAuth');
const PatientAuth = require('../models/PatientAuth');
const Laboratory = require('../models/Laboratory');
const Telemedicine = require('../models/Telemedicine');
const AdminAuth = require('../models/AdminAuth');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditracking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data (optional, but good for clean slate)
    // await Patient.deleteMany({});
    // await Provider.deleteMany({});
    // await Facility.deleteMany({});
    // await Encounter.deleteMany({});
    // await Prescription.deleteMany({});
    // await ProviderAuth.deleteMany({});
    // await PatientAuth.deleteMany({});
    // await Laboratory.deleteMany({});
    // await Telemedicine.deleteMany({});
    // await AdminAuth.deleteMany({});
    // await Appointment.deleteMany({});
    // await Bill.deleteMany({});
    // await Notification.deleteMany({});
    // await Message.deleteMany({});

    // 1. Create Facilities
    const facilities = [
      {
        facilityId: 'FAC-LAG-001',
        name: 'Lagos University Teaching Hospital',
        type: 'Federal Tertiary Hospital',
        location: { state: 'Lagos', city: 'Idi-Araba', address: 'Ishaga Road' },
        contact: { phone: '08012345678', email: 'info@luth.gov.ng' },
        status: 'Active'
      },
      {
        facilityId: 'FAC-ABJ-002',
        name: 'National Hospital Abuja',
        type: 'Federal Tertiary Hospital',
        location: { state: 'FCT', city: 'Abuja', address: 'Plot 132 Central District' },
        contact: { phone: '08023456789', email: 'enquiries@nationalhospital.gov.ng' },
        status: 'Active'
      },
      {
        facilityId: 'FAC-RIV-003',
        name: 'Rivers State University Teaching Hospital',
        type: 'State Tertiary Hospital',
        location: { state: 'Rivers', city: 'Port Harcourt', address: 'Harley Street' },
        contact: { phone: '08034567890', email: 'contact@rsuth.ng' },
        status: 'Active'
      },
      {
        facilityId: 'FAC-KAN-004',
        name: 'Aminu Kano Teaching Hospital',
        type: 'Federal Tertiary Hospital',
        location: { state: 'Kano', city: 'Kano', address: 'Zaria Road' },
        contact: { phone: '08045678901', email: 'info@akth.org.ng' },
        status: 'Active'
      },
      {
        facilityId: 'FAC-ENU-005',
        name: 'Parklane Specialist Hospital',
        type: 'General Hospital',
        location: { state: 'Enugu', city: 'Enugu', address: 'Park Avenue' },
        contact: { phone: '08056789012', email: 'info@parklane.ng' },
        status: 'Active'
      }
    ];

    const createdFacilities = [];
    for (const fac of facilities) {
      // Check if exists
      let existing = await Facility.findOne({ facilityId: fac.facilityId });
      if (!existing) {
        existing = await Facility.create(fac);
        console.log(`Created Facility: ${fac.name}`);
      }
      createdFacilities.push(existing);
    }

    // 2. Create Providers
    const providers = [
      {
        providerId: 'DOC-001',
        firstName: 'Chidi',
        lastName: 'Okonkwo',
        specialization: 'Cardiology',
        providerType: 'Doctor',
        licenseNumber: 'MDCN-2010-1234',
        email: 'chidi.okonkwo@luth.gov.ng',
        username: 'chidi.okonkwo',
        facilityIndex: 0
      },
      {
        providerId: 'DOC-002',
        firstName: 'Amina',
        lastName: 'Yusuf',
        specialization: 'Pediatrics',
        providerType: 'Doctor',
        licenseNumber: 'MDCN-2012-5678',
        email: 'amina.yusuf@nationalhospital.gov.ng',
        username: 'amina.yusuf',
        facilityIndex: 1
      },
      {
        providerId: 'DOC-003',
        firstName: 'Emeka',
        lastName: 'Nwachukwu',
        specialization: 'Orthopedics',
        providerType: 'Doctor',
        licenseNumber: 'MDCN-2008-9012',
        email: 'emeka.n@rsuth.ng',
        username: 'emeka.n',
        facilityIndex: 2
      },
      {
        providerId: 'DOC-004',
        firstName: 'Fatima',
        lastName: 'Bello',
        specialization: 'Gynecology',
        providerType: 'Doctor',
        licenseNumber: 'MDCN-2015-3456',
        email: 'fatima.bello@akth.org.ng',
        username: 'fatima.bello',
        facilityIndex: 3
      },
      {
        providerId: 'DOC-005',
        firstName: 'Tunde',
        lastName: 'Bakare',
        specialization: 'General Medicine',
        providerType: 'Doctor',
        licenseNumber: 'MDCN-2018-7890',
        email: 'tunde.bakare@parklane.ng',
        username: 'tunde.bakare',
        facilityIndex: 4
      }
    ];

    const createdProviders = [];
    const defaultPassword = await bcrypt.hash('password123', 10);

    for (const prov of providers) {
      let existing = await Provider.findOne({ providerId: prov.providerId });
      if (!existing) {
        existing = await Provider.create({
          ...prov,
          primaryFacility: createdFacilities[prov.facilityIndex]._id,
          contact: { email: prov.email, phone: '08000000000' },
          password: defaultPassword
        });
        
        // Also create a ProviderAuth entry for login
        const existingAuth = await ProviderAuth.findOne({ email: prov.email });
        if (!existingAuth) {
            await ProviderAuth.create({
                providerId: prov.providerId,
                firstName: prov.firstName,
                lastName: prov.lastName,
                email: prov.email,
                phone: '08000000000',
                password: defaultPassword,
                specialization: prov.specialization,
                licenseNumber: prov.licenseNumber,
                role: 'Doctor', // Defaulting to Doctor for now
                isActive: true,
                isVerified: true
            });
        }

        console.log(`Created Provider: Dr. ${prov.lastName}`);
      }
      createdProviders.push(existing);
    }

    // 3. Create Patients
    const patients = [
      {
        healthId: 'MTN-2024001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Male',
        bloodGroup: 'O+',
        genotype: 'AA',
        contact: { phone: '08011111111', email: 'john.doe@example.com', address: { street: '123 Broad St', city: 'Lagos', state: 'Lagos' } }
      },
      {
        healthId: 'MTN-2024002',
        firstName: 'Sarah',
        lastName: 'Smith',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'Female',
        bloodGroup: 'A+',
        genotype: 'AS',
        contact: { phone: '08022222222', email: 'sarah.smith@example.com', address: { street: '456 Wuse Zone', city: 'Abuja', state: 'FCT' } }
      },
      {
        healthId: 'MTN-2024003',
        firstName: 'Musa',
        lastName: 'Ibrahim',
        dateOfBirth: new Date('1978-11-30'),
        gender: 'Male',
        bloodGroup: 'B+',
        genotype: 'AA',
        contact: { phone: '08033333333', email: 'musa.ibrahim@example.com', address: { street: '789 Sabon Gari', city: 'Kano', state: 'Kano' } }
      },
      {
        healthId: 'MTN-2024004',
        firstName: 'Ngozi',
        lastName: 'Eze',
        dateOfBirth: new Date('1995-02-10'),
        gender: 'Female',
        bloodGroup: 'O-',
        genotype: 'AA',
        contact: { phone: '08044444444', email: 'ngozi.eze@example.com', address: { street: '321 Independence Layout', city: 'Enugu', state: 'Enugu' } }
      },
      {
        healthId: 'MTN-2024005',
        firstName: 'David',
        lastName: 'West',
        dateOfBirth: new Date('1982-07-05'),
        gender: 'Male',
        bloodGroup: 'AB+',
        genotype: 'AC',
        contact: { phone: '08055555555', email: 'david.west@example.com', address: { street: '654 GRA Phase 2', city: 'Port Harcourt', state: 'Rivers' } }
      }
    ];

    const createdPatients = [];
    for (const pat of patients) {
      let existing = await Patient.findOne({ healthId: pat.healthId });
      if (!existing) {
        existing = await Patient.create(pat);
        
        // Also create a PatientAuth entry for login
        const existingAuth = await PatientAuth.findOne({ email: pat.contact.email });
        if (!existingAuth) {
            await PatientAuth.create({
                healthId: pat.healthId,
                firstName: pat.firstName,
                lastName: pat.lastName,
                email: pat.contact.email,
                phone: pat.contact.phone,
                dateOfBirth: pat.dateOfBirth,
                gender: pat.gender,
                password: defaultPassword,
                isActive: true,
                isVerified: true
            });
        }

        console.log(`Created Patient: ${pat.firstName} ${pat.lastName}`);
      }
      createdPatients.push(existing);
    }

    // 4. Create Encounters
    const encounters = [
      {
        encounterId: 'ENC-001',
        patientIndex: 0,
        providerIndex: 0,
        facilityIndex: 0,
        type: 'Outpatient Visit',
        status: 'Completed',
        date: new Date('2024-12-01'),
        diagnosis: 'Hypertension',
        complaint: 'Headache and dizziness'
      },
      {
        encounterId: 'ENC-002',
        patientIndex: 1,
        providerIndex: 1,
        facilityIndex: 1,
        type: 'Vaccination',
        status: 'Completed',
        date: new Date('2024-12-02'),
        diagnosis: 'Routine Immunization',
        complaint: 'N/A'
      },
      {
        encounterId: 'ENC-003',
        patientIndex: 2,
        providerIndex: 3,
        facilityIndex: 3,
        type: 'Diagnostic Test',
        status: 'In Progress',
        date: new Date('2024-12-05'),
        diagnosis: 'Malaria',
        complaint: 'Fever and chills'
      },
      {
        encounterId: 'ENC-004',
        patientIndex: 3,
        providerIndex: 4,
        facilityIndex: 4,
        type: 'Outpatient Visit',
        status: 'Scheduled',
        date: new Date('2024-12-10'),
        diagnosis: 'Pending',
        complaint: 'Abdominal pain'
      },
      {
        encounterId: 'ENC-005',
        patientIndex: 4,
        providerIndex: 2,
        facilityIndex: 2,
        type: 'Emergency',
        status: 'Completed',
        date: new Date('2024-11-28'),
        diagnosis: 'Fractured Tibia',
        complaint: 'Leg pain after fall'
      }
    ];

    const createdEncounters = [];
    for (const enc of encounters) {
      let existing = await Encounter.findOne({ encounterId: enc.encounterId });
      if (!existing) {
        existing = await Encounter.create({
          encounterId: enc.encounterId,
          patient: createdPatients[enc.patientIndex]._id,
          provider: createdProviders[enc.providerIndex]._id,
          facility: createdFacilities[enc.facilityIndex]._id,
          encounterType: enc.type,
          status: enc.status,
          encounterDate: enc.date,
          diagnosis: [{ description: enc.diagnosis, type: 'Primary' }],
          chiefComplaint: enc.complaint
        });
        console.log(`Created Encounter: ${enc.encounterId}`);
      }
      createdEncounters.push(existing);
    }

    // 5. Create Prescriptions
    const prescriptions = [
      {
        prescriptionId: 'RX-001',
        patientIndex: 0,
        providerIndex: 0,
        drug: 'Amlodipine',
        dosage: '5mg',
        freq: 'Once daily',
        duration: 30,
        status: 'Active'
      },
      {
        prescriptionId: 'RX-002',
        patientIndex: 1,
        providerIndex: 1,
        drug: 'Paracetamol',
        dosage: '500mg',
        freq: 'As needed',
        duration: 5,
        status: 'Dispensed'
      },
      {
        prescriptionId: 'RX-003',
        patientIndex: 2,
        providerIndex: 3,
        drug: 'Artemether/Lumefantrine',
        dosage: '80/480mg',
        freq: 'Twice daily',
        duration: 3,
        status: 'Active'
      },
      {
        prescriptionId: 'RX-004',
        patientIndex: 4,
        providerIndex: 2,
        drug: 'Ibuprofen',
        dosage: '400mg',
        freq: 'Three times daily',
        duration: 7,
        status: 'Active'
      },
      {
        prescriptionId: 'RX-005',
        patientIndex: 0,
        providerIndex: 0,
        drug: 'Lisinopril',
        dosage: '10mg',
        freq: 'Once daily',
        duration: 30,
        status: 'Active'
      }
    ];

    for (const rx of prescriptions) {
      let existing = await Prescription.findOne({ prescriptionId: rx.prescriptionId });
      if (!existing) {
        await Prescription.create({
          prescriptionId: rx.prescriptionId,
          patient: {
            healthId: createdPatients[rx.patientIndex].healthId,
            name: `${createdPatients[rx.patientIndex].firstName} ${createdPatients[rx.patientIndex].lastName}`,
            age: 35 // Simplified
          },
          provider: {
            providerId: createdProviders[rx.providerIndex].providerId,
            name: `${createdProviders[rx.providerIndex].firstName} ${createdProviders[rx.providerIndex].lastName}`,
            specialization: createdProviders[rx.providerIndex].specialization
          },
          medications: [{
            drugName: rx.drug,
            dosage: { amount: rx.dosage, unit: 'mg' },
            frequency: rx.freq,
            duration: { value: rx.duration, unit: 'days' },
            quantity: rx.duration, // Simplified
            dispensed: rx.status === 'Dispensed'
          }],
          status: rx.status
        });
        console.log(`Created Prescription: ${rx.prescriptionId}`);
      }
    }

    // 6. Create Lab Orders
    const labOrders = [
      {
        patientIndex: 0,
        testType: 'Full Blood Count',
        priority: 'Routine',
        status: 'Completed',
        result: 'Normal parameters'
      },
      {
        patientIndex: 1,
        testType: 'Malaria Parasite',
        priority: 'Urgent',
        status: 'In Progress',
        result: null
      },
      {
        patientIndex: 2,
        testType: 'Widal Test',
        priority: 'Routine',
        status: 'Pending',
        result: null
      },
      {
        patientIndex: 3,
        testType: 'Urinalysis',
        priority: 'Routine',
        status: 'Completed',
        result: 'No abnormalities detected'
      },
      {
        patientIndex: 4,
        testType: 'X-Ray Chest',
        priority: 'Urgent',
        status: 'Completed',
        result: 'Clear lung fields'
      }
    ];

    for (const order of labOrders) {
      const patient = createdPatients[order.patientIndex];
      // Check if similar order exists to avoid duplicates on re-run (simplified check)
      const existing = await Laboratory.findOne({ 
        healthId: patient.healthId, 
        testType: order.testType,
        status: order.status 
      });
      
      if (!existing) {
        await Laboratory.create({
          healthId: patient.healthId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          testType: order.testType,
          orderDate: new Date(),
          status: order.status,
          priority: order.priority,
          orderedBy: 'Dr. System Seed',
          results: order.result,
          notes: 'Seeded data'
        });
        console.log(`Created Lab Order: ${order.testType} for ${patient.firstName}`);
      }
    }

    // 7. Create Telemedicine Appointments
    const teleAppointments = [
      {
        id: 'TM-001',
        patientIndex: 0,
        providerIndex: 0,
        type: 'Video',
        status: 'Scheduled',
        date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        followUp: { required: false }
      },
      {
        id: 'TM-002',
        patientIndex: 1,
        providerIndex: 1,
        type: 'Chat',
        status: 'Completed',
        date: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
        followUp: { required: true, type: 'In-Person', instructions: 'Come to clinic for physical exam' }
      },
      {
        id: 'TM-003',
        patientIndex: 2,
        providerIndex: 2,
        type: 'Phone',
        status: 'Waiting',
        date: new Date(), // Today
        followUp: { required: false }
      },
      {
        id: 'TM-004',
        patientIndex: 3,
        providerIndex: 3,
        type: 'Video',
        status: 'Cancelled',
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        followUp: { required: false }
      },
      {
        id: 'TM-005',
        patientIndex: 4,
        providerIndex: 4,
        type: 'Video',
        status: 'Scheduled',
        date: new Date(new Date().setDate(new Date().getDate() + 3)),
        followUp: { required: false }
      }
    ];

    for (const apt of teleAppointments) {
      const existing = await Telemedicine.findOne({ consultationId: apt.id });
      if (!existing) {
        const patient = createdPatients[apt.patientIndex];
        const provider = createdProviders[apt.providerIndex];
        
        await Telemedicine.create({
          consultationId: apt.id,
          patient: {
            healthId: patient.healthId,
            name: `${patient.firstName} ${patient.lastName}`,
            phone: patient.contact.phone,
            email: patient.contact.email
          },
          provider: {
            providerId: provider.providerId,
            name: `${provider.firstName} ${provider.lastName}`,
            specialization: provider.specialization,
            facilityName: 'Seeded Facility'
          },
          scheduledDate: apt.date,
          consultationType: apt.type,
          status: apt.status,
          chiefComplaint: 'Follow up consultation',
          meetingRoom: {
            meetingUrl: `https://meet.meditrack.ng/${apt.id}`
          },
          followUp: apt.followUp
        });
        console.log(`Created Telemedicine Apt: ${apt.id}`);
      }
    }

    // 8. Create Admin Users
    const admins = [
      {
        adminId: 'ADM-001',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'walkertech001@gmail.com',
        role: 'Super Admin',
        level: 'National'
      },
      {
        adminId: 'ADM-002',
        firstName: 'Lagos',
        lastName: 'Admin',
        email: 'lagos.admin@meditrack.ng',
        role: 'Data Admin',
        level: 'State',
        state: 'Lagos'
      },
      {
        adminId: 'ADM-003',
        firstName: 'Facility',
        lastName: 'Manager',
        email: 'facility.admin@luth.gov.ng',
        role: 'Facility Admin',
        level: 'Facility',
        facilityId: 'FAC-LAG-001'
      },
      {
        adminId: 'ADM-004',
        firstName: 'Support',
        lastName: 'Team',
        email: 'support@meditrack.ng',
        role: 'Support Admin',
        level: 'National'
      },
      {
        adminId: 'ADM-005',
        firstName: 'Security',
        lastName: 'Officer',
        email: 'security@meditrack.ng',
        role: 'Security Admin',
        level: 'National'
      }
    ];

    for (const admin of admins) {
      const existing = await AdminAuth.findOne({ email: admin.email });
      if (!existing) {
        await AdminAuth.create({
          adminId: admin.adminId,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          phone: '08099999999',
          password: defaultPassword,
          role: admin.role,
          adminLevel: admin.level,
          jurisdiction: {
            state: admin.state,
            facilityId: admin.facilityId
          }
        });
        console.log(`Created Admin: ${admin.firstName} ${admin.lastName}`);
      }
    }

    // 9. Create Physical Appointments
    const appointments = [
      {
        patientIndex: 0,
        providerIndex: 0,
        department: 'General Practice',
        type: 'consultation',
        status: 'scheduled',
        reason: 'Annual Checkup',
        daysOffset: 2
      },
      {
        patientIndex: 1,
        providerIndex: 1,
        department: 'Cardiology',
        type: 'follow-up',
        status: 'completed',
        reason: 'Hypertension Review',
        daysOffset: -5
      },
      {
        patientIndex: 2,
        providerIndex: 2,
        department: 'Pediatrics',
        type: 'checkup',
        status: 'scheduled',
        reason: 'Vaccination',
        daysOffset: 1
      },
      {
        patientIndex: 3,
        providerIndex: 3,
        department: 'Orthopedics',
        type: 'procedure',
        status: 'scheduled',
        reason: 'Cast Removal',
        daysOffset: 3
      },
      {
        patientIndex: 4,
        providerIndex: 4,
        department: 'Dermatology',
        type: 'consultation',
        status: 'cancelled',
        reason: 'Skin Rash',
        daysOffset: -1
      }
    ];

    for (const apt of appointments) {
      const patient = createdPatients[apt.patientIndex];
      const provider = createdProviders[apt.providerIndex];
      
      // Check for existing appointment (simplified check)
      const existing = await Appointment.findOne({ 
        healthId: patient.healthId, 
        date: { $gte: new Date(new Date().setDate(new Date().getDate() + apt.daysOffset - 1)), $lte: new Date(new Date().setDate(new Date().getDate() + apt.daysOffset + 1)) }
      });

      if (!existing) {
        await Appointment.create({
          healthId: patient.healthId,
          patientId: patient._id,
          doctorId: provider._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorName: `${provider.firstName} ${provider.lastName}`,
          department: apt.department,
          date: new Date(new Date().setDate(new Date().getDate() + apt.daysOffset)),
          time: '09:00 AM',
          type: apt.type,
          status: apt.status,
          reason: apt.reason,
          notes: 'Seeded appointment',
          createdBy: provider._id
        });
        console.log(`Created Appointment for: ${patient.firstName}`);
      }
    }

    // 10. Create Bills
    const bills = [
      {
        patientIndex: 0,
        service: 'General Consultation',
        amount: '5000',
        status: 'Paid',
        method: 'Card'
      },
      {
        patientIndex: 1,
        service: 'Lab Tests',
        amount: '15000',
        status: 'Pending',
        method: 'Transfer'
      },
      {
        patientIndex: 2,
        service: 'Vaccination',
        amount: '2000',
        status: 'Paid',
        method: 'Cash'
      },
      {
        patientIndex: 3,
        service: 'X-Ray',
        amount: '7500',
        status: 'Overdue',
        method: 'Insurance'
      },
      {
        patientIndex: 4,
        service: 'Dermatology Consult',
        amount: '10000',
        status: 'Pending',
        method: 'Card'
      }
    ];

    for (const bill of bills) {
      const patient = createdPatients[bill.patientIndex];
      const existing = await Bill.findOne({ healthId: patient.healthId, service: bill.service });
      
      if (!existing) {
        await Bill.create({
          healthId: patient.healthId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          service: bill.service,
          amount: bill.amount,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
          status: bill.status,
          paymentMethod: bill.method,
          paymentDate: bill.status === 'Paid' ? new Date() : null,
          description: 'Seeded bill',
          items: [{ name: bill.service, quantity: 1, price: bill.amount }]
        });
        console.log(`Created Bill for: ${patient.firstName}`);
      }
    }

    // 11. Create Notifications (For Providers)
    const notifications = [
      { providerIndex: 0, type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance tonight.' },
      { providerIndex: 0, type: 'appointment', title: 'New Appointment', message: 'You have a new patient scheduled.' },
      { providerIndex: 1, type: 'lab', title: 'Lab Results Ready', message: 'Results for Patient X are ready.' },
      { providerIndex: 2, type: 'emergency', title: 'Emergency Alert', message: 'Incoming emergency patient.' },
      { providerIndex: 3, type: 'system', title: 'Policy Update', message: 'Please review new hospital policies.' }
    ];

    for (const notif of notifications) {
      const provider = createdProviders[notif.providerIndex];
      // Simple check to avoid spamming on re-runs
      const existing = await Notification.findOne({ recipient: provider._id, title: notif.title });
      
      if (!existing) {
        await Notification.create({
          recipient: provider._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          read: false
        });
        console.log(`Created Notification for: ${provider.firstName}`);
      }
    }

    // 12. Create Messages (Provider to Provider)
    const messages = [
      { fromIndex: 0, toIndex: 1, subject: 'Patient Referral', content: 'Referring patient John Doe for cardiology.' },
      { fromIndex: 1, toIndex: 0, subject: 'Re: Patient Referral', content: 'Received, will schedule appointment.' },
      { fromIndex: 2, toIndex: 3, subject: 'Shift Swap', content: 'Can you cover my shift on Friday?' },
      { fromIndex: 3, toIndex: 2, subject: 'Re: Shift Swap', content: 'Sure, no problem.' },
      { fromIndex: 4, toIndex: 0, subject: 'Meeting Reminder', content: 'Department meeting at 2 PM.' }
    ];

    for (const msg of messages) {
      const sender = createdProviders[msg.fromIndex];
      const recipient = createdProviders[msg.toIndex];
      
      const existing = await Message.findOne({ sender: sender._id, subject: msg.subject });
      
      if (!existing) {
        await Message.create({
          sender: sender._id,
          recipient: recipient._id,
          subject: msg.subject,
          content: msg.content,
          read: false
        });
        console.log(`Created Message from ${sender.firstName} to ${recipient.firstName}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
