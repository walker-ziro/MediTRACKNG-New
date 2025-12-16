const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const PatientAuth = require('../models/PatientAuth');

// RP Configuration
const rpName = 'MediTRACKNG';
const rpID = 'localhost';
// Allow various localhost origins for development
const expectedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

// Helper to check origin more flexibly in development
const isValidOrigin = (origin) => {
  // In development, allow any localhost or 127.0.0.1 origin
  if (process.env.NODE_ENV !== 'production') {
    return origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  }
  return expectedOrigins.includes(origin);
};

const generateRegistrationOptionsController = async (req, res) => {
  try {
    // Assuming user is authenticated via JWT and user ID is in req.user.id
    // For registration, user MUST be logged in
    const userId = req.user.id;
    console.log('Generating registration options for user:', userId);
    
    const user = await PatientAuth.findById(userId);

    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.email) {
      console.error('User has no email:', userId);
      return res.status(400).json({ error: 'User email is required for WebAuthn' });
    }

    const authenticators = user.authenticators || [];
    
    // Prepare excludeCredentials
    const excludeCredentials = authenticators.map(auth => ({
      id: auth.credentialID,
      type: 'public-key',
      transports: auth.transports,
    }));

    console.log(`User has ${authenticators.length} existing authenticators`);

    const opts = {
      rpName,
      rpID,
      userID: user._id.toString(),
      userName: user.email,
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        // authenticatorAttachment: 'platform', // Relax constraint for testing
      },
    };

    console.log('Calling generateRegistrationOptions with:', JSON.stringify(opts, null, 2));
    
    // Explicitly cast userID to Uint8Array (Buffer) as required by @simplewebauthn/server v10+
    opts.userID = new Uint8Array(Buffer.from(user._id.toString()));

    // @simplewebauthn/server v10+ returns a Promise
    const options = await generateRegistrationOptions(opts);

    // Save challenge to DB
    user.currentChallenge = options.challenge;
    await user.save();

    console.log('Registration options generated successfully');
    res.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    // Send the actual error message to the client for debugging
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const verifyRegistrationController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await PatientAuth.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { body } = req;

    let verification;
    try {
      // Extract the origin from the clientDataJSON to see what the browser actually sent
      const clientDataJSON = JSON.parse(Buffer.from(body.response.clientDataJSON, 'base64').toString('utf8'));
      console.log('Client origin from attestation:', clientDataJSON.origin);
      
      // Build dynamic list of allowed origins including the actual origin if it's localhost
      let allowedOrigins = [...expectedOrigins];
      if (isValidOrigin(clientDataJSON.origin) && !allowedOrigins.includes(clientDataJSON.origin)) {
        allowedOrigins.push(clientDataJSON.origin);
      }

      console.log('Verifying registration response with:', {
        expectedChallenge: user.currentChallenge,
        allowedOrigins,
        expectedRPID: rpID,
        credentialID: body.id
      });

      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: allowedOrigins, // Pass array of allowed origins
        expectedRPID: rpID,
        requireUserVerification: false, // Allow UV to be optional since we requested 'preferred'
      });
    } catch (error) {
      console.error('Verification processing error:', error);
      return res.status(400).json({ error: error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

      const newAuthenticator = {
        credentialID,
        credentialPublicKey: Buffer.from(credentialPublicKey), // Store as Buffer
        counter,
        credentialDeviceType,
        credentialBackedUp,
        transports: body.transports || [], // Ensure transports is an array
      };

      if (!user.authenticators) {
        user.authenticators = [];
      }
      
      user.authenticators.push(newAuthenticator);
      user.currentChallenge = undefined; // Clear challenge
      await user.save();

      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, error: 'Verification failed' });
    }
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: error.message });
  }
};

const generateAuthenticationOptionsController = async (req, res) => {
  try {
    // For login, we might not know the user yet if it's a passkey login (conditional UI)
    // But for explicit "Login with Biometrics" button, we usually ask for email first OR use a handle.
    // However, typically for "Biometric Login" button, we might want to support "Discoverable Credentials" (Usernameless).
    // But to keep it simple and consistent with the current flow (User clicks "Biometric Login"), 
    // we might need to ask for email first, OR we can try to use a discoverable credential flow.
    
    // If the user is already on the "Biometric Login" page, they haven't entered email yet.
    // So we generate options allowing any credential from this RP.
    
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      // allowCredentials: [], // Allow any credential
    });

    // We need to store this challenge somewhere. 
    // Since we don't know the user yet, we can't store it in the user document.
    // We can store it in a session or a temporary "Challenge" collection, or sign it in a JWT/cookie.
    // For simplicity in this setup, we'll return the challenge and expect the client to send it back 
    // (which is insecure if not signed), OR we can use a temporary cookie.
    
    // Let's use a simple approach: Store challenge in a cookie signed/httpOnly.
    res.cookie('webauthn_challenge', options.challenge, { httpOnly: true, maxAge: 60000 });

    res.json(options);
  } catch (error) {
    console.error('Error generating auth options:', error);
    res.status(500).json({ error: error.message });
  }
};

const verifyAuthenticationController = async (req, res) => {
  try {
    const { body } = req;
    const challenge = req.cookies.webauthn_challenge; // Need cookie-parser

    if (!challenge) {
      return res.status(400).json({ error: 'Challenge expired or missing' });
    }

    // We need to find the user who owns this credential.
    // The credential ID is in body.id
    const credentialID = body.id;
    
    // Find user with this credential ID
    const user = await PatientAuth.findOne({
      'authenticators.credentialID': credentialID
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found for this credential' });
    }

    const authenticator = user.authenticators.find(auth => auth.credentialID === credentialID);

    if (!authenticator) {
      return res.status(400).json({ error: 'Authenticator not found' });
    }

    let verification;
    try {
      // Extract the origin from the clientDataJSON to see what the browser actually sent
      const clientDataJSON = JSON.parse(Buffer.from(body.response.clientDataJSON, 'base64').toString('utf8'));
      console.log('Client origin from assertion:', clientDataJSON.origin);
      
      // Build dynamic list of allowed origins including the actual origin if it's localhost
      let allowedOrigins = [...expectedOrigins];
      if (isValidOrigin(clientDataJSON.origin) && !allowedOrigins.includes(clientDataJSON.origin)) {
        allowedOrigins.push(clientDataJSON.origin);
      }

      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: challenge,
        expectedOrigin: allowedOrigins,
        expectedRPID: rpID,
        authenticator: {
            credentialID: authenticator.credentialID,
            credentialPublicKey: new Uint8Array(authenticator.credentialPublicKey),
            counter: authenticator.counter,
            transports: authenticator.transports,
        },
      });
    } catch (error) {
      console.error('Verification processing error:', error);
      return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Update counter
      authenticator.counter = authenticationInfo.newCounter;
      await user.save();

      // Generate JWT Token (Login successful)
      // We need to replicate the login logic from PatientAuth controller
      // Assuming we have a utility or we can just generate it here.
      // I'll assume we use jsonwebtoken directly as seen in package.json
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          id: user._id,
          userId: user.healthId, // Consistent with multiAuthRoutes
          userType: 'patient',
          role: 'patient' 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.clearCookie('webauthn_challenge');
      
      // Return same structure as normal login
      res.json({
        verified: true,
        token,
        user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: 'patient'
        },
        userType: 'patient'
      });
    } else {
      res.status(400).json({ verified: false, error: 'Verification failed' });
    }
  } catch (error) {
    console.error('Error verifying auth:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateRegistrationOptions: generateRegistrationOptionsController,
  verifyRegistration: verifyRegistrationController,
  generateAuthenticationOptions: generateAuthenticationOptionsController,
  verifyAuthentication: verifyAuthenticationController
};
