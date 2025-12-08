const express = require('express');
const router = express.Router();
const EmergencyAccess = require('../models/EmergencyAccess');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

// Quick patient lookup (Emergency use only)
router.post('/lookup', auth, async (req, res) => {
  try {
    const { healthId, responderId, responderName, organization, accessReason, incidentType, incidentLocation, severity } = req.body;

    // Get patient critical information
    const criticalInfo = await EmergencyAccess.quickLookup(healthId);

    // Create emergency access record
    const emergencyAccess = await EmergencyAccess.create({
      patient: {
        healthId,
        name: criticalInfo.name,
        photo: criticalInfo.photo
      },
      responder: {
        responderId,
        name: responderName,
        organization
      },
      accessType: 'Emergency Lookup',
      accessReason,
      incident: {
        type: incidentType,
        location: incidentLocation,
        severity,
        timestamp: new Date()
      },
      criticalInfo: {
        bloodType: criticalInfo.bloodType,
        genotype: criticalInfo.genotype,
        allergies: criticalInfo.allergies,
        chronicConditions: criticalInfo.chronicConditions,
        currentMedications: criticalInfo.currentMedications,
        emergencyContacts: criticalInfo.emergencyContact ? [{
          name: criticalInfo.emergencyContact.name,
          relationship: criticalInfo.emergencyContact.relationship,
          phone: criticalInfo.emergencyContact.phone
        }] : []
      },
      consentOverride: {
        overridden: true,
        reason: 'Life-threatening emergency',
        authorizedBy: responderName,
        timestamp: new Date()
      }
    });

    // Log access
    emergencyAccess.addAuditLog('Emergency Lookup', responderName, req.headers['user-agent']);
    await emergencyAccess.save();

    res.json({
      message: 'Patient information retrieved',
      accessId: emergencyAccess.accessId,
      patientInfo: criticalInfo,
      criticalInfo: emergencyAccess.criticalInfo
    });
  } catch (error) {
    console.error('Error in emergency lookup:', error);
    res.status(500).json({ message: 'Error retrieving patient information', error: error.message });
  }
});

// Record scene vitals
router.post('/:accessId/vitals', auth, async (req, res) => {
  try {
    const vitals = req.body;

    const emergencyAccess = await EmergencyAccess.findOne({ accessId: req.params.accessId });
    
    if (!emergencyAccess) {
      return res.status(404).json({ message: 'Emergency access record not found' });
    }

    emergencyAccess.recordVitals(vitals);
    emergencyAccess.addAuditLog('Vitals Recorded', req.body.recordedBy, req.headers['user-agent']);
    await emergencyAccess.save();

    res.json({
      message: 'Vitals recorded successfully',
      vitals: emergencyAccess.sceneVitals
    });
  } catch (error) {
    console.error('Error recording vitals:', error);
    res.status(500).json({ message: 'Error recording vitals', error: error.message });
  }
});

// Add emergency treatment
router.post('/:accessId/treatment', auth, async (req, res) => {
  try {
    const { treatment, medication, dosage, route, givenBy } = req.body;

    const emergencyAccess = await EmergencyAccess.findOne({ accessId: req.params.accessId });
    
    if (!emergencyAccess) {
      return res.status(404).json({ message: 'Emergency access record not found' });
    }

    emergencyAccess.addTreatment({
      treatment,
      medication,
      dosage,
      route,
      givenBy
    });
    emergencyAccess.addAuditLog('Treatment Administered', givenBy, req.headers['user-agent']);
    await emergencyAccess.save();

    res.json({
      message: 'Treatment recorded successfully',
      treatments: emergencyAccess.emergencyTreatment
    });
  } catch (error) {
    console.error('Error recording treatment:', error);
    res.status(500).json({ message: 'Error recording treatment', error: error.message });
  }
});

// Initiate transport
router.post('/:accessId/transport', auth, async (req, res) => {
  try {
    const { ambulanceId, destinationFacility, facilityId, eta } = req.body;

    const emergencyAccess = await EmergencyAccess.findOne({ accessId: req.params.accessId });
    
    if (!emergencyAccess) {
      return res.status(404).json({ message: 'Emergency access record not found' });
    }

    emergencyAccess.initiateTransport({
      ambulanceId,
      destinationFacility,
      facilityId,
      eta
    });
    emergencyAccess.addAuditLog('Transport Initiated', req.body.initiatedBy, req.headers['user-agent']);
    await emergencyAccess.save();

    res.json({
      message: 'Transport initiated',
      transport: emergencyAccess.transport
    });
  } catch (error) {
    console.error('Error initiating transport:', error);
    res.status(500).json({ message: 'Error initiating transport', error: error.message });
  }
});

// Update transport arrival
router.put('/:accessId/transport/arrival', auth, async (req, res) => {
  try {
    const emergencyAccess = await EmergencyAccess.findOne({ accessId: req.params.accessId });
    
    if (!emergencyAccess) {
      return res.status(404).json({ message: 'Emergency access record not found' });
    }

    emergencyAccess.transport.arrivalTime = new Date();
    emergencyAccess.addAuditLog('Arrived at Facility', req.body.recordedBy, req.headers['user-agent']);
    await emergencyAccess.save();

    res.json({
      message: 'Arrival recorded',
      transport: emergencyAccess.transport
    });
  } catch (error) {
    console.error('Error recording arrival:', error);
    res.status(500).json({ message: 'Error recording arrival', error: error.message });
  }
});

// Complete handover
router.post('/:accessId/handover', auth, async (req, res) => {
  try {
    const { handedOverTo, facilityName, notes } = req.body;

    const emergencyAccess = await EmergencyAccess.findOne({ accessId: req.params.accessId });
    
    if (!emergencyAccess) {
      return res.status(404).json({ message: 'Emergency access record not found' });
    }

    emergencyAccess.completeHandover({
      handedOverTo,
      facilityName,
      notes
    });
    emergencyAccess.addAuditLog('Handover Completed', handedOverTo, req.headers['user-agent']);
    await emergencyAccess.save();

    res.json({
      message: 'Handover completed successfully',
      emergencyAccess
    });
  } catch (error) {
    console.error('Error completing handover:', error);
    res.status(500).json({ message: 'Error completing handover', error: error.message });
  }
});

// Get emergency access record
router.get('/:accessId', auth, async (req, res) => {
  try {
    const emergencyAccess = await EmergencyAccess.findOne({ accessId: req.params.accessId });
    
    if (!emergencyAccess) {
      return res.status(404).json({ message: 'Emergency access record not found' });
    }

    res.json(emergencyAccess);
  } catch (error) {
    console.error('Error fetching emergency access:', error);
    res.status(500).json({ message: 'Error fetching record', error: error.message });
  }
});

// Get patient's emergency access history
router.get('/patient/:healthId', auth, async (req, res) => {
  try {
    const records = await EmergencyAccess.find({ 
      'patient.healthId': req.params.healthId 
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error('Error fetching emergency history:', error);
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

// Get active emergencies (for dispatch/monitoring)
router.get('/active/list', auth, async (req, res) => {
  try {
    const { severity } = req.query;
    
    const query = { status: 'Active' };
    if (severity) {
      query['incident.severity'] = severity;
    }

    const activeEmergencies = await EmergencyAccess.find(query)
      .sort({ 'incident.timestamp': -1 });

    res.json(activeEmergencies);
  } catch (error) {
    console.error('Error fetching active emergencies:', error);
    res.status(500).json({ message: 'Error fetching emergencies', error: error.message });
  }
});

// Update outcome
router.put('/:accessId/outcome', auth, async (req, res) => {
  try {
    const { status, notes, admittedTo } = req.body;

    const emergencyAccess = await EmergencyAccess.findOne({ accessId: req.params.accessId });
    
    if (!emergencyAccess) {
      return res.status(404).json({ message: 'Emergency access record not found' });
    }

    emergencyAccess.outcome = {
      status,
      notes,
      admittedTo
    };
    
    emergencyAccess.addAuditLog('Outcome Updated', req.body.updatedBy, req.headers['user-agent']);
    await emergencyAccess.save();

    res.json({
      message: 'Outcome updated',
      emergencyAccess
    });
  } catch (error) {
    console.error('Error updating outcome:', error);
    res.status(500).json({ message: 'Error updating outcome', error: error.message });
  }
});

module.exports = router;
