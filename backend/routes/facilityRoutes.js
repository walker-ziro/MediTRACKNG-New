const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const Provider = require('../models/Provider');

// @route   GET /api/facilities
// @desc    Get all facilities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { state, type, status } = req.query;
    
    let query = {};
    if (state) query['location.state'] = state;
    if (type) query.type = type;
    if (status) query.status = status;
    
    const facilities = await Facility.find(query)
      .select('-apiKey') // Don't expose API keys
      .sort({ name: 1 });
    
    res.json(facilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/:id
// @desc    Get facility by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .select('-apiKey')
      .populate('operatingHours.staff', 'firstName lastName specialization');
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.json(facility);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/facilities
// @desc    Register new facility
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const facilityData = req.body;
    
    // Check if facility with same name and state exists
    const existingFacility = await Facility.findOne({
      name: facilityData.name,
      'location.state': facilityData.location.state
    });
    
    if (existingFacility) {
      return res.status(400).json({ 
        message: 'Facility with this name already exists in this state' 
      });
    }
    
    const facility = new Facility(facilityData);
    await facility.save();
    
    res.status(201).json({ 
      message: 'Facility registered successfully', 
      facility 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/facilities/:id
// @desc    Update facility
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.json({ 
      message: 'Facility updated successfully', 
      facility 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/search/nearby
// @desc    Find facilities near a location
// @access  Public
router.get('/search/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000, type } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }
    
    let query = {
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    if (type) {
      query.type = type;
    }
    
    const facilities = await Facility.find(query)
      .select('-apiKey')
      .limit(20);
    
    res.json(facilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/:id/providers
// @desc    Get all providers at a facility
// @access  Public
router.get('/:id/providers', async (req, res) => {
  try {
    const providers = await Provider.find({
      $or: [
        { primaryFacility: req.params.id },
        { 'affiliatedFacilities.facility': req.params.id }
      ]
    }).select('firstName lastName specialization providerType licenseNumber');
    
    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/state/:state
// @desc    Get all facilities in a state
// @access  Public
router.get('/state/:state', async (req, res) => {
  try {
    const facilities = await Facility.find({ 
      'location.state': req.params.state 
    })
      .select('-apiKey')
      .sort({ type: 1, name: 1 });
    
    res.json(facilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/stats
// @desc    Get facility statistics
// @access  Private (Admin)
router.get('/admin/stats', async (req, res) => {
  try {
    const totalFacilities = await Facility.countDocuments();
    
    const byType = await Facility.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byState = await Facility.aggregate([
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const accredited = await Facility.countDocuments({ 
      'accreditation.status': 'Accredited' 
    });
    
    const withHMS = await Facility.countDocuments({ 
      'systemIntegration.hasHMS': true 
    });
    
    res.json({
      totalFacilities,
      byType,
      byState,
      accredited,
      withHMS,
      hmsIntegrationRate: ((withHMS / totalFacilities) * 100).toFixed(2) + '%'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
