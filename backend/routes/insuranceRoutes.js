const express = require('express');
const router = express.Router();
const Insurance = require('../models/Insurance');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

// Helper to create notification
const createNotification = async (healthId, title, message, type = 'Info') => {
  try {
    const Notification = require('../models/Notification');
    await Notification.create({
      patientHealthId: healthId,
      title,
      message,
      type,
      priority: type === 'Important' ? 'High' : 'Medium'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get all insurance policies (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, provider, type } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (provider) query['provider.name'] = { $regex: provider, $options: 'i' };
    if (type) query.policyType = type;

    const policies = await Insurance.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(policies);
  } catch (error) {
    console.error('Error fetching all policies:', error);
    res.status(500).json({ message: 'Error fetching policies', error: error.message });
  }
});

// Create insurance policy
router.post('/', auth, async (req, res) => {
  try {
    const {
      patientHealthId,
      provider,
      policyNumber,
      policyType,
      effectiveDate,
      expiryDate,
      policyHolder,
      dependents,
      coverage,
      limits,
      costSharing,
      approvedFacilities,
      requiresPreAuth,
      preAuthProcedures,
      nhisDetails
    } = req.body;

    // Get patient details
    const patient = await Patient.findOne({ healthId: patientHealthId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Create insurance policy
    const policy = await Insurance.create({
      patient: {
        healthId: patientHealthId,
        name: `${patient.firstName} ${patient.lastName}`,
        dateOfBirth: patient.dateOfBirth
      },
      provider,
      policyNumber,
      policyType,
      effectiveDate,
      expiryDate,
      policyHolder,
      dependents,
      coverage,
      limits,
      costSharing,
      approvedFacilities,
      requiresPreAuth,
      preAuthProcedures,
      nhisDetails
    });

    // Notify patient
    await createNotification(
      patientHealthId,
      'Insurance Policy Added',
      `Your insurance policy from ${provider.name} (${policyNumber}) has been added to your health record.`,
      'Info'
    );

    res.status(201).json({
      message: 'Insurance policy created successfully',
      policy
    });
  } catch (error) {
    console.error('Error creating insurance policy:', error);
    res.status(500).json({ message: 'Error creating insurance policy', error: error.message });
  }
});

// Get patient insurance policies
router.get('/patient/:healthId', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { 'patient.healthId': req.params.healthId };
    if (status) {
      query.status = status;
    }

    const policies = await Insurance.find(query).sort({ createdAt: -1 });

    res.json(policies);
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    res.status(500).json({ message: 'Error fetching policies', error: error.message });
  }
});

// Get single insurance policy
router.get('/:id', auth, async (req, res) => {
  try {
    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error fetching insurance policy:', error);
    res.status(500).json({ message: 'Error fetching policy', error: error.message });
  }
});

// Verify insurance policy
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const { verifiedBy, method, nhisApiResponse } = req.body;

    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    // In production, this would call NHIS API or HMO API for verification
    // For now, we'll mark as verified manually
    policy.verify(verifiedBy, method || 'Manual');
    
    // Store API response if available
    if (nhisApiResponse) {
      policy.notes = `API Verification Response: ${JSON.stringify(nhisApiResponse)}`;
    }

    await policy.save();

    // Notify patient
    await createNotification(
      policy.patient.healthId,
      'Insurance Policy Verified',
      `Your insurance policy from ${policy.provider.name} has been verified and is now active.`,
      'Info'
    );

    res.json({
      message: 'Insurance policy verified successfully',
      policy
    });
  } catch (error) {
    console.error('Error verifying insurance policy:', error);
    res.status(500).json({ message: 'Error verifying policy', error: error.message });
  }
});

// Check coverage for specific service
router.post('/:id/check-coverage', auth, async (req, res) => {
  try {
    const { serviceType, estimatedCost } = req.body;

    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    if (!policy.isActive()) {
      return res.json({
        covered: false,
        reason: policy.status === 'Expired' ? 'Policy has expired' : `Policy is ${policy.status.toLowerCase()}`
      });
    }

    // Check if service type is covered
    if (!policy.isCovered(serviceType)) {
      return res.json({
        covered: false,
        reason: `${serviceType} is not covered under this policy`
      });
    }

    // Check remaining limit
    const limitType = `${serviceType}Limit`;
    const remainingLimit = policy.getRemainingLimit(limitType);
    
    if (remainingLimit !== null && remainingLimit < estimatedCost) {
      return res.json({
        covered: true,
        partialCoverage: true,
        remainingLimit,
        patientResponsibility: estimatedCost - remainingLimit,
        message: `Policy limit reached. Remaining coverage: ₦${remainingLimit.toLocaleString()}`
      });
    }

    // Calculate cost sharing
    let insuranceShare = estimatedCost;
    let patientShare = 0;

    // Apply deductible if not met
    if (policy.costSharing.deductible) {
      const deductibleRemaining = policy.costSharing.deductible - policy.costSharing.deductibleMet;
      if (deductibleRemaining > 0) {
        patientShare += Math.min(deductibleRemaining, estimatedCost);
        insuranceShare -= patientShare;
      }
    }

    // Apply copayment
    if (policy.costSharing.copayPercentage) {
      const copay = insuranceShare * (policy.costSharing.copayPercentage / 100);
      patientShare += copay;
      insuranceShare -= copay;
    }

    res.json({
      covered: true,
      serviceType,
      estimatedCost,
      insuranceShare,
      patientShare,
      remainingLimit: remainingLimit !== null ? remainingLimit : 'Unlimited',
      requiresPreAuth: policy.requiresPreAuth && policy.preAuthProcedures.includes(serviceType),
      message: 'Service is covered'
    });
  } catch (error) {
    console.error('Error checking coverage:', error);
    res.status(500).json({ message: 'Error checking coverage', error: error.message });
  }
});

// Submit claim
router.post('/:id/claims', auth, async (req, res) => {
  try {
    const {
      encounterId,
      facilityName,
      serviceDate,
      amount,
      serviceDetails,
      diagnosisCodes,
      procedureCodes
    } = req.body;

    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    if (!policy.isActive()) {
      return res.status(400).json({ message: 'Insurance policy is not active' });
    }

    // Generate claim ID
    const claimId = `CLM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Calculate coverage (simplified)
    let approvedAmount = amount;
    let patientShare = 0;
    let insuranceShare = amount;

    // Apply copay if exists
    if (policy.costSharing.copayPercentage) {
      patientShare = amount * (policy.costSharing.copayPercentage / 100);
      insuranceShare = amount - patientShare;
    }

    // Create claim
    const claim = {
      claimId,
      encounterId,
      facilityName,
      serviceDate,
      claimDate: new Date(),
      amount,
      approvedAmount,
      patientShare,
      insuranceShare,
      status: 'Submitted'
    };

    policy.addClaim(claim);
    await policy.save();

    // Notify patient
    await createNotification(
      policy.patient.healthId,
      'Insurance Claim Submitted',
      `Claim ${claimId} for ₦${amount.toLocaleString()} has been submitted to ${policy.provider.name}.`,
      'Info'
    );

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ message: 'Error submitting claim', error: error.message });
  }
});

// Update claim status
router.put('/:id/claims/:claimId', auth, async (req, res) => {
  try {
    const { status, approvedAmount, denialReason } = req.body;

    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    const claim = policy.claims.find(c => c.claimId === req.params.claimId);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    claim.processedDate = new Date();
    
    if (status === 'Approved' || status === 'Partially Approved') {
      claim.approvedAmount = approvedAmount || claim.amount;
      claim.insuranceShare = claim.approvedAmount - claim.patientShare;
    }
    
    if (status === 'Denied') {
      claim.denialReason = denialReason;
    }

    await policy.save();

    // Notify patient
    let message = '';
    if (status === 'Approved') {
      message = `Your claim ${req.params.claimId} has been approved for ₦${claim.approvedAmount.toLocaleString()}.`;
    } else if (status === 'Denied') {
      message = `Your claim ${req.params.claimId} has been denied. Reason: ${denialReason}`;
    } else {
      message = `Your claim ${req.params.claimId} status has been updated to ${status}.`;
    }

    await createNotification(
      policy.patient.healthId,
      'Claim Status Update',
      message,
      status === 'Denied' ? 'Important' : 'Info'
    );

    res.json({
      message: 'Claim status updated',
      claim
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ message: 'Error updating claim', error: error.message });
  }
});

// Get claims history
router.get('/:id/claims', auth, async (req, res) => {
  try {
    const { status } = req.query;

    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    let claims = policy.claims;
    
    if (status) {
      claims = claims.filter(c => c.status === status);
    }

    // Sort by claim date (newest first)
    claims.sort((a, b) => new Date(b.claimDate) - new Date(a.claimDate));

    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Error fetching claims', error: error.message });
  }
});

// Add dependent
router.post('/:id/dependents', auth, async (req, res) => {
  try {
    const { healthId, name, relationship, dateOfBirth } = req.body;

    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    if (policy.policyType !== 'Family' && policy.policyType !== 'Corporate') {
      return res.status(400).json({ message: 'Can only add dependents to Family or Corporate policies' });
    }

    // Check if dependent already exists
    const existingDependent = policy.dependents.find(d => d.healthId === healthId);
    if (existingDependent) {
      return res.status(400).json({ message: 'Dependent already added to this policy' });
    }

    policy.dependents.push({
      healthId,
      name,
      relationship,
      dateOfBirth
    });

    await policy.save();

    // Notify both policy holder and dependent
    await createNotification(
      policy.patient.healthId,
      'Dependent Added to Policy',
      `${name} has been added as a dependent on your insurance policy.`,
      'Info'
    );

    await createNotification(
      healthId,
      'Added to Insurance Policy',
      `You have been added as a dependent on ${policy.patient.name}'s insurance policy (${policy.policyNumber}).`,
      'Info'
    );

    res.json({
      message: 'Dependent added successfully',
      policy
    });
  } catch (error) {
    console.error('Error adding dependent:', error);
    res.status(500).json({ message: 'Error adding dependent', error: error.message });
  }
});

// Update policy status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, reason } = req.body;

    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    const oldStatus = policy.status;
    policy.status = status;
    
    if (reason) {
      policy.notes = policy.notes 
        ? `${policy.notes}\n\nStatus change: ${oldStatus} → ${status}. Reason: ${reason}`
        : `Status change: ${oldStatus} → ${status}. Reason: ${reason}`;
    }

    await policy.save();

    // Notify patient
    await createNotification(
      policy.patient.healthId,
      'Insurance Policy Status Updated',
      `Your insurance policy status has been updated from ${oldStatus} to ${status}. ${reason ? `Reason: ${reason}` : ''}`,
      status === 'Cancelled' || status === 'Suspended' ? 'Important' : 'Info'
    );

    res.json({
      message: 'Policy status updated',
      policy
    });
  } catch (error) {
    console.error('Error updating policy status:', error);
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

// Get utilization summary
router.get('/:id/utilization', auth, async (req, res) => {
  try {
    const policy = await Insurance.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    const summary = {
      totalLimit: policy.limits.annualLimit,
      totalUtilized: policy.utilized.totalUtilized,
      remainingLimit: policy.getRemainingLimit('annualLimit'),
      utilizationPercentage: policy.limits.annualLimit 
        ? ((policy.utilized.totalUtilized / policy.limits.annualLimit) * 100).toFixed(2)
        : 0,
      claimsSummary: {
        total: policy.claims.length,
        approved: policy.claims.filter(c => c.status === 'Approved').length,
        pending: policy.claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length,
        denied: policy.claims.filter(c => c.status === 'Denied').length
      },
      byCategory: {
        outpatient: policy.utilized.outpatientUtilized || 0,
        inpatient: policy.utilized.inpatientUtilized || 0,
        emergency: policy.utilized.emergencyUtilized || 0,
        surgery: policy.utilized.surgeryUtilized || 0,
        maternity: policy.utilized.maternityUtilized || 0
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching utilization summary:', error);
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

module.exports = router;
