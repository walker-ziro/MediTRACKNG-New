const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Provider = require('../models/Provider');

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
      { id: provider._id, username: provider.username, facilityName: provider.facilityName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      provider: {
        id: provider._id,
        username: provider.username,
        facilityName: provider.facilityName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
