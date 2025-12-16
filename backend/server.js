require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const multiAuthRoutes = require('./routes/multiAuthRoutes');
const patientRoutes = require('./routes/patientRoutes');
const encounterRoutes = require('./routes/encounterRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/ai');
const appointmentRoutes = require('./routes/appointmentRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const laboratoryRoutes = require('./routes/laboratoryRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const staffRoutes = require('./routes/staffRoutes');
const billRoutes = require('./routes/billRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const bedRoutes = require('./routes/bedRoutes');
const roomRoutes = require('./routes/roomRoutes');
const consentRoutes = require('./routes/consentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const patientPortalRoutes = require('./routes/patientPortalRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const telemedicineRoutes = require('./routes/telemedicineRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const familyLinkRoutes = require('./routes/familyLinkRoutes');
const emergencyAccessRoutes = require('./routes/emergencyAccessRoutes');
const webAuthnRoutes = require('./routes/webAuthnRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ], // Allow frontend origins
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes); // Legacy auth (to be deprecated)
app.use('/api/multi-auth', multiAuthRoutes); // New three-portal authentication
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/patient-portal', patientPortalRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/family-links', familyLinkRoutes);
app.use('/api/emergency-access', emergencyAccessRoutes);
app.use('/api/webauthn', webAuthnRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'MediTRACKNG API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      encounters: '/api/encounters',
      notifications: '/api/notifications',
      messages: '/api/messages',
      dashboard: '/api/dashboard',
      ai: '/api/ai',
      appointments: '/api/appointments',
      emergency: '/api/emergency'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
});

module.exports = app;
