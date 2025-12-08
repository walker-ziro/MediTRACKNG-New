const express = require('express');
const router = express.Router();
const Laboratory = require('../models/Laboratory');
const auth = require('../middleware/auth');

// Create a new lab test
router.post('/', auth, async (req, res) => {
  try {
    const {
      healthId,
      patientName,
      testType,
      orderDate,
      priority,
      orderedBy,
      notes
    } = req.body;

    if (!healthId || !patientName || !testType || !orderDate || !orderedBy) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    const labTest = new Laboratory({
      healthId,
      patientName,
      testType,
      orderDate,
      priority: priority || 'Routine',
      orderedBy,
      notes,
      status: 'Pending'
    });

    await labTest.save();

    res.status(201).json({
      message: 'Lab test created successfully',
      labTest
    });
  } catch (error) {
    console.error('Error creating lab test:', error);
    res.status(500).json({
      message: 'Failed to create lab test',
      error: error.message
    });
  }
});

// Get all lab tests
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, healthId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (healthId) query.healthId = healthId;

    const labTests = await Laboratory.find(query)
      .sort({ orderDate: -1 });

    res.json(labTests);
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({
      message: 'Failed to fetch lab tests',
      error: error.message
    });
  }
});

// Get lab test by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const labTest = await Laboratory.findById(req.params.id);
    
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json(labTest);
  } catch (error) {
    console.error('Error fetching lab test:', error);
    res.status(500).json({
      message: 'Failed to fetch lab test',
      error: error.message
    });
  }
});

// Update lab test
router.put('/:id', auth, async (req, res) => {
  try {
    const labTest = await Laboratory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json({
      message: 'Lab test updated successfully',
      labTest
    });
  } catch (error) {
    console.error('Error updating lab test:', error);
    res.status(500).json({
      message: 'Failed to update lab test',
      error: error.message
    });
  }
});

// Delete lab test
router.delete('/:id', auth, async (req, res) => {
  try {
    const labTest = await Laboratory.findByIdAndDelete(req.params.id);

    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json({ message: 'Lab test deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab test:', error);
    res.status(500).json({
      message: 'Failed to delete lab test',
      error: error.message
    });
  }
});

module.exports = router;
