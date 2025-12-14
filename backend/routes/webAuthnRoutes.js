const express = require('express');
const router = express.Router();
const {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication
} = require('../controllers/webAuthnController');
const auth = require('../middleware/auth');

// Registration routes (Protected)
router.get('/register-options', auth, generateRegistrationOptions);
router.post('/register-verify', auth, verifyRegistration);

// Authentication routes (Public)
router.get('/login-options', generateAuthenticationOptions);
router.post('/login-verify', verifyAuthentication);

module.exports = router;
