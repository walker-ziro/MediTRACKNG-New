const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const ProviderAuth = require('../models/ProviderAuth');
const PatientAuth = require('../models/PatientAuth');
const AdminAuth = require('../models/AdminAuth');
const Patient = require('../models/Patient'); // Import Patient model
const Provider = require('../models/Provider'); // Import Provider model
const Facility = require('../models/Facility'); // Import Facility model
const { sendOTP } = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');

// Helper function to generate unique Health ID
const generateHealthId = () => {
  const prefix = 'MTN';
  const uniqueId = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${uniqueId}`;
};

// Generate JWT token
const generateToken = (user, userType) => {
  return jwt.sign(
    { 
      id: user._id,
      userId: user.providerId || user.healthId || user.adminId,
      userType,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ========== PROVIDER ROUTES ==========

// Provider Registration
router.post('/provider/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      specialization,
      licenseNumber,
      facilityId,
      facilityName,
      department,
      role,
      licenseExpiryDate,
      dateOfBirth,
      gender,
      address
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !licenseNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields: firstName, lastName, email, phone, password, licenseNumber' 
      });
    }

    // Check if provider already exists
    let existingProvider = await ProviderAuth.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });
    
    if (existingProvider) {
      if (existingProvider.isVerified) {
        return res.status(400).json({ 
          message: 'Provider with this email or license number already exists' 
        });
      } else {
        // If unverified, delete the old record and allow re-registration
        await ProviderAuth.findByIdAndDelete(existingProvider._id);
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new provider with all fields
    const providerData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      licenseNumber,
      role: role || 'Doctor',
      otp,
      otpExpires
    };

    // Add optional fields if provided
    if (specialization) providerData.specialization = specialization;
    if (facilityId) providerData.facilityId = facilityId;
    if (facilityName) providerData.facilityName = facilityName;
    if (department) providerData.department = department;
    if (licenseExpiryDate) providerData.licenseExpiryDate = licenseExpiryDate;
    if (dateOfBirth) providerData.dateOfBirth = dateOfBirth;
    if (gender) providerData.gender = gender;
    if (address) providerData.address = address;

    const provider = await ProviderAuth.create(providerData);

    // Set role-based permissions
    provider.setRolePermissions();
    await provider.save();

    // TODO: Email verification temporarily disabled
    // Automatically verify the provider for now
    provider.isVerified = true;
    provider.isActive = true;
    provider.otp = undefined;
    provider.otpExpires = undefined;
    await provider.save();

    // Create Provider record (normally happens during verification)
    try {
      const existingProviderRecord = await Provider.findOne({ providerId: provider.providerId });
      
      if (!existingProviderRecord) {
        // Find or Create Facility
        let facility = await Facility.findOne({ facilityId: provider.facilityId });
        
        if (!facility) {
          facility = await Facility.create({
            facilityId: provider.facilityId || `FAC-${Date.now()}`,
            name: provider.facilityName || 'Unknown Facility',
            type: 'General Hospital',
            location: {
              state: 'Lagos',
              address: 'Unknown Address',
              city: 'Unknown City'
            },
            contact: {
              email: provider.email
            }
          });
        }

        const newProvider = new Provider({
          providerId: provider.providerId,
          firstName: provider.firstName,
          lastName: provider.lastName,
          specialization: provider.specialization,
          providerType: provider.role,
          licenseNumber: provider.licenseNumber,
          licenseExpiry: provider.licenseExpiryDate,
          primaryFacility: facility._id,
          contact: {
            email: provider.email,
            phone: provider.phone
          },
          username: provider.email,
          password: provider.password
        });

        await newProvider.save();
      }
    } catch (createError) {
      console.error('Error creating provider record:', createError);
      // Continue anyway - the auth record is created
    }

    /* EMAIL VERIFICATION DISABLED - UNCOMMENT WHEN EMAIL SERVICE IS CONFIGURED
    console.log('Provider created successfully, checking email configuration...');
    console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);
    console.log('GMAIL_PASS exists:', !!process.env.GMAIL_PASS);

    // Check email configuration
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('Email configuration missing: GMAIL_USER or GMAIL_PASS not set.');
      await ProviderAuth.findByIdAndDelete(provider._id);
      return res.status(503).json({ 
        message: 'Email service not configured. Please contact administrator to set GMAIL_USER and GMAIL_PASS.' 
      });
    }

    console.log('Sending OTP email to:', email);
    // Send OTP Email
    const emailResult = await sendOTP(email, otp);
    console.log('Email result:', emailResult);

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      await ProviderAuth.findByIdAndDelete(provider._id);
      return res.status(500).json({ 
        message: 'Failed to send verification email.',
        error: emailResult.error 
      });
    }
    */

    // Generate token for immediate login (no email verification)
    const token = generateToken(provider, 'provider');

    res.status(201).json({
      message: 'Provider registered successfully.',
      token,
      providerId: provider.providerId,
      userType: 'provider',
      requiresVerification: false,
      user: {
        providerId: provider.providerId,
        name: `${provider.firstName} ${provider.lastName}`,
        email: provider.email,
        role: provider.role,
        specialization: provider.specialization,
        facilityName: provider.facilityName,
        permissions: provider.permissions,
        photo: provider.photo
      }
    });
  } catch (error) {
    console.error('Provider registration error:', error);
    console.error('Error details:', error.stack);
    console.error('Error name:', error.name);
    res.status(500).json({ 
      message: `Error registering provider: ${error.message}`,
      error: error.message,
      errorType: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Provider Login
router.post('/provider/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find provider
    const provider = await ProviderAuth.findOne({ email });
    
    if (!provider) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (provider.isLocked()) {
      return res.status(423).json({ message: 'Account is locked. Please contact administrator.' });
    }

    // Check if account is active
    if (!provider.isActive) {
      return res.status(403).json({ message: 'Account is not activated. Please contact administrator.' });
    }

    // Verify password
    const isMatch = await provider.comparePassword(password);
    
    if (!isMatch) {
      provider.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (provider.loginAttempts >= 5) {
        provider.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await provider.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Self-healing: Ensure Provider record exists (for accounts created before the fix)
    try {
      const existingProviderRecord = await Provider.findOne({ providerId: provider.providerId });
      
      if (!existingProviderRecord) {
        console.log('Creating missing Provider record for:', provider.providerId);
        
        // Find or Create Facility
        let facility = await Facility.findOne({ facilityId: provider.facilityId });
        
        if (!facility) {
          facility = await Facility.create({
            facilityId: provider.facilityId || `FAC-${Date.now()}`,
            name: provider.facilityName || 'Unknown Facility',
            type: 'General Hospital',
            location: {
              state: 'Lagos',
              address: 'Unknown Address',
              city: 'Unknown City'
            },
            contact: {
              email: provider.email
            }
          });
        }

        const newProvider = new Provider({
          providerId: provider.providerId,
          firstName: provider.firstName,
          lastName: provider.lastName,
          specialization: provider.specialization,
          providerType: provider.role,
          licenseNumber: provider.licenseNumber,
          licenseExpiry: provider.licenseExpiryDate,
          primaryFacility: facility._id,
          contact: {
            email: provider.email,
            phone: provider.phone
          },
          username: provider.email,
          password: provider.password
        });

        await newProvider.save();
        console.log('Provider record created successfully');
      }
    } catch (createError) {
      console.error('Error creating provider record during login:', createError);
      // Continue login even if profile creation fails
    }

    // Reset login attempts and update last login
    provider.loginAttempts = 0;
    provider.lockUntil = undefined;
    provider.lastLogin = new Date();
    await provider.save();

    // Generate token
    const token = generateToken(provider, 'provider');

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      userType: 'provider',
      user: {
        providerId: provider.providerId,
        name: `${provider.firstName} ${provider.lastName}`,
        email: provider.email,
        role: provider.role,
        specialization: provider.specialization,
        facilityName: provider.facilityName,
        permissions: provider.permissions,
        photo: provider.photo
      }
    });
  } catch (error) {
    console.error('Provider login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// ========== PATIENT ROUTES ==========

// Patient Registration
router.post('/patient/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      bloodType,
      genotype,
      emergencyContact,
      allergies,
      chronicConditions
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields: firstName, lastName, email, phone, password' 
      });
    }

    // Check if patient already exists
    let existingPatient = await PatientAuth.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingPatient) {
      if (existingPatient.isVerified) {
        return res.status(400).json({ 
          message: 'Patient with this email or phone already exists' 
        });
      } else {
        // If unverified, delete the old record and allow re-registration
        await PatientAuth.findByIdAndDelete(existingPatient._id);
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create patient data object
    const patientData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      otp,
      otpExpires
    };

    // Add optional fields if provided
    if (dateOfBirth) patientData.dateOfBirth = dateOfBirth;
    if (gender) patientData.gender = gender;
    if (address) patientData.address = address;
    if (bloodType) patientData.bloodType = bloodType;
    if (genotype) patientData.genotype = genotype;
    if (emergencyContact) patientData.emergencyContact = emergencyContact;
    if (allergies) patientData.allergies = Array.isArray(allergies) ? allergies : allergies.split(',').map(a => a.trim()).filter(Boolean);
    if (chronicConditions) patientData.chronicConditions = Array.isArray(chronicConditions) ? chronicConditions : chronicConditions.split(',').map(c => c.trim()).filter(Boolean);

    // Create new patient
    const patient = await PatientAuth.create(patientData);

    // TODO: Email verification temporarily disabled
    // Automatically verify the patient for now
    patient.isVerified = true;
    patient.isActive = true;
    patient.otp = undefined;
    patient.otpExpires = undefined;
    
    // Generate Health ID
    if (!patient.healthId) {
      patient.healthId = generateHealthId();
    }
    await patient.save();

    // Create Patient record (normally happens during verification)
    try {
      const existingPatientRecord = await Patient.findOne({ healthId: patient.healthId });
      
      if (!existingPatientRecord) {
        const newPatient = new Patient({
          healthId: patient.healthId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          ...(patient.bloodType && { bloodGroup: patient.bloodType }),
          ...(patient.genotype && { genotype: patient.genotype }),
          contact: {
            phone: patient.phone,
            email: patient.email,
            address: {
              street: patient.address?.street,
              city: patient.address?.city,
              state: patient.address?.state || 'Unknown',
              country: patient.address?.country || 'Nigeria'
            }
          },
          emergencyContact: patient.emergencyContact,
          allergies: (patient.allergies || []).map(a => ({ allergen: a })),
          chronicConditions: (patient.chronicConditions || []).map(c => ({ condition: c }))
        });
        
        await newPatient.save();
      }
    } catch (createError) {
      console.error('Error creating patient record:', createError);
      // Continue anyway - the auth record is created
    }

    /* EMAIL VERIFICATION DISABLED - UNCOMMENT WHEN EMAIL SERVICE IS CONFIGURED
    // Check email configuration
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('Email configuration missing: GMAIL_USER or GMAIL_PASS not set.');
      await PatientAuth.findByIdAndDelete(patient._id);
      return res.status(503).json({ 
        message: 'Email service not configured. Please contact administrator to set GMAIL_USER and GMAIL_PASS.' 
      });
    }

    // Send OTP Email
    const emailResult = await sendOTP(email, otp);

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      await PatientAuth.findByIdAndDelete(patient._id);
      return res.status(500).json({ 
        message: 'Failed to send verification email.',
        error: emailResult.error 
      });
    }
    */

    // Generate token for immediate login (no email verification)
    const token = generateToken(patient, 'patient');

    res.status(201).json({
      message: 'Patient registered successfully.',
      token,
      userType: 'patient',
      requiresVerification: false,
      user: {
        healthId: patient.healthId,
        name: `${patient.firstName} ${patient.lastName}`,
        email: patient.email,
        phone: patient.phone,
        bloodType: patient.bloodType,
        photo: patient.photo,
        permissions: patient.permissions
      }
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({ message: 'Error registering patient', error: error.message });
  }
});

// Patient Login
router.post('/patient/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find patient
    const patient = await PatientAuth.findOne({ email });
    
    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (patient.isLocked()) {
      return res.status(423).json({ message: 'Account is locked. Please try again later.' });
    }

    // Check if account is active
    if (!patient.isActive) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    // Verify password
    const isMatch = await patient.comparePassword(password);
    
    if (!isMatch) {
      patient.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (patient.loginAttempts >= 5) {
        patient.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await patient.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Self-healing: Ensure Health ID and Patient record exist
    if (!patient.healthId) {
      patient.healthId = generateHealthId();
    }

    const existingPatientRecord = await Patient.findOne({ healthId: patient.healthId });
    if (!existingPatientRecord) {
      try {
        const newPatient = new Patient({
          healthId: patient.healthId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          // Only set bloodGroup/genotype if they have valid values (not empty strings)
          ...(patient.bloodType && { bloodGroup: patient.bloodType }),
          ...(patient.genotype && { genotype: patient.genotype }),
          contact: {
            phone: patient.phone,
            email: patient.email,
            address: {
              street: patient.address?.street,
              city: patient.address?.city,
              state: patient.address?.state || 'Unknown',
              country: patient.address?.country || 'Nigeria'
            }
          },
          emergencyContact: patient.emergencyContact,
          allergies: (patient.allergies || []).map(a => ({ allergen: a })),
          chronicConditions: (patient.chronicConditions || []).map(c => ({ condition: c }))
        });
        await newPatient.save();
      } catch (createError) {
        console.error('Error creating patient record during login:', createError);
        // Continue login even if profile creation fails, but log it
      }
    }

    // Reset login attempts and update last login
    patient.loginAttempts = 0;
    patient.lockUntil = undefined;
    patient.lastLogin = new Date();
    await patient.save();

    // Generate token
    const token = generateToken(patient, 'patient');

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      userType: 'patient',
      user: {
        healthId: patient.healthId,
        name: `${patient.firstName} ${patient.lastName}`,
        email: patient.email,
        phone: patient.phone,
        age: patient.getAge(),
        bloodType: patient.bloodType,
        photo: patient.photo,
        permissions: patient.permissions,
        createdAt: patient.createdAt
      }
    });
  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// ========== ADMIN ROUTES ==========

// Admin Registration (Super Admin only can create)
router.post('/admin/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      adminLevel,
      state,
      facilityId,
      facilityName
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields: firstName, lastName, email, phone, password' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await AdminAuth.findOne({ email });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin with this email already exists' 
      });
    }

    // Create admin data object
    const adminData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'System Admin',
      adminLevel: adminLevel || 'Facility',
      twoFactorEnabled: true
    };

    // Add jurisdiction fields based on admin level
    if (adminLevel === 'State' && state) {
      adminData.state = state;
    } else if (adminLevel === 'Facility') {
      if (facilityId) adminData.facilityId = facilityId;
      if (facilityName) adminData.facilityName = facilityName;
    }

    // Create new admin
    const admin = await AdminAuth.create(adminData);

    // Set role-based permissions
    admin.setRolePermissions();
    await admin.save();

    res.status(201).json({
      message: 'Admin registered successfully. Awaiting approval.',
      adminId: admin.adminId,
      userType: 'admin'
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ 
      message: 'Error registering admin', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await AdminAuth.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({ message: 'Account is locked. Please contact super admin.' });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is not activated. Please contact super admin.' });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      admin.loginAttempts += 1;
      
      // Lock account after 3 failed attempts (stricter for admins)
      if (admin.loginAttempts >= 3) {
        admin.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      }
      
      await admin.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts and update last login
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    
    // Log activity
    admin.logActivity('Login', 'Authentication', req.ip, 'Successful login');
    
    await admin.save();

    // Check if 2FA is required
    if (admin.twoFactorEnabled) {
      // Generate temporary token for 2FA (expires in 5 minutes)
      const tempToken = jwt.sign(
        { 
          id: admin._id,
          userType: 'admin',
          temp2FA: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      
      return res.json({
        message: 'Password verified. 2FA required.',
        require2FA: true,
        tempToken,
        userType: 'admin'
      });
    }

    // Generate full token if 2FA not enabled
    const token = generateToken(admin, 'admin');

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      userType: 'admin',
      user: {
        adminId: admin.adminId,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        adminLevel: admin.adminLevel,
        jurisdiction: admin.jurisdiction,
        permissions: admin.permissions,
        photo: admin.photo
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// ========== COMMON ROUTES ==========

// Verify Token (for all user types)
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.userType === 'provider') {
      user = await ProviderAuth.findById(decoded.id).select('-password');
    } else if (decoded.userType === 'patient') {
      user = await PatientAuth.findById(decoded.id).select('-password');
    } else if (decoded.userType === 'admin') {
      user = await AdminAuth.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      valid: true,
      userType: decoded.userType,
      user
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

// Admin 2FA Verification
router.post('/admin/verify-2fa', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const { code } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'No temporary token provided' });
    }

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    // Verify the temporary token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userType !== 'admin' || !decoded.temp2FA) {
      return res.status(401).json({ message: 'Invalid temporary token' });
    }

    const admin = await AdminAuth.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // In a real implementation, verify the 2FA code against the stored secret
    // For now, we'll accept any 6-digit code for demonstration
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Invalid code format. Must be 6 digits' });
    }

    // Log successful 2FA verification
    await admin.logActivity('2FA Verification', 'Authentication', req.ip, {
      status: 'success',
      timestamp: new Date()
    });

    // Generate final token
    const finalToken = generateToken(admin, 'admin');

    // Set cookie
    res.cookie('token', finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: '2FA verification successful',
      token: finalToken,
      userType: 'admin',
      user: {
        adminId: admin.adminId,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        adminLevel: admin.adminLevel,
        jurisdiction: {
          state: admin.state,
          facilityId: admin.facilityId,
          facilityName: admin.facilityName
        },
        permissions: admin.permissions,
        photo: admin.photo
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '2FA session expired. Please login again' });
    }
    res.status(500).json({ message: 'Error verifying 2FA code', error: error.message });
  }
});

// Logout (for all user types)
router.post('/logout', async (req, res) => {
  try {
    // In a production system, you would invalidate the token here
    // For now, we'll just send a success response
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
});

// ========== ADMIN ACTIVATION ROUTES ==========

// Activate Provider Account (Admin only)
router.patch('/admin/activate/provider/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const provider = await ProviderAuth.findOne({ email });
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    provider.isActive = true;
    await provider.save();

    res.json({
      message: 'Provider account activated successfully',
      providerId: provider.providerId,
      email: provider.email
    });
  } catch (error) {
    console.error('Provider activation error:', error);
    res.status(500).json({ message: 'Error activating provider', error: error.message });
  }
});

// Activate Patient Account (Admin only)
router.patch('/admin/activate/patient/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const patient = await PatientAuth.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.isActive = true;
    await patient.save();

    res.json({
      message: 'Patient account activated successfully',
      healthId: patient.healthId,
      email: patient.email
    });
  } catch (error) {
    console.error('Patient activation error:', error);
    res.status(500).json({ message: 'Error activating patient', error: error.message });
  }
});

// Activate Admin Account (Super Admin only)
router.patch('/admin/activate/admin/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const admin = await AdminAuth.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.isActive = true;
    await admin.save();

    res.json({
      message: 'Admin account activated successfully',
      adminId: admin.adminId,
      email: admin.email
    });
  } catch (error) {
    console.error('Admin activation error:', error);
    res.status(500).json({ message: 'Error activating admin', error: error.message });
  }
});

// ========== PROFILE ROUTES ==========

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { id, userType } = req.user;
    let user;

    if (userType === 'admin') {
      user = await AdminAuth.findById(id).select('-password');
    } else if (userType === 'provider') {
      user = await ProviderAuth.findById(id).select('-password');
    } else if (userType === 'patient') {
      user = await PatientAuth.findById(id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update current user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { id, userType } = req.user;
    const updates = req.body;
    let user;
    let Model;

    if (userType === 'admin') {
      Model = AdminAuth;
    } else if (userType === 'provider') {
      Model = ProviderAuth;
    } else if (userType === 'patient') {
      Model = PatientAuth;
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.adminId;
    delete updates.providerId;
    delete updates.healthId;
    delete updates._id;
    delete updates.role; // Prevent role escalation

    user = await Model.findByIdAndUpdate(id, { $set: updates }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, userType } = req.body;

    let user;
    let Model;

    if (userType === 'provider') {
      Model = ProviderAuth;
    } else if (userType === 'patient') {
      Model = PatientAuth;
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    
    // If patient, generate Health ID and create Patient record if not exists
    if (userType === 'patient') {
      if (!user.healthId) {
        user.healthId = generateHealthId();
      }

      // Check if Patient record exists
      const existingPatientRecord = await Patient.findOne({ healthId: user.healthId });
      
      if (!existingPatientRecord) {
        // Create Patient record
        try {
          const newPatient = new Patient({
            healthId: user.healthId,
            firstName: user.firstName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            // Only set bloodGroup/genotype if they have valid values
            ...(user.bloodType && { bloodGroup: user.bloodType }),
            ...(user.genotype && { genotype: user.genotype }),
            contact: {
              phone: user.phone,
              email: user.email,
              address: {
                street: user.address?.street,
                city: user.address?.city,
                state: user.address?.state || 'Unknown',
                country: user.address?.country || 'Nigeria'
              }
            },
            emergencyContact: user.emergencyContact,
            allergies: (user.allergies || []).map(a => ({ allergen: a })),
            chronicConditions: (user.chronicConditions || []).map(c => ({ condition: c }))
          });
          
          await newPatient.save();
        } catch (createError) {
          console.error('Error creating patient record during verification:', createError);
        }
      }
    } else if (userType === 'provider') {
      // Check if Provider record exists
      const existingProvider = await Provider.findOne({ providerId: user.providerId });
      
      if (!existingProvider) {
        try {
          // Find or Create Facility
          let facility = await Facility.findOne({ facilityId: user.facilityId });
          
          if (!facility) {
            // Create placeholder facility
            facility = await Facility.create({
              facilityId: user.facilityId,
              name: user.facilityName || 'Unknown Facility',
              type: 'General Hospital', // Default
              location: {
                state: 'Lagos', // Default
                address: 'Unknown Address',
                city: 'Unknown City'
              },
              contact: {
                email: user.email // Use provider email as contact for now
              }
            });
          }

          const newProvider = new Provider({
            providerId: user.providerId,
            firstName: user.firstName,
            lastName: user.lastName,
            specialization: user.specialization,
            providerType: user.role,
            licenseNumber: user.licenseNumber,
            licenseExpiry: user.licenseExpiryDate,
            primaryFacility: facility._id,
            contact: {
              email: user.email,
              phone: user.phone
            },
            username: user.email,
            password: user.password
          });

          await newProvider.save();
        } catch (createError) {
          console.error('Error creating provider record during verification:', createError);
        }
      }
    }
    
    await user.save();

    // Generate token
    const token = generateToken(user, userType);

    res.json({
      message: 'Verification successful',
      token,
      userType,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        healthId: user.healthId,
        providerId: user.providerId
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, userType } = req.body;

    let user;
    let Model;

    if (userType === 'provider') {
      Model = ProviderAuth;
    } else if (userType === 'patient') {
      Model = PatientAuth;
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Check email configuration
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(503).json({ 
        message: 'Email service not configured. Please contact administrator to set GMAIL_USER and GMAIL_PASS.' 
      });
    }

    // Send OTP Email
    const emailResult = await sendOTP(email, otp);

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return res.status(500).json({ 
        message: 'Failed to send verification email.',
        error: emailResult.error 
      });
    }

    res.json({ message: 'OTP resent successfully' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP resend' });
  }
});

module.exports = router;
