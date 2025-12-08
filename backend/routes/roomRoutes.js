const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const auth = require('../middleware/auth');

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const { status, roomType, department, floor } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (roomType) query.roomType = roomType;
    if (department) query.department = department;
    if (floor) query.floor = parseInt(floor);

    const rooms = await Room.find(query).sort({ roomNumber: 1 });

    // Get bed count for each room
    const roomsWithBeds = await Promise.all(
      rooms.map(async (room) => {
        const bedCount = await Bed.countDocuments({ roomId: room._id });
        const occupiedBeds = await Bed.countDocuments({ 
          roomId: room._id, 
          status: 'Occupied' 
        });
        return {
          ...room.toObject(),
          bedCount,
          occupiedBeds,
          availableBeds: bedCount - occupiedBeds
        };
      })
    );

    res.json(roomsWithBeds);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
});

// Get room statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Under Maintenance' });
    const reservedRooms = await Room.countDocuments({ status: 'Reserved' });

    // Get stats by room type
    const roomTypeStats = await Room.aggregate([
      {
        $group: {
          _id: '$roomType',
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

    // Get stats by department
    const departmentStats = await Room.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      reservedRooms,
      occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
      roomTypeStats,
      departmentStats
    });
  } catch (error) {
    console.error('Error fetching room stats:', error);
    res.status(500).json({
      message: 'Failed to fetch room statistics',
      error: error.message
    });
  }
});

// Get a single room with its beds
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get all beds in this room
    const beds = await Bed.find({ roomId: room._id })
      .populate('currentPatient', 'healthId firstName lastName');

    res.json({
      room,
      beds
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      message: 'Failed to fetch room',
      error: error.message
    });
  }
});

// Create a new room
router.post('/', auth, async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      floor,
      capacity,
      status,
      amenities,
      department,
      dailyRate,
      notes
    } = req.body;

    // Validate required fields
    if (!roomNumber || !roomType || !floor || !department) {
      return res.status(400).json({
        message: 'Please provide all required fields: roomNumber, roomType, floor, and department'
      });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    // Create room
    const room = new Room({
      roomNumber,
      roomType,
      floor,
      capacity: capacity || 1,
      status: status || 'Available',
      amenities: amenities || [],
      department,
      dailyRate,
      notes
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      message: 'Failed to create room',
      error: error.message
    });
  }
});

// Update a room
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      floor,
      capacity,
      status,
      amenities,
      department,
      dailyRate,
      notes
    } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // If room number is being changed, check for duplicates
    if (roomNumber && roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber });
      if (existingRoom) {
        return res.status(400).json({ message: 'Room number already exists' });
      }
      room.roomNumber = roomNumber;
    }

    // Update fields
    if (roomType) room.roomType = roomType;
    if (floor !== undefined) room.floor = floor;
    if (capacity !== undefined) room.capacity = capacity;
    if (status) room.status = status;
    if (amenities) room.amenities = amenities;
    if (department) room.department = department;
    if (dailyRate !== undefined) room.dailyRate = dailyRate;
    if (notes !== undefined) room.notes = notes;

    await room.save();

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({
      message: 'Failed to update room',
      error: error.message
    });
  }
});

// Delete a room
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has beds
    const bedCount = await Bed.countDocuments({ roomId: room._id });
    if (bedCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete a room that has beds. Please delete the beds first.'
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      message: 'Failed to delete room',
      error: error.message
    });
  }
});

module.exports = router;
