const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const auth = require('../middleware/auth');

// Create a new staff member
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      role,
      department,
      phone,
      email,
      joinDate
    } = req.body;

    if (!name || !role || !department || !phone || !email || !joinDate) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    const staff = new Staff(req.body);
    await staff.save();

    res.status(201).json({
      message: 'Staff member created successfully',
      staff
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({
      message: 'Failed to create staff member',
      error: error.message
    });
  }
});

// Get all staff
router.get('/', auth, async (req, res) => {
  try {
    const { status, department, role, shift } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (role) query.role = role;
    if (shift) query.shift = shift;

    const staffs = await Staff.find(query)
      .sort({ name: 1 });

    res.json(staffs);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      message: 'Failed to fetch staff',
      error: error.message
    });
  }
});

// Get staff by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({
      message: 'Failed to fetch staff member',
      error: error.message
    });
  }
});

// Update staff
router.put('/:id', auth, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({
      message: 'Staff member updated successfully',
      staff
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({
      message: 'Failed to update staff member',
      error: error.message
    });
  }
});

// Delete staff
router.delete('/:id', auth, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({
      message: 'Failed to delete staff member',
      error: error.message
    });
  }
});

module.exports = router;
