const jwt = require('jsonwebtoken');
const ProviderAuth = require('../models/ProviderAuth');
const PatientAuth = require('../models/PatientAuth');
const AdminAuth = require('../models/AdminAuth');

// Authenticate any user type
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userType = decoded.userType;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Authorize specific user types
const authorizeUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.userType) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({ 
        message: `Access denied. This resource is only available to: ${allowedTypes.join(', ')}` 
      });
    }

    next();
  };
};

// Authorize provider with specific permissions
const authorizeProviderPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (req.userType !== 'provider') {
        return res.status(403).json({ message: 'Access denied. Provider access only.' });
      }

      const provider = await ProviderAuth.findById(req.user.id);
      
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      if (!provider.isActive) {
        return res.status(403).json({ message: 'Provider account is not active' });
      }

      // Check if provider has all required permissions
      const hasPermission = requiredPermissions.every(
        permission => provider.permissions[permission] === true
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. Required permissions: ${requiredPermissions.join(', ')}` 
        });
      }

      req.provider = provider;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking permissions', error: error.message });
    }
  };
};

// Authorize admin with specific permissions
const authorizeAdminPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (req.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin access only.' });
      }

      const admin = await AdminAuth.findById(req.user.id);
      
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      if (!admin.isActive) {
        return res.status(403).json({ message: 'Admin account is not active' });
      }

      // Check if admin has all required permissions
      const hasPermission = requiredPermissions.every(
        permission => admin.permissions[permission] === true
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. Required permissions: ${requiredPermissions.join(', ')}` 
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking permissions', error: error.message });
    }
  };
};

// Authorize patient to access their own data
const authorizePatientSelf = async (req, res, next) => {
  try {
    if (req.userType !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Patient access only.' });
    }

    const patient = await PatientAuth.findById(req.user.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.isActive) {
      return res.status(403).json({ message: 'Patient account is not active' });
    }

    // Check if patient is accessing their own data
    const healthIdInRequest = req.params.healthId || req.body.healthId || req.query.healthId;
    
    if (healthIdInRequest && healthIdInRequest !== patient.healthId) {
      return res.status(403).json({ message: 'Access denied. You can only access your own records.' });
    }

    req.patient = patient;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking authorization', error: error.message });
  }
};

// Authorize provider or patient (for shared endpoints)
const authorizeProviderOrPatient = (req, res, next) => {
  if (req.userType !== 'provider' && req.userType !== 'patient') {
    return res.status(403).json({ 
      message: 'Access denied. This resource is only available to healthcare providers or patients.' 
    });
  }
  next();
};

// Authorize provider or admin (for management endpoints)
const authorizeProviderOrAdmin = (req, res, next) => {
  if (req.userType !== 'provider' && req.userType !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. This resource is only available to healthcare providers or administrators.' 
    });
  }
  next();
};

// Check if user has access to patient data (provider, admin, or patient themselves)
const authorizePatientDataAccess = async (req, res, next) => {
  try {
    const healthIdInRequest = req.params.healthId || req.body.healthId || req.query.healthId;

    if (req.userType === 'patient') {
      // Patient can only access their own data
      const patient = await PatientAuth.findById(req.user.id);
      if (healthIdInRequest && healthIdInRequest !== patient.healthId) {
        return res.status(403).json({ message: 'Access denied. You can only access your own records.' });
      }
    } else if (req.userType === 'provider') {
      // Provider needs appropriate permissions
      const provider = await ProviderAuth.findById(req.user.id);
      if (!provider.permissions.viewPatients) {
        return res.status(403).json({ message: 'Access denied. You do not have permission to view patient records.' });
      }
    } else if (req.userType === 'admin') {
      // Admin needs viewAllRecords permission
      const admin = await AdminAuth.findById(req.user.id);
      if (!admin.permissions.viewAllRecords) {
        return res.status(403).json({ message: 'Access denied. You do not have permission to view all records.' });
      }
    } else {
      return res.status(403).json({ message: 'Access denied.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking authorization', error: error.message });
  }
};

module.exports = {
  authenticate,
  authorizeUserType,
  authorizeProviderPermission,
  authorizeAdminPermission,
  authorizePatientSelf,
  authorizeProviderOrPatient,
  authorizeProviderOrAdmin,
  authorizePatientDataAccess
};
