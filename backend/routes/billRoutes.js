const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Create a new bill
router.post('/', auth, async (req, res) => {
  try {
    const {
      healthId,
      patientName,
      service,
      amount,
      dueDate,
      paymentMethod
    } = req.body;

    if (!healthId || !patientName || !service || !amount || !dueDate || !paymentMethod) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    const bill = new Bill(req.body);
    await bill.save();

    res.status(201).json({
      message: 'Bill created successfully',
      bill
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({
      message: 'Failed to create bill',
      error: error.message
    });
  }
});

// Get all bills
router.get('/', auth, async (req, res) => {
  try {
    const { status, healthId, paymentMethod } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (healthId) query.healthId = healthId;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const bills = await Bill.find(query)
      .sort({ date: -1 });

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
});

// Get bill by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      message: 'Failed to fetch bill',
      error: error.message
    });
  }
});

// Update bill
router.put('/:id', auth, async (req, res) => {
  try {
    // If status is being updated to 'Paid', set payment date
    if (req.body.status === 'Paid' && !req.body.paymentDate) {
      req.body.paymentDate = new Date();
    }

    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json({
      message: 'Bill updated successfully',
      bill
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({
      message: 'Failed to update bill',
      error: error.message
    });
  }
});

// Delete bill
router.delete('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({
      message: 'Failed to delete bill',
      error: error.message
    });
  }
});

module.exports = router;
