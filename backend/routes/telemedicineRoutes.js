const express = require('express');
const router = express.Router();
const Telemedicine = require('../models/Telemedicine');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

// Helper function to generate meeting room
const generateMeetingRoom = () => {
  const roomId = Math.random().toString(36).substring(2, 15);
  const password = Math.random().toString(36).substring(2, 10);
  
  return {
    roomId,
    meetingUrl: `https://meet.meditrackng.ng/room/${roomId}`,
    joinToken: Buffer.from(`${roomId}:${Date.now()}`).toString('base64'),
    password,
    provider: 'MediTRACKNG Video' // Could be Zoom, Teams, etc.
  };
};

// Helper to create notification
const createNotification = async (healthId, title, message, type = 'Info') => {
  try {
    // Notification model is currently incompatible with patient notifications
    // const Notification = require('../models/Notification');
    // await Notification.create({ ... });
    console.log(`[Mock Notification] To: ${healthId}, Title: ${title}, Message: ${message}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Schedule new telemedicine consultation
router.post('/', auth, async (req, res) => {
  try {
    const {
      patientHealthId,
      providerId,
      scheduledDate,
      duration,
      consultationType,
      chiefComplaint,
      symptoms,
      urgency
    } = req.body;

    if (!patientHealthId || !providerId || !scheduledDate || !consultationType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate scheduledDate
    const dateObj = new Date(scheduledDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduledDate format' });
    }

    // Get patient details
    const patient = await Patient.findOne({ healthId: patientHealthId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Generate meeting room
    const meetingRoom = generateMeetingRoom();

    // Create consultation
    const consultation = await Telemedicine.create({
      patient: {
        healthId: patientHealthId,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone || '',
        email: patient.email || ''
      },
      provider: {
        providerId,
        name: req.body.providerName || 'Unknown Provider',
        specialization: req.body.providerSpecialization || 'General',
        facilityName: req.body.facilityName || 'MediTRACKING'
      },
      scheduledDate: dateObj,
      duration: duration || 30,
      consultationType,
      chiefComplaint: chiefComplaint || '',
      symptoms: symptoms || [],
      urgency: urgency || 'Routine',
      meetingRoom
    });

    // Notify patient (Disabled temporarily due to model mismatch)
    /*
    await createNotification(
      patientHealthId,
      'Telemedicine Consultation Scheduled',
      `Your virtual consultation is scheduled for ${new Date(scheduledDate).toLocaleString()}. Meeting URL: ${meetingRoom.meetingUrl}`,
      'Info'
    );
    */

    res.status(201).json({
      message: 'Telemedicine consultation scheduled successfully',
      consultation,
      meetingUrl: meetingRoom.meetingUrl
    });
  } catch (error) {
    console.error('Error scheduling consultation:', error);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error scheduling consultation', 
      error: error.message,
      details: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get patient consultations
router.get('/patient/:healthId', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { 'patient.healthId': req.params.healthId };
    if (status) {
      query.status = status;
    }

    const consultations = await Telemedicine.find(query)
      .sort({ scheduledDate: -1 });

    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
});

// Get provider consultations
router.get('/provider/:providerId', auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    
    const query = { 'provider.providerId': req.params.providerId };
    if (status) {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: startDate, $lte: endDate };
    }

    const consultations = await Telemedicine.find(query)
      .sort({ scheduledDate: 1 });

    res.json(consultations);
  } catch (error) {
    console.error('Error fetching provider consultations:', error);
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
});

// Get single consultation
router.get('/:id', auth, async (req, res) => {
  try {
    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ message: 'Error fetching consultation', error: error.message });
  }
});

// Start consultation
router.post('/:id/start', auth, async (req, res) => {
  try {
    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultation.status === 'Completed' || consultation.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot start ${consultation.status.toLowerCase()} consultation` });
    }

    consultation.start();
    await consultation.save();

    // Notify patient
    await createNotification(
      consultation.patient.healthId,
      'Consultation Started',
      `Your virtual consultation with ${consultation.provider.name} has started. Join now: ${consultation.meetingRoom.meetingUrl}`,
      'Important'
    );

    res.json({
      message: 'Consultation started',
      consultation,
      meetingUrl: consultation.meetingRoom.meetingUrl
    });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({ message: 'Error starting consultation', error: error.message });
  }
});

// Complete consultation with clinical notes
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const {
      clinicalNotes,
      vitals,
      diagnosis,
      prescriptions,
      labOrders,
      referrals,
      followUp,
      connectionQuality
    } = req.body;

    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultation.status !== 'In Progress') {
      return res.status(400).json({ message: 'Consultation is not in progress' });
    }

    // Update consultation
    consultation.complete();
    consultation.clinicalNotes = clinicalNotes;
    consultation.vitals = vitals;
    consultation.diagnosis = diagnosis;
    consultation.prescriptions = prescriptions;
    consultation.labOrders = labOrders;
    consultation.referrals = referrals;
    consultation.followUp = followUp;
    consultation.connectionQuality = connectionQuality;

    await consultation.save();

    // Notify patient
    let notificationMessage = 'Your virtual consultation has been completed.';
    
    if (prescriptions && prescriptions.length > 0) {
      notificationMessage += ' Prescriptions have been issued.';
    }
    
    if (followUp && followUp.required) {
      notificationMessage += ` Follow-up scheduled for ${new Date(followUp.scheduledDate).toLocaleDateString()}.`;
    }

    await createNotification(
      consultation.patient.healthId,
      'Consultation Completed',
      notificationMessage,
      'Info'
    );

    res.json({
      message: 'Consultation completed successfully',
      consultation
    });
  } catch (error) {
    console.error('Error completing consultation:', error);
    res.status(500).json({ message: 'Error completing consultation', error: error.message });
  }
});

// Cancel consultation
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;

    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultation.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel completed consultation' });
    }

    consultation.cancel(reason, cancelledBy);
    await consultation.save();

    // Notify patient
    await createNotification(
      consultation.patient.healthId,
      'Consultation Cancelled',
      `Your consultation scheduled for ${new Date(consultation.scheduledDate).toLocaleString()} has been cancelled. Reason: ${reason}`,
      'Important'
    );

    res.json({
      message: 'Consultation cancelled',
      consultation
    });
  } catch (error) {
    console.error('Error cancelling consultation:', error);
    res.status(500).json({ message: 'Error cancelling consultation', error: error.message });
  }
});

// Reschedule consultation
router.put('/:id/reschedule', auth, async (req, res) => {
  try {
    const { newDate, reason } = req.body;

    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultation.status === 'Completed' || consultation.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot reschedule ${consultation.status.toLowerCase()} consultation` });
    }

    const oldDate = consultation.scheduledDate;
    consultation.scheduledDate = newDate;
    consultation.status = 'Rescheduled';
    
    // Generate new meeting room
    consultation.meetingRoom = generateMeetingRoom();

    await consultation.save();

    // Notify patient
    await createNotification(
      consultation.patient.healthId,
      'Consultation Rescheduled',
      `Your consultation has been rescheduled from ${new Date(oldDate).toLocaleString()} to ${new Date(newDate).toLocaleString()}. ${reason ? `Reason: ${reason}` : ''} New meeting link: ${consultation.meetingRoom.meetingUrl}`,
      'Important'
    );

    res.json({
      message: 'Consultation rescheduled',
      consultation
    });
  } catch (error) {
    console.error('Error rescheduling consultation:', error);
    res.status(500).json({ message: 'Error rescheduling consultation', error: error.message });
  }
});

// Add attachment
router.post('/:id/attachments', auth, async (req, res) => {
  try {
    const { fileName, fileType, fileUrl, uploadedBy } = req.body;

    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.attachments.push({
      fileName,
      fileType,
      fileUrl,
      uploadedBy,
      uploadedAt: new Date()
    });

    await consultation.save();

    res.json({
      message: 'Attachment added',
      consultation
    });
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ message: 'Error adding attachment', error: error.message });
  }
});

// Submit patient feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comments } = req.body;

    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultation.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only provide feedback for completed consultations' });
    }

    consultation.patientFeedback = {
      rating,
      comments,
      submittedAt: new Date()
    };

    await consultation.save();

    res.json({
      message: 'Feedback submitted',
      consultation
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// Update payment status
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { amount, status, method, transactionId } = req.body;

    const consultation = await Telemedicine.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.payment = {
      amount,
      status,
      method,
      transactionId,
      paidAt: status === 'Paid' ? new Date() : null
    };

    await consultation.save();

    // Notify patient
    if (status === 'Paid') {
      await createNotification(
        consultation.patient.healthId,
        'Payment Confirmed',
        `Payment of ₦${amount} for telemedicine consultation has been confirmed. Transaction ID: ${transactionId}`,
        'Info'
      );
    }

    res.json({
      message: 'Payment status updated',
      consultation
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
});

// Get upcoming consultations (for reminders)
router.get('/upcoming/list', auth, async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const consultations = await Telemedicine.find({
      scheduledDate: {
        $gte: now,
        $lte: next24Hours
      },
      status: { $in: ['Scheduled', 'Waiting'] }
    }).sort({ scheduledDate: 1 });

    res.json(consultations);
  } catch (error) {
    console.error('Error fetching upcoming consultations:', error);
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
});

module.exports = router;
