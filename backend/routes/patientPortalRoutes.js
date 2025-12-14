const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Encounter = require('../models/Encounter');
const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const Laboratory = require('../models/Laboratory');
const Pharmacy = require('../models/Pharmacy');
const Appointment = require('../models/Appointment');

/**
 * Patient Portal Routes - Citizens access their own health records
 * Authentication should verify patient identity (biometric or healthId + PIN/OTP)
 */

// Get patient's own profile
router.get('/profile/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId })
      .select('-__v');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Log patient accessing own record
    await logPatientAccess(req.params.healthId, 'View', 'Demographics', req.ip);

    res.json({
      profile: {
        healthId: patient.healthId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        genotype: patient.genotype,
        contact: patient.contact,
        emergencyContact: patient.emergencyContact,
        biometricVerified: patient.biometrics?.biometricVerified || false,
        ninLinked: !!patient.nationalId?.nin
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get patient's medical history
router.get('/medical-history/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await logPatientAccess(req.params.healthId, 'View', 'Medical History', req.ip);

    res.json({
      chronicConditions: patient.chronicConditions || [],
      allergies: patient.allergies || [],
      surgeries: patient.surgeries || [],
      familyHistory: patient.familyHistory || []
    });
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({
      message: 'Failed to fetch medical history',
      error: error.message
    });
  }
});

// Get patient's current medications
router.get('/medications/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await logPatientAccess(req.params.healthId, 'View', 'Medications', req.ip);

    res.json({
      currentMedications: patient.currentMedications || []
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({
      message: 'Failed to fetch medications',
      error: error.message
    });
  }
});

// Get patient's immunization records
router.get('/immunizations/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId })
      .populate('immunizations.facility', 'name facilityId');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await logPatientAccess(req.params.healthId, 'View', 'Immunizations', req.ip);

    res.json({
      immunizations: patient.immunizations || []
    });
  } catch (error) {
    console.error('Error fetching immunizations:', error);
    res.status(500).json({
      message: 'Failed to fetch immunizations',
      error: error.message
    });
  }
});

// Get patient's encounters
router.get('/encounters/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const encounters = await Encounter.find({ patient: patient._id })
      .populate('provider', 'firstName lastName specialization')
      .populate('facility', 'name facilityId type')
      .sort({ date: -1 })
      .limit(50);

    await logPatientAccess(req.params.healthId, 'View', 'Clinical Notes', req.ip);

    res.json({
      encounters: encounters.map(e => ({
        id: e._id,
        date: e.date,
        type: e.type,
        chiefComplaint: e.chiefComplaint,
        diagnosis: e.diagnosis,
        provider: e.provider,
        facility: e.facility,
        prescriptions: e.prescriptions,
        labOrders: e.labOrders
      }))
    });
  } catch (error) {
    console.error('Error fetching encounters:', error);
    res.status(500).json({
      message: 'Failed to fetch encounters',
      error: error.message
    });
  }
});

// Get patient's lab results
router.get('/lab-results/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const labResults = await Laboratory.find({ healthId: req.params.healthId })
      .sort({ orderDate: -1 })
      .limit(50);

    await logPatientAccess(req.params.healthId, 'View', 'Lab Results', req.ip);

    res.json({
      labResults: labResults.map(lab => ({
        id: lab._id,
        testType: lab.testType,
        testName: lab.testType, // Using testType as testName
        dateOrdered: lab.orderDate,
        dateCompleted: lab.resultDate,
        status: lab.status,
        results: lab.results,
        orderedBy: lab.orderedBy,
        urgency: lab.priority
      }))
    });
  } catch (error) {
    console.error('Error fetching lab results:', error);
    res.status(500).json({
      message: 'Failed to fetch lab results',
      error: error.message
    });
  }
});

// Get patient's appointments
router.get('/appointments/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointments = await Appointment.find({ healthId: req.params.healthId })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ date: -1, time: -1 })
      .limit(50);

    await logPatientAccess(req.params.healthId, 'View', 'Full Record', req.ip);

    res.json({
      appointments: appointments.map(appt => ({
        id: appt._id,
        date: appt.date,
        time: appt.time,
        doctor: appt.doctorName,
        department: appt.department,
        status: appt.status,
        reason: appt.reason
      }))
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get patient's consent records (who has access to their data)
router.get('/consents/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const consents = await Consent.find({ patient: patient._id })
      .populate('facility', 'name facilityId type location')
      .populate('provider', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    await logPatientAccess(req.params.healthId, 'View', 'Full Record', req.ip);

    res.json({
      consents: consents.map(c => ({
        id: c._id,
        facility: c.facility,
        provider: c.provider,
        consentType: c.consentType,
        purpose: c.purpose,
        scope: c.scope,
        status: c.status,
        validFrom: c.validFrom,
        validUntil: c.validUntil,
        grantedBy: c.grantedBy,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching consents:', error);
    res.status(500).json({
      message: 'Failed to fetch consents',
      error: error.message
    });
  }
});

// Get patient's access audit log (who accessed their records)
router.get('/access-log/:healthId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const { limit = 100, startDate, endDate } = req.query;

    let filter = { patient: patient._id };
    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(endDate) };

    const accessLogs = await AuditLog.find(filter)
      .populate('accessedBy', 'firstName lastName specialization providerId')
      .populate('facility', 'name facilityId type')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    await logPatientAccess(req.params.healthId, 'View', 'Full Record', req.ip);

    res.json({
      accessLogs: accessLogs.map(log => ({
        timestamp: log.timestamp,
        accessedBy: log.accessedBy,
        facility: log.facility,
        actionType: log.actionType,
        resourceType: log.resourceType,
        accessResult: log.accessResult,
        wasEmergencyAccess: log.wasEmergencyAccess
      }))
    });
  } catch (error) {
    console.error('Error fetching access log:', error);
    res.status(500).json({
      message: 'Failed to fetch access log',
      error: error.message
    });
  }
});

// Revoke consent (patient revokes facility access)
router.post('/revoke-consent/:consentId', async (req, res) => {
  try {
    const { healthId, reason } = req.body;

    const patient = await Patient.findOne({ healthId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const consent = await Consent.findById(req.params.consentId);
    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }

    // Verify consent belongs to this patient
    if (consent.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Consent does not belong to this patient' });
    }

    consent.status = 'Revoked';
    consent.revokedAt = new Date();
    consent.revokedBy = patient._id;
    consent.revokedReason = reason;

    await consent.save();

    await logPatientAccess(healthId, 'Update', 'Full Record', req.ip);

    res.json({
      message: 'Consent revoked successfully',
      consent: {
        id: consent._id,
        status: consent.status,
        revokedAt: consent.revokedAt
      }
    });
  } catch (error) {
    console.error('Error revoking consent:', error);
    res.status(500).json({
      message: 'Failed to revoke consent',
      error: error.message
    });
  }
});

// Download full medical record (PDF/JSON)
router.get('/download/:healthId', async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const patient = await Patient.findOne({ healthId: req.params.healthId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const [encounters, labResults, appointments, consents] = await Promise.all([
      Encounter.find({ patient: patient._id })
        .populate('provider', 'firstName lastName specialization')
        .populate('facility', 'name facilityId'),
      Laboratory.find({ patient: patient._id }),
      Appointment.find({ patient: patient._id })
        .populate('doctor', 'firstName lastName specialization'),
      Consent.find({ patient: patient._id })
        .populate('facility', 'name facilityId')
    ]);

    await logPatientAccess(req.params.healthId, 'Export', 'Full Record', req.ip);

    const fullRecord = {
      profile: {
        healthId: patient.healthId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        genotype: patient.genotype,
        contact: patient.contact
      },
      medicalHistory: {
        chronicConditions: patient.chronicConditions,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        familyHistory: patient.familyHistory
      },
      currentMedications: patient.currentMedications,
      immunizations: patient.immunizations,
      encounters,
      labResults,
      appointments,
      consents,
      downloadedAt: new Date(),
      exportedBy: 'Patient Portal'
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${patient.healthId}_medical_record.json"`);
      res.json(fullRecord);
    } else {
      // TODO: Implement PDF generation
      res.status(501).json({ message: 'PDF export not yet implemented' });
    }
  } catch (error) {
    console.error('Error downloading record:', error);
    res.status(500).json({
      message: 'Failed to download record',
      error: error.message
    });
  }
});

// Helper function to log patient's own access
async function logPatientAccess(healthId, actionType, resourceType, ipAddress) {
  try {
    const patient = await Patient.findOne({ healthId });
    if (!patient) return;

    const auditLog = new AuditLog({
      patient: patient._id,
      accessedBy: patient._id,
      accessorModel: 'Patient',
      actionType: actionType,
      resourceType: resourceType,
      accessResult: 'Success',
      ipAddress,
      dataAccessed: `${actionType} ${resourceType}`
    });

    await auditLog.save();
  } catch (error) {
    console.error('Error logging patient access:', error);
  }
}

module.exports = router;
