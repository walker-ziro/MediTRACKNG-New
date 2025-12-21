const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const auth = require('../middleware/auth');

// Drug Interaction Database (simplified - in production, use external API)
const DRUG_INTERACTIONS = {
  'Warfarin': ['Aspirin', 'Ibuprofen', 'Naproxen', 'Amoxicillin'],
  'Aspirin': ['Warfarin', 'Ibuprofen', 'Clopidogrel'],
  'Metformin': ['Alcohol', 'Iodinated Contrast'],
  'Simvastatin': ['Clarithromycin', 'Erythromycin', 'Ketoconazole'],
  'Levothyroxine': ['Calcium', 'Iron', 'Omeprazole'],
  'Amoxicillin': ['Warfarin', 'Methotrexate'],
  'Lisinopril': ['Potassium', 'Spironolactone'],
  'Metoprolol': ['Verapamil', 'Diltiazem'],
  'Omeprazole': ['Clopidogrel', 'Levothyroxine'],
  'Prednisone': ['NSAIDs', 'Warfarin', 'Diabetes medications']
};

const { v4: uuidv4 } = require('uuid');

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { patient, medications, diagnosis, clinicalNotes, encounterId } = req.body;
    
    // Get patient details including allergies
    const patientRecord = await Patient.findOne({ healthId: patient.healthId });
    
    if (!patientRecord) {
      console.log('Patient not found for healthId:', patient.healthId);
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check for drug interactions
    const interactions = checkDrugInteractions(medications, patientRecord);
    
    // Add interactions and warnings to medications
    const enhancedMedications = medications.map(med => {
      const medInteractions = interactions.filter(int => 
        int.drug1 === med.drugName || int.drug2 === med.drugName
      );
      
      // Parse dosage if it's a string
      let dosageObj = { amount: '0', unit: 'mg' };
      if (typeof med.dosage === 'string') {
        const parts = med.dosage.split(' ');
        if (parts.length >= 2) {
            dosageObj = { amount: parts[0], unit: parts.slice(1).join(' ') };
        } else {
            dosageObj = { amount: med.dosage, unit: 'unit' };
        }
      } else if (med.dosage) {
        dosageObj = med.dosage;
      }

      // Parse duration if it's a string
      let durationObj = { value: 1, unit: 'days' };
      if (typeof med.duration === 'string') {
         const parts = med.duration.split(' ');
         if (parts.length >= 2) {
             durationObj = { value: parseInt(parts[0]) || 1, unit: parts.slice(1).join(' ') };
         } else {
             durationObj = { value: parseInt(med.duration) || 1, unit: 'days' };
         }
      } else if (med.duration) {
        durationObj = med.duration;
      }

      return {
        ...med,
        dosage: dosageObj,
        duration: durationObj,
        interactions: medInteractions.map(int => int.description),
        warnings: [
          ...checkAllergies(med, patientRecord.allergies || []), // Fixed: allergies is at root
          ...checkContraindications(med, patientRecord.chronicConditions || []) // Fixed: chronicConditions is at root
        ]
      };
    });
    
    // Ensure provider details are present
    // Fix: Use userId from token if providerId is missing
    const providerId = req.user.providerId || req.user.userId || 'UNKNOWN';
    
    // Fetch provider details to get real name
    let providerName = 'Dr. Provider';
    let licenseNumber = 'N/A';
    let specialization = 'General';
    
    try {
        const providerDoc = await Provider.findOne({ providerId: providerId });
        if (providerDoc) {
            providerName = `Dr. ${providerDoc.firstName} ${providerDoc.lastName}`;
            licenseNumber = providerDoc.licenseNumber || 'N/A';
            specialization = providerDoc.specialization || 'General';
        }
    } catch (err) {
        console.error('Error fetching provider details:', err);
    }
    
    const prescription = await Prescription.create({
      prescriptionId: `RX-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      patient: {
        healthId: patient.healthId,
        name: patientRecord.firstName + ' ' + patientRecord.lastName, // Fixed: name construction
        age: calculateAge(patientRecord.dateOfBirth), // Fixed: dateOfBirth is at root
        allergies: patientRecord.allergies?.map(a => a.allergen) || [] // Fixed: allergies structure
      },
      provider: {
        providerId: providerId,
        name: providerName,
        licenseNumber: licenseNumber,
        specialization: specialization
      },
      medications: enhancedMedications,
      diagnosis,
      clinicalNotes,
      encounterId
    });
    
    // Create notification for patient
    await createNotification({
      recipientType: 'Patient',
      recipientId: patient.healthId,
      type: 'Prescription Ready',
      priority: 'Normal',
      title: 'New Prescription Available',
      message: `${providerName} has prescribed ${medications.length} medication(s) for you.`,
      metadata: {
        prescriptionId: prescription.prescriptionId,
        providerName: providerName,
        actionUrl: `/prescriptions/${prescription._id}`,
        actionText: 'View Prescription'
      }
    });
    
    res.status(201).json({
      success: true,
      data: prescription,
      warnings: interactions.length > 0 ? {
        hasInteractions: true,
        interactions
      } : null
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating prescription',
      error: error.message
    });
  }
});

// @desc    Check drug interactions
// @route   POST /api/prescriptions/check-interactions
// @access  Private
router.post('/check-interactions', auth, async (req, res) => {
  try {
    const { healthId, medications } = req.body;
    
    const patient = await Patient.findOne({ healthId });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const interactions = checkDrugInteractions(medications, patient);
    
    res.json({
      success: true,
      data: {
        hasInteractions: interactions.length > 0,
        interactions,
        allergies: checkAllMedicationsForAllergies(medications, patient.medicalHistory?.allergies || []),
        contraindications: checkAllMedicationsForContraindications(medications, patient.medicalHistory?.chronicConditions || [])
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking interactions',
      error: error.message
    });
  }
});

// @desc    Get all prescriptions (for provider/admin)
// @route   GET /api/prescriptions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
});

// @desc    Get prescriptions for a patient
// @route   GET /api/prescriptions/patient/:healthId
// @access  Private
router.get('/patient/:healthId', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { 'patient.healthId': req.params.healthId };
    
    if (status) query.status = status;
    
    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
});

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription',
      error: error.message
    });
  }
});

// @desc    Send prescription to pharmacy
// @route   POST /api/prescriptions/:id/send-to-pharmacy
// @access  Private
router.post('/:id/send-to-pharmacy', auth, async (req, res) => {
  try {
    const { pharmacyId, pharmacyName } = req.body;
    
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        'pharmacy.pharmacyId': pharmacyId,
        'pharmacy.pharmacyName': pharmacyName,
        'pharmacy.sent': true,
        'pharmacy.sentAt': new Date()
      },
      { new: true }
    );
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Notify pharmacy (would integrate with pharmacy system)
    await createNotification({
      recipientType: 'Facility',
      recipientId: pharmacyId,
      type: 'Prescription Ready',
      priority: 'Normal',
      title: 'New Prescription Received',
      message: `New prescription for patient ${prescription.patient.name}`,
      metadata: {
        prescriptionId: prescription.prescriptionId,
        patientHealthId: prescription.patient.healthId
      }
    });
    
    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending prescription to pharmacy',
      error: error.message
    });
  }
});

// @desc    Mark medication as dispensed
// @route   PUT /api/prescriptions/:id/dispense/:medIndex
// @access  Private
router.put('/:id/dispense/:medIndex', auth, async (req, res) => {
  try {
    const { pharmacyId, pharmacyName, pharmacistName } = req.body;
    const { id, medIndex } = req.params;
    
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    if (medIndex >= prescription.medications.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid medication index'
      });
    }
    
    prescription.medications[medIndex].dispensed = true;
    prescription.medications[medIndex].dispensedAt = new Date();
    prescription.medications[medIndex].dispensedBy = {
      pharmacyId,
      pharmacyName,
      pharmacistName
    };
    
    // Update prescription status
    const allDispensed = prescription.medications.every(med => med.dispensed);
    prescription.status = allDispensed ? 'Dispensed' : 'Partially Dispensed';
    
    await prescription.save();
    
    // Notify patient
    await createNotification({
      recipientType: 'Patient',
      recipientId: prescription.patient.healthId,
      type: 'Prescription Ready',
      priority: 'Normal',
      title: 'Medication Dispensed',
      message: `Your medication ${prescription.medications[medIndex].drugName} has been dispensed at ${pharmacyName}`,
      metadata: {
        prescriptionId: prescription.prescriptionId,
        pharmacyName
      }
    });
    
    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking medication as dispensed',
      error: error.message
    });
  }
});

// @desc    Cancel prescription
// @route   PUT /api/prescriptions/:id/cancel
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Cancelled',
        cancelledBy: req.user.providerId,
        cancelledAt: new Date(),
        cancellationReason: reason
      },
      { new: true }
    );
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling prescription',
      error: error.message
    });
  }
});

// Utility Functions
function checkDrugInteractions(medications, patient) {
  const interactions = [];
  const drugNames = medications.map(m => m.drugName);
  
  // Check against current medications
  const currentMeds = patient.medicationHistory || [];
  
  for (let i = 0; i < drugNames.length; i++) {
    const drug1 = drugNames[i];
    
    // Check with other prescribed drugs
    for (let j = i + 1; j < drugNames.length; j++) {
      const drug2 = drugNames[j];
      if (DRUG_INTERACTIONS[drug1]?.includes(drug2)) {
        interactions.push({
          drug1,
          drug2,
          severity: 'Moderate',
          description: `${drug1} may interact with ${drug2}. Monitor patient closely.`
        });
      }
    }
    
    // Check with current medications
    currentMeds.forEach(currentMed => {
      if (DRUG_INTERACTIONS[drug1]?.includes(currentMed)) {
        interactions.push({
          drug1,
          drug2: currentMed,
          severity: 'Moderate',
          description: `${drug1} may interact with current medication ${currentMed}. Consult pharmacist.`
        });
      }
    });
  }
  
  return interactions;
}

function checkAllergies(medication, allergies) {
  const warnings = [];
  allergies.forEach(allergy => {
    if (medication.drugName.toLowerCase().includes(allergy.toLowerCase()) ||
        medication.genericName?.toLowerCase().includes(allergy.toLowerCase())) {
      warnings.push(`⚠️ ALLERGY ALERT: Patient is allergic to ${allergy}`);
    }
  });
  return warnings;
}

function checkContraindications(medication, conditions) {
  const warnings = [];
  // Simplified contraindication checking
  const contraindications = {
    'Metformin': ['Kidney Disease', 'Renal Failure'],
    'NSAIDs': ['Kidney Disease', 'Peptic Ulcer', 'Heart Failure'],
    'ACE Inhibitors': ['Pregnancy', 'Hyperkalemia'],
    'Statins': ['Liver Disease'],
    'Warfarin': ['Bleeding Disorder', 'Peptic Ulcer']
  };
  
  conditions.forEach(condition => {
    Object.keys(contraindications).forEach(drug => {
      if (medication.drugName.includes(drug) && 
          contraindications[drug].some(c => condition.includes(c))) {
        warnings.push(`⚠️ CONTRAINDICATION: ${medication.drugName} may be contraindicated with ${condition}`);
      }
    });
  });
  
  return warnings;
}

function checkAllMedicationsForAllergies(medications, allergies) {
  return medications.map(med => ({
    drugName: med.drugName,
    allergies: checkAllergies(med, allergies)
  })).filter(m => m.allergies.length > 0);
}

function checkAllMedicationsForContraindications(medications, conditions) {
  return medications.map(med => ({
    drugName: med.drugName,
    contraindications: checkContraindications(med, conditions)
  })).filter(m => m.contraindications.length > 0);
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Placeholder for notification creation
async function createNotification(data) {
  // This would integrate with the notification system
  console.log('Notification created:', data);
}

module.exports = router;
