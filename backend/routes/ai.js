const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/ai/generate-insights
// @desc    Generate AI insights based on hospital data
// @access  Private
router.post('/generate-insights', auth, async (req, res) => {
  try {
    // Fetch real-time data from database
    const [totalPatients, totalAppointments, todayAppointments, emergencyAppointments] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Appointment.countDocuments({ type: 'emergency' })
    ]);

    // Get appointment trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAppointments = await Appointment.countDocuments({
      date: { $gte: sevenDaysAgo }
    });

    // Prepare context for AI
    const hospitalContext = `
    Current Hospital Statistics:
    - Total Patients: ${totalPatients}
    - Total Appointments: ${totalAppointments}
    - Today's Appointments: ${todayAppointments}
    - Emergency Appointments: ${emergencyAppointments}
    - Last 7 Days Appointments: ${recentAppointments}
    - Current Time: ${new Date().toLocaleString()}
    
    Based on this data, provide 5 actionable insights for hospital management.
    Each insight should be:
    1. Specific and data-driven
    2. Actionable
    3. Related to patient care, resource management, or operational efficiency
    
    Format each insight as:
    {
      "type": "info|warning|success|alert",
      "title": "Brief title",
      "message": "Detailed insight message"
    }
    
    Return ONLY a valid JSON array with 5 insights. No additional text.
    `;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(hospitalContext);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    let insights;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      // Return default insights if parsing fails
      insights = [
        {
          type: 'info',
          title: 'Patient Activity',
          message: `Currently managing ${totalPatients} patients with ${todayAppointments} appointments today`
        },
        {
          type: 'warning',
          title: 'Appointment Volume',
          message: `${recentAppointments} appointments in the last week - monitor capacity`
        },
        {
          type: 'alert',
          title: 'Emergency Cases',
          message: `${emergencyAppointments} emergency appointments require immediate attention`
        },
        {
          type: 'success',
          title: 'System Status',
          message: 'All systems operational - continue monitoring metrics'
        },
        {
          type: 'info',
          title: 'Resource Planning',
          message: 'Review staffing levels based on current patient load'
        }
      ];
    }

    res.json({
      success: true,
      insights: insights.slice(0, 5), // Ensure max 5 insights
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
});

// @route   POST /api/ai/analyze-patient
// @desc    Analyze patient data and provide recommendations
// @access  Private
router.post('/analyze-patient/:healthId', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ healthId: req.params.healthId });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patientContext = `
    Patient Information:
    - Name: ${patient.demographics?.name || 'Not specified'}
    - Date of Birth: ${patient.demographics?.dateOfBirth || 'Not specified'}
    - Gender: ${patient.demographics?.gender || 'Not specified'}
    - Medical History: ${patient.medicalHistory?.join(', ') || 'None recorded'}
    - Current Medications: ${patient.medicationHistory?.join(', ') || 'None recorded'}
    - Immunization Records: ${patient.immunizationRecords?.join(', ') || 'None recorded'}
    
    Provide a brief medical summary and 3 care recommendations for this patient.
    Format as JSON:
    {
      "summary": "Brief patient summary",
      "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
    }
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(patientContext);
    const response = await result.response;
    const text = response.text();

    let analysis;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    } catch (parseError) {
      analysis = {
        summary: 'Patient data analysis in progress',
        recommendations: [
          'Regular health checkups recommended',
          'Maintain updated medical records',
          'Follow prescribed treatment plans'
        ]
      };
    }

    res.json({
      success: true,
      patient: {
        healthId: patient.healthId,
        name: patient.name
      },
      analysis
    });

  } catch (error) {
    console.error('Patient Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze patient data',
      error: error.message
    });
  }
});

module.exports = router;
