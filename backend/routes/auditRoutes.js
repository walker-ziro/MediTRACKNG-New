const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const Patient = require('../models/Patient');
const Facility = require('../models/Facility');
const auth = require('../middleware/auth');

// Log access to patient record (called by middleware)
router.post('/log', auth, async (req, res) => {
  try {
    const {
      patientHealthId,
      facilityId,
      actionType,
      resourceType,
      consentId,
      wasEmergencyAccess,
      emergencyJustification,
      accessResult,
      dataAccessed,
      modifications
    } = req.body;

    const patient = await Patient.findOne({ healthId: patientHealthId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const facility = await Facility.findOne({ facilityId });
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const auditLog = new AuditLog({
      patient: patient._id,
      accessedBy: req.user.id,
      facility: facility._id,
      actionType,
      resourceType,
      consentId,
      wasEmergencyAccess,
      emergencyJustification,
      accessResult,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      dataAccessed,
      modifications
    });

    // Auto-flag suspicious activity
    if (wasEmergencyAccess && !consentId) {
      auditLog.suspicious = true;
      auditLog.suspiciousReason = 'Emergency access without documented consent';
    }

    await auditLog.save();

    res.status(201).json({
      message: 'Access logged successfully',
      auditLog
    });
  } catch (error) {
    console.error('Error logging access:', error);
    res.status(500).json({
      message: 'Failed to log access',
      error: error.message
    });
  }
});

// Get audit logs for a patient
router.get('/patient/:healthId', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const { startDate, endDate, actionType, resourceType, facilityId } = req.query;
    
    let filter = { patient: patient._id };
    
    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(endDate) };
    if (actionType) filter.actionType = actionType;
    if (resourceType) filter.resourceType = resourceType;
    if (facilityId) {
      const facility = await Facility.findOne({ facilityId });
      if (facility) filter.facility = facility._id;
    }

    const logs = await AuditLog.find(filter)
      .populate('accessedBy', 'firstName lastName specialization')
      .populate('facility', 'name facilityId type')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

// Get suspicious activities (for security team)
router.get('/suspicious', auth, async (req, res) => {
  try {
    const { reviewed, facilityId, startDate, endDate } = req.query;
    
    let filter = { suspicious: true };
    
    if (reviewed === 'true') filter.reviewedBy = { $ne: null };
    if (reviewed === 'false') filter.reviewedBy = null;
    
    if (facilityId) {
      const facility = await Facility.findOne({ facilityId });
      if (facility) filter.facility = facility._id;
    }
    
    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(endDate) };

    const suspiciousLogs = await AuditLog.find(filter)
      .populate('patient', 'healthId firstName lastName')
      .populate('accessedBy', 'firstName lastName specialization providerId')
      .populate('facility', 'name facilityId type')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ timestamp: -1 })
      .limit(200);

    res.json({
      count: suspiciousLogs.length,
      logs: suspiciousLogs
    });
  } catch (error) {
    console.error('Error fetching suspicious logs:', error);
    res.status(500).json({
      message: 'Failed to fetch suspicious activities',
      error: error.message
    });
  }
});

// Mark suspicious activity as reviewed
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { reviewNotes, action } = req.body;

    const auditLog = await AuditLog.findById(req.params.id);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    auditLog.reviewedBy = req.user.id;
    auditLog.reviewedAt = new Date();
    auditLog.reviewNotes = reviewNotes;
    auditLog.reviewAction = action; // e.g., 'Approved', 'Flagged for investigation', 'Dismissed'

    await auditLog.save();

    res.json({
      message: 'Audit log reviewed successfully',
      auditLog
    });
  } catch (error) {
    console.error('Error reviewing audit log:', error);
    res.status(500).json({
      message: 'Failed to review audit log',
      error: error.message
    });
  }
});

// Get access statistics for facility
router.get('/stats/facility/:facilityId', auth, async (req, res) => {
  try {
    const facility = await Facility.findOne({ facilityId: req.params.facilityId });
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = { facility: facility._id };
    if (Object.keys(dateFilter).length > 0) filter.timestamp = dateFilter;

    const [
      totalAccess,
      successfulAccess,
      deniedAccess,
      emergencyAccess,
      suspiciousCount,
      actionBreakdown
    ] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.countDocuments({ ...filter, accessResult: 'Success' }),
      AuditLog.countDocuments({ ...filter, accessResult: 'Denied' }),
      AuditLog.countDocuments({ ...filter, wasEmergencyAccess: true }),
      AuditLog.countDocuments({ ...filter, suspicious: true }),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: '$actionType', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalAccess,
      successfulAccess,
      deniedAccess,
      emergencyAccess,
      suspiciousCount,
      successRate: totalAccess > 0 ? ((successfulAccess / totalAccess) * 100).toFixed(1) : 0,
      actionBreakdown: actionBreakdown.map(item => ({
        action: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      message: 'Failed to fetch audit statistics',
      error: error.message
    });
  }
});

// Get provider access history
router.get('/provider/:providerId', auth, async (req, res) => {
  try {
    const { startDate, endDate, actionType } = req.query;
    
    let filter = { accessedBy: req.params.providerId };
    
    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(endDate) };
    if (actionType) filter.actionType = actionType;

    const logs = await AuditLog.find(filter)
      .populate('patient', 'healthId firstName lastName')
      .populate('facility', 'name facilityId')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching provider history:', error);
    res.status(500).json({
      message: 'Failed to fetch provider access history',
      error: error.message
    });
  }
});

module.exports = router;
