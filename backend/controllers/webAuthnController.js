const SimpleWebAuthnServer = require('@simplewebauthn/server');
const PatientAuth = require('../models/PatientAuth');

// RP Configuration
const rpName = 'MediTRACKNG';
const rpID = 'localhost';
const origin = 'http://localhost:5173';

const generateRegistrationOptions = async (req, res) => {
  try {
    // Assuming user is authenticated via JWT and user ID is in req.user.id
    // For registration, user MUST be logged in
    const userId = req.user.id;
    const user = await PatientAuth.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authenticators = user.authenticators || [];

    const options = await SimpleWebAuthnServer.generateRegistrationOptions({
      rpName,
      rpID,
      userID: user._id.toString(),
      userName: user.email,
      // Don't prompt if they already have a credential
      excludeCredentials: authenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
        transports: auth.transports,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        // authenticatorAttachment: 'platform', // Allow any authenticator (Platform or Cross-Platform)
      },
    });

    // Save challenge to DB
    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const verifyRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await PatientAuth.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { body } = req;

    let verification;
    try {
      verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
        response: body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error(error);
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
        transports: body.response.transports,
      };

      user.authenticators.push(newAuthenticator);
      user.currentChallenge = undefined; // Clear challenge
      await user.save();

      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, error: 'Verification failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const generateAuthenticationOptions = async (req, res) => {
  try {
    // For login, we might not know the user yet if it's a passkey login (conditional UI)
    // But for explicit "Login with Biometrics" button, we usually ask for email first OR use a handle.
    // However, typically for "Biometric Login" button, we might want to support "Discoverable Credentials" (Usernameless).
    // But to keep it simple and consistent with the current flow (User clicks "Biometric Login"), 
    // we might need to ask for email first, OR we can try to use a discoverable credential flow.
    
    // If the user is already on the "Biometric Login" page, they haven't entered email yet.
    // So we generate options allowing any credential from this RP.
    
    const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const verifyAuthentication = async (req, res) => {
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
      verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
        response: body,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
            credentialID: authenticator.credentialID,
            credentialPublicKey: new Uint8Array(authenticator.credentialPublicKey),
            counter: authenticator.counter,
            transports: authenticator.transports,
        },
      });
    } catch (error) {
      console.error(error);
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
        { id: user._id, role: 'patient' }, // Adjust payload as needed
        process.env.JWT_SECRET || 'your_jwt_secret', // Fallback for dev
        { expiresIn: '1d' }
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication
};
