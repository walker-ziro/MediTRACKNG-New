const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Provider = require('../models/Provider');
const Patient = require('../models/Patient');
const AdminAuth = require('../models/AdminAuth');
const Encounter = require('../models/Encounter');

// POST /api/auth/register - Register a new provider
router.post('/register', async (req, res) => {
  try {
    const { username, password, facilityName } = req.body;

    // Validation
    if (!username || !password || !facilityName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ username });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new provider
    const provider = new Provider({
      username,
      password: hashedPassword,
      facilityName
    });

    await provider.save();

    // Create JWT token
    const token = jwt.sign(
      { id: provider._id, username: provider.username, facilityName: provider.facilityName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      message: 'Provider registered successfully',
      token,
      provider: {
        id: provider._id,
        username: provider.username,
        facilityName: provider.facilityName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login - Login a provider
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Check if provider exists
    const provider = await Provider.findOne({ username });
    if (!provider) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: provider._id, 
        username: provider.username, 
        facilityName: provider.facilityName,
        providerId: provider.providerId,
        firstName: provider.firstName,
        lastName: provider.lastName,
        role: provider.providerType,
        specialization: provider.specialization,
        licenseNumber: provider.licenseNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      token, // Keep for backward compatibility if needed, but frontend should prefer cookie
      provider: {
        id: provider._id,
        username: provider.username,
        facilityName: provider.facilityName,
        providerId: provider.providerId,
        firstName: provider.firstName,
        lastName: provider.lastName,
        role: provider.providerType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/users - Get all users (for admin)
router.get('/users', async (req, res) => {
  try {
    const [providers, patients, admins] = await Promise.all([
      Provider.find().select('-password'),
      Patient.find().select('-password'),
      AdminAuth.find().select('-password')
    ]);
    
    const allUsers = [
      ...providers.map(p => ({
        id: p._id,
        name: p.username || `${p.firstName} ${p.lastName}`,
        role: p.role || 'Provider',
        email: p.email || 'N/A',
        status: p.status || 'Active',
        lastLogin: p.lastLogin || new Date()
      })),
      ...patients.map(p => ({
        id: p._id,
        name: `${p.firstName} ${p.lastName}`,
        role: 'Patient',
        email: p.contact?.email || 'N/A',
        status: 'Active',
        lastLogin: new Date() // Placeholder
      })),
      ...admins.map(a => ({
        id: a._id,
        name: `${a.firstName} ${a.lastName}`,
        role: a.role || 'Admin',
        email: a.email,
        status: a.isActive ? 'Active' : 'Inactive',
        lastLogin: a.lastLogin || new Date()
      }))
    ];

    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

const ProviderAuth = require('../models/ProviderAuth');

// GET /api/auth/providers - Get all providers with details
router.get('/providers', async (req, res) => {
  try {
    const [legacyProviders, newProviders] = await Promise.all([
      Provider.find().populate('primaryFacility', 'name'),
      ProviderAuth.find()
    ]);
    
    const formattedProviders = await Promise.all([
      ...legacyProviders.map(async p => {
        const patientCount = await Encounter.distinct('patient', { provider: p._id }).then(ids => ids.length);
        return {
          id: p.providerId || p._id.toString(),
          name: `${p.firstName} ${p.lastName}`,
          specialization: p.specialization,
          facility: p.primaryFacility ? p.primaryFacility.name : (p.facilityName || 'Unassigned'),
          patients: patientCount,
          status: p.status || 'Active',
          verified: p.licenseStatus === 'Active'
        };
      }),
      ...newProviders.map(async p => {
        const patientCount = await Encounter.distinct('patient', { provider: p._id }).then(ids => ids.length);
        return {
          id: p.providerId,
          name: `${p.firstName} ${p.lastName}`,
          specialization: p.specialization,
          facility: p.facilityName || 'Unassigned',
          patients: patientCount,
          status: p.isActive ? 'Active' : 'Pending',
          verified: p.isVerified
        };
      })
    ]);

    // Deduplicate based on id
    const uniqueProviders = Array.from(new Map(formattedProviders.map(item => [item.id, item])).values());

    res.json(uniqueProviders);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: 'Server error fetching providers' });
  }
});

// PUT /api/auth/users/:id/suspend - Suspend a user
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find in all collections
    let user = await Provider.findById(id);
    if (user) {
      user.status = 'Suspended';
      await user.save();
      return res.json({ message: 'Provider suspended successfully' });
    }

    user = await Patient.findById(id);
    if (user) {
      user.status = 'Suspended'; // Assuming Patient model has status
      await user.save();
      return res.json({ message: 'Patient suspended successfully' });
    }

    user = await AdminAuth.findById(id);
    if (user) {
      user.isActive = false;
      await user.save();
      return res.json({ message: 'Admin suspended successfully' });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ message: 'Server error suspending user' });
  }
});

// PUT /api/auth/users/:id/activate - Activate a user
router.put('/users/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    
    let user = await Provider.findById(id);
    if (user) {
      user.status = 'Active';
      await user.save();
      return res.json({ message: 'Provider activated successfully' });
    }

    user = await Patient.findById(id);
    if (user) {
      user.status = 'Active';
      await user.save();
      return res.json({ message: 'Patient activated successfully' });
    }

    user = await AdminAuth.findById(id);
    if (user) {
      user.isActive = true;
      await user.save();
      return res.json({ message: 'Admin activated successfully' });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Server error activating user' });
  }
});

// PUT /api/auth/providers/:id/approve - Approve a provider
router.put('/providers/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check ProviderAuth first (new registrations)
    let providerAuth = await ProviderAuth.findOne({ providerId: id });
    if (providerAuth) {
      providerAuth.isActive = true;
      providerAuth.isVerified = true;
      await providerAuth.save();
      return res.json({ message: 'Provider approved successfully' });
    }

    // Check legacy Provider model
    let provider = await Provider.findById(id);
    if (provider) {
      provider.status = 'Active';
      provider.licenseStatus = 'Active';
      await provider.save();
      return res.json({ message: 'Provider approved successfully' });
    }

    res.status(404).json({ message: 'Provider not found' });
  } catch (error) {
    console.error('Error approving provider:', error);
    res.status(500).json({ message: 'Server error approving provider' });
  }
});

// PUT /api/auth/providers/:id/reject - Reject a provider
router.put('/providers/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    
    let providerAuth = await ProviderAuth.findOne({ providerId: id });
    if (providerAuth) {
      providerAuth.isActive = false;
      providerAuth.isVerified = false;
      // Optionally delete or mark as rejected
      await providerAuth.save();
      return res.json({ message: 'Provider rejected successfully' });
    }

    let provider = await Provider.findById(id);
    if (provider) {
      provider.status = 'Rejected';
      await provider.save();
      return res.json({ message: 'Provider rejected successfully' });
    }

    res.status(404).json({ message: 'Provider not found' });
  } catch (error) {
    console.error('Error rejecting provider:', error);
    res.status(500).json({ message: 'Server error rejecting provider' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
