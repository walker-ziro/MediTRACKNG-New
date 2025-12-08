const AccessAudit = require('../models/AccessAudit');
const Consent = require('../models/Consent');

// Middleware to check consent and log access
const checkConsentAndLog = (resourceType) => {
  return async (req, res, next) => {
    try {
      const patientId = req.params.patientId || req.body.patientId;
      const providerId = req.user._id; // Assumes auth middleware sets req.user
      const facilityId = req.user.primaryFacility;
      const accessType = req.method === 'GET' ? 'View' : 
                        req.method === 'POST' ? 'Create' :
                        req.method === 'PUT' ? 'Update' :
                        req.method === 'DELETE' ? 'Delete' : 'View';
      
      let consentId = null;
      let emergencyAccess = false;
      let accessResult = 'Success';
      let denialReason = null;
      
      // Check if emergency access is requested
      if (req.body.emergencyAccess || req.query.emergencyAccess) {
        emergencyAccess = true;
        
        // Verify provider has emergency_override permission
        if (!req.user.permissions.includes('emergency_override')) {
          accessResult = 'Denied';
          denialReason = 'Provider does not have emergency override permission';
        }
      } else {
        // Check consent
        const consent = await Consent.findOne({
          patient: patientId,
          provider: providerId,
          facility: facilityId,
          status: 'Active',
          $or: [
            { validUntil: { $gte: new Date() } },
            { validUntil: null }
          ]
        });
        
        if (!consent) {
          accessResult = 'Denied';
          denialReason = 'No active consent found';
        } else {
          // Check if consent scope includes this resource type
          const scopeMap = {
            'Demographics': 'demographics',
            'Medical History': 'medicalHistory',
            'Medications': 'medications',
            'Lab Results': 'labResults',
            'Radiology': 'radiology',
            'Clinical Notes': 'clinicalNotes'
          };
          
          const scopeKey = scopeMap[resourceType];
          if (scopeKey && !consent.scope[scopeKey]) {
            accessResult = 'Denied';
            denialReason = `Consent does not include access to ${resourceType}`;
          } else {
            // Check access level
            if (accessType === 'Update' || accessType === 'Delete') {
              if (consent.accessLevel === 'Read Only') {
                accessResult = 'Denied';
                denialReason = 'Consent only allows read access';
              }
            }
            
            consentId = consent._id;
          }
        }
      }
      
      // Log the access attempt
      const auditLog = new AccessAudit({
        patient: patientId,
        accessedBy: providerId,
        facility: facilityId,
        accessType,
        resourceType,
        resourceId: req.params.id,
        purpose: req.body.purpose || req.query.purpose,
        consentId,
        emergencyAccess,
        emergencyReason: req.body.emergencyReason,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        sessionId: req.sessionID,
        accessResult,
        denialReason
      });
      
      await auditLog.save();
      
      // If denied, return error
      if (accessResult === 'Denied') {
        return res.status(403).json({ 
          message: 'Access denied', 
          reason: denialReason 
        });
      }
      
      // Attach audit log ID to request for reference
      req.auditLogId = auditLog._id;
      
      next();
    } catch (error) {
      console.error('Consent check error:', error);
      return res.status(500).json({ message: 'Error checking consent' });
    }
  };
};

// Simplified logging for non-patient-specific actions
const logAccess = (resourceType, accessType) => {
  return async (req, res, next) => {
    try {
      const providerId = req.user._id;
      const facilityId = req.user.primaryFacility;
      
      const auditLog = new AccessAudit({
        patient: null,
        accessedBy: providerId,
        facility: facilityId,
        accessType,
        resourceType,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        sessionId: req.sessionID,
        accessResult: 'Success'
      });
      
      await auditLog.save();
      next();
    } catch (error) {
      // Don't block the request if logging fails
      console.error('Audit logging error:', error);
      next();
    }
  };
};

module.exports = { checkConsentAndLog, logAccess };
