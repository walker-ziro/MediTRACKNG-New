const express = require('express');
const router = express.Router();
const Bed = require('../models/Bed');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Get all beds
router.get('/', auth, async (req, res) => {
  try {
    const { status, bedType, roomId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (bedType) query.bedType = bedType;
    if (roomId) query.roomId = roomId;

    const beds = await Bed.find(query)
      .populate('roomId', 'roomNumber roomType floor')
      .populate('currentPatient', 'healthId firstName lastName')
      .sort({ bedNumber: 1 });

    res.json(beds);
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({
      message: 'Failed to fetch beds',
      error: error.message
    });
  }
});

// Get bed statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalBeds = await Bed.countDocuments();
    const availableBeds = await Bed.countDocuments({ status: 'Available' });
    const occupiedBeds = await Bed.countDocuments({ status: 'Occupied' });
    const maintenanceBeds = await Bed.countDocuments({ status: 'Under Maintenance' });
    const reservedBeds = await Bed.countDocuments({ status: 'Reserved' });

    // Get stats by bed type
    const bedTypeStats = await Bed.aggregate([
      {
        $group: {
          _id: '$bedType',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
          },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      totalBeds,
      availableBeds,
      occupiedBeds,
      maintenanceBeds,
      reservedBeds,
      occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0,
      bedTypeStats
    });
  } catch (error) {
    console.error('Error fetching bed stats:', error);
    res.status(500).json({
      message: 'Failed to fetch bed statistics',
      error: error.message
    });
  }
});

// Get a single bed
router.get('/:id', auth, async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id)
      .populate('roomId', 'roomNumber roomType floor')
      .populate('currentPatient', 'healthId firstName lastName');

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    res.json(bed);
  } catch (error) {
    console.error('Error fetching bed:', error);
    res.status(500).json({
      message: 'Failed to fetch bed',
      error: error.message
    });
  }
});

// Create a new bed
router.post('/', auth, async (req, res) => {
  try {
    const { bedNumber, roomId, bedType, status, notes } = req.body;

    // Validate required fields
    if (!bedNumber || !roomId || !bedType) {
      return res.status(400).json({
        message: 'Please provide all required fields: bedNumber, roomId, and bedType'
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if bed number already exists
    const existingBed = await Bed.findOne({ bedNumber });
    if (existingBed) {
      return res.status(400).json({ message: 'Bed number already exists' });
    }

    // Create bed
    const bed = new Bed({
      bedNumber,
      roomId,
      bedType,
      status: status || 'Available',
      notes
    });

    await bed.save();

    const populatedBed = await Bed.findById(bed._id)
      .populate('roomId', 'roomNumber roomType floor');

    res.status(201).json({
      message: 'Bed created successfully',
      bed: populatedBed
    });
  } catch (error) {
    console.error('Error creating bed:', error);
    res.status(500).json({
      message: 'Failed to create bed',
      error: error.message
    });
  }
});

// Update a bed
router.put('/:id', auth, async (req, res) => {
  try {
    const { bedNumber, roomId, bedType, status, currentPatient, assignedDate, notes } = req.body;

    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    // If bed number is being changed, check for duplicates
    if (bedNumber && bedNumber !== bed.bedNumber) {
      const existingBed = await Bed.findOne({ bedNumber });
      if (existingBed) {
        return res.status(400).json({ message: 'Bed number already exists' });
      }
      bed.bedNumber = bedNumber;
    }

    // Update fields
    if (roomId) bed.roomId = roomId;
    if (bedType) bed.bedType = bedType;
    if (status) bed.status = status;
    if (currentPatient !== undefined) bed.currentPatient = currentPatient;
    if (assignedDate) bed.assignedDate = assignedDate;
    if (notes !== undefined) bed.notes = notes;

    await bed.save();

    const updatedBed = await Bed.findById(bed._id)
      .populate('roomId', 'roomNumber roomType floor')
      .populate('currentPatient', 'healthId firstName lastName');

    res.json({
      message: 'Bed updated successfully',
      bed: updatedBed
    });
  } catch (error) {
    console.error('Error updating bed:', error);
    res.status(500).json({
      message: 'Failed to update bed',
      error: error.message
    });
  }
});

// Delete a bed
router.delete('/:id', auth, async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    // Check if bed is occupied
    if (bed.status === 'Occupied') {
      return res.status(400).json({
        message: 'Cannot delete an occupied bed. Please discharge the patient first.'
      });
    }

    await Bed.findByIdAndDelete(req.params.id);

    res.json({ message: 'Bed deleted successfully' });
  } catch (error) {
    console.error('Error deleting bed:', error);
    res.status(500).json({
      message: 'Failed to delete bed',
      error: error.message
    });
  }
});

// Assign patient to bed
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const { patientId } = req.body;

    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.status === 'Occupied') {
      return res.status(400).json({ message: 'Bed is already occupied' });
    }

    bed.currentPatient = patientId;
    bed.status = 'Occupied';
    bed.assignedDate = new Date();

    await bed.save();

    const updatedBed = await Bed.findById(bed._id)
      .populate('roomId', 'roomNumber roomType floor')
      .populate('currentPatient', 'healthId firstName lastName');

    res.json({
      message: 'Patient assigned to bed successfully',
      bed: updatedBed
    });
  } catch (error) {
    console.error('Error assigning patient to bed:', error);
    res.status(500).json({
      message: 'Failed to assign patient to bed',
      error: error.message
    });
  }
});

// Discharge patient from bed
router.post('/:id/discharge', auth, async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    bed.currentPatient = null;
    bed.status = 'Available';
    bed.assignedDate = null;

    await bed.save();

    const updatedBed = await Bed.findById(bed._id)
      .populate('roomId', 'roomNumber roomType floor');

    res.json({
      message: 'Patient discharged from bed successfully',
      bed: updatedBed
    });
  } catch (error) {
    console.error('Error discharging patient from bed:', error);
    res.status(500).json({
      message: 'Failed to discharge patient from bed',
      error: error.message
    });
  }
});

module.exports = router;
