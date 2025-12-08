const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');
const auth = require('../middleware/auth');

// Create a new medication
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      category,
      stock,
      reorderLevel,
      price
    } = req.body;

    if (!name || !category || stock === undefined || !reorderLevel || !price) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    const medication = new Pharmacy({
      ...req.body,
      status: stock <= reorderLevel ? 'Low Stock' : 'In Stock'
    });

    await medication.save();

    res.status(201).json({
      message: 'Medication created successfully',
      medication
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({
      message: 'Failed to create medication',
      error: error.message
    });
  }
});

// Get all medications
router.get('/', auth, async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const medications = await Pharmacy.find(query)
      .sort({ name: 1 });

    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({
      message: 'Failed to fetch medications',
      error: error.message
    });
  }
});

// Get medication by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const medication = await Pharmacy.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({
      message: 'Failed to fetch medication',
      error: error.message
    });
  }
});

// Update medication
router.put('/:id', auth, async (req, res) => {
  try {
    // Update status based on stock
    if (req.body.stock !== undefined && req.body.reorderLevel !== undefined) {
      req.body.status = req.body.stock <= req.body.reorderLevel ? 'Low Stock' : 'In Stock';
    }

    const medication = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json({
      message: 'Medication updated successfully',
      medication
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({
      message: 'Failed to update medication',
      error: error.message
    });
  }
});

// Delete medication
router.delete('/:id', auth, async (req, res) => {
  try {
    const medication = await Pharmacy.findByIdAndDelete(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({
      message: 'Failed to delete medication',
      error: error.message
    });
  }
});

module.exports = router;
