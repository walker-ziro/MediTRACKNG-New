const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Encounter = require('../models/Encounter');
const Facility = require('../models/Facility');
const Laboratory = require('../models/Laboratory');
const Pharmacy = require('../models/Pharmacy');
const auth = require('../middleware/auth');

// Get national health statistics overview
router.get('/overview', auth, async (req, res) => {
  try {
    const [
      totalPatients,
      totalFacilities,
      totalEncounters,
      patientsWithBiometrics,
      patientsWithNIN,
      facilitiesByType,
      patientsByRegion
    ] = await Promise.all([
      Patient.countDocuments(),
      Facility.countDocuments(),
      Encounter.countDocuments(),
      Patient.countDocuments({ 'biometrics.biometricVerified': true }),
      Patient.countDocuments({ 'nationalId.nin': { $exists: true, $ne: '' } }),
      Facility.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Patient.aggregate([
        { $group: { _id: '$contact.address.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const biometricCoverage = totalPatients > 0 
      ? ((patientsWithBiometrics / totalPatients) * 100).toFixed(1) 
      : 0;

    const ninCoverage = totalPatients > 0 
      ? ((patientsWithNIN / totalPatients) * 100).toFixed(1) 
      : 0;

    res.json({
      totalPatients,
      totalFacilities,
      totalEncounters,
      patientsWithBiometrics,
      patientsWithNIN,
      biometricCoverage: `${biometricCoverage}%`,
      ninCoverage: `${ninCoverage}%`,
      facilitiesByType: facilitiesByType.map(f => ({
        type: f._id,
        count: f.count
      })),
      patientsByRegion: patientsByRegion.map(p => ({
        state: p._id,
        count: p.count
      }))
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      message: 'Failed to fetch overview',
      error: error.message
    });
  }
});

// Get disease surveillance data (anonymized)
router.get('/disease-surveillance', auth, async (req, res) => {
  try {
    const { startDate, endDate, state, disease } = req.query;

    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let matchFilter = {};
    if (Object.keys(dateFilter).length > 0) {
      matchFilter['encounters.date'] = dateFilter;
    }

    const diseaseData = await Patient.aggregate([
      { $unwind: '$chronicConditions' },
      {
        $group: {
          _id: '$chronicConditions.condition',
          count: { $sum: 1 },
          states: { $addToSet: '$contact.address.state' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      diseases: diseaseData.map(d => ({
        disease: d._id,
        cases: d.count,
        affectedStates: d.states.length
      }))
    });
  } catch (error) {
    console.error('Error fetching disease surveillance:', error);
    res.status(500).json({
      message: 'Failed to fetch disease surveillance data',
      error: error.message
    });
  }
});

// Get demographic trends
router.get('/demographics', auth, async (req, res) => {
  try {
    const [
      byGender,
      byAgeGroup,
      byBloodGroup,
      byGenotype
    ] = await Promise.all([
      Patient.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]),
      Patient.aggregate([
        {
          $project: {
            ageGroup: {
              $switch: {
                branches: [
                  { 
                    case: { 
                      $lt: [
                        { $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31557600000] },
                        18
                      ]
                    },
                    then: '0-17'
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31557600000] }, 18] },
                        { $lt: [{ $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31557600000] }, 35] }
                      ]
                    },
                    then: '18-34'
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31557600000] }, 35] },
                        { $lt: [{ $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31557600000] }, 50] }
                      ]
                    },
                    then: '35-49'
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31557600000] }, 50] },
                        { $lt: [{ $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31557600000] }, 65] }
                      ]
                    },
                    then: '50-64'
                  }
                ],
                default: '65+'
              }
            }
          }
        },
        { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Patient.aggregate([
        { $match: { bloodGroup: { $exists: true, $ne: '' } } },
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
      ]),
      Patient.aggregate([
        { $match: { genotype: { $exists: true, $ne: '' } } },
        { $group: { _id: '$genotype', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      byGender: byGender.map(g => ({ gender: g._id, count: g.count })),
      byAgeGroup: byAgeGroup.map(a => ({ ageGroup: a._id, count: a.count })),
      byBloodGroup: byBloodGroup.map(b => ({ bloodGroup: b._id, count: b.count })),
      byGenotype: byGenotype.map(g => ({ genotype: g._id, count: g.count }))
    });
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({
      message: 'Failed to fetch demographics',
      error: error.message
    });
  }
});

// Get immunization coverage
router.get('/immunization-coverage', auth, async (req, res) => {
  try {
    const { state, vaccine } = req.query;

    let matchFilter = {};
    if (state) matchFilter['contact.state'] = state;

    const immunizationData = await Patient.aggregate([
      { $match: matchFilter },
      { $unwind: '$immunizations' },
      {
        $group: {
          _id: '$immunizations.vaccineName',
          totalDoses: { $sum: 1 },
          states: { $addToSet: '$contact.state' },
          facilities: { $addToSet: '$immunizations.facility' }
        }
      },
      { $sort: { totalDoses: -1 } }
    ]);

    const totalPatients = await Patient.countDocuments(matchFilter);

    res.json({
      vaccines: immunizationData.map(v => ({
        vaccine: v._id,
        totalDoses: v.totalDoses,
        coverage: totalPatients > 0 ? ((v.totalDoses / totalPatients) * 100).toFixed(1) : 0,
        statesCovered: v.states.length,
        facilitiesAdministered: v.facilities.length
      })),
      totalPatients
    });
  } catch (error) {
    console.error('Error fetching immunization coverage:', error);
    res.status(500).json({
      message: 'Failed to fetch immunization coverage',
      error: error.message
    });
  }
});

// Get medication trends (anonymized)
router.get('/medication-trends', auth, async (req, res) => {
  try {
    const topMedications = await Patient.aggregate([
      { $unwind: '$currentMedications' },
      {
        $group: {
          _id: '$currentMedications.medicationName',
          prescriptionCount: { $sum: 1 },
          commonDosages: { $addToSet: '$currentMedications.dosage' }
        }
      },
      { $sort: { prescriptionCount: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      medications: topMedications.map(m => ({
        medication: m._id,
        prescriptionCount: m.prescriptionCount,
        commonDosages: m.commonDosages
      }))
    });
  } catch (error) {
    console.error('Error fetching medication trends:', error);
    res.status(500).json({
      message: 'Failed to fetch medication trends',
      error: error.message
    });
  }
});

// Get facility performance metrics
router.get('/facility-performance', auth, async (req, res) => {
  try {
    const { region, state, type } = req.query;

    let filter = {};
    if (region) filter['location.region'] = region;
    if (state) filter['location.state'] = state;
    if (type) filter.type = type;

    const facilities = await Facility.find(filter)
      .select('name facilityId type location statistics subscription')
      .sort({ 'statistics.totalPatients': -1 })
      .limit(50);

    const avgPatients = facilities.reduce((sum, f) => sum + (f.statistics?.totalPatients || 0), 0) / facilities.length;
    const avgProviders = facilities.reduce((sum, f) => sum + (f.statistics?.totalProviders || 0), 0) / facilities.length;

    res.json({
      totalFacilities: facilities.length,
      averagePatients: avgPatients.toFixed(0),
      averageProviders: avgProviders.toFixed(0),
      facilities: facilities.map(f => ({
        name: f.name,
        facilityId: f.facilityId,
        type: f.type,
        state: f.location?.state,
        totalPatients: f.statistics?.totalPatients || 0,
        totalProviders: f.statistics?.totalProviders || 0,
        subscriptionTier: f.subscription?.tier
      }))
    });
  } catch (error) {
    console.error('Error fetching facility performance:', error);
    res.status(500).json({
      message: 'Failed to fetch facility performance',
      error: error.message
    });
  }
});

// Get system usage statistics
router.get('/system-usage', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [
      newPatientsCount,
      newEncountersCount,
      activeFacilities,
      biometricVerifications
    ] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: daysAgo } }),
      Encounter.countDocuments({ date: { $gte: daysAgo } }),
      Facility.countDocuments({ 
        'subscription.status': 'Active',
        'systemIntegration.lastSyncDate': { $gte: daysAgo }
      }),
      Patient.countDocuments({
        'biometrics.biometricVerified': true,
        updatedAt: { $gte: daysAgo }
      })
    ]);

    res.json({
      period: `Last ${period} days`,
      newPatients: newPatientsCount,
      newEncounters: newEncountersCount,
      activeFacilities,
      newBiometricVerifications: biometricVerifications,
      averageEncountersPerDay: (newEncountersCount / parseInt(period)).toFixed(1)
    });
  } catch (error) {
    console.error('Error fetching system usage:', error);
    res.status(500).json({
      message: 'Failed to fetch system usage statistics',
      error: error.message
    });
  }
});

// Get regional health indicators
router.get('/regional-health', auth, async (req, res) => {
  try {
    const regionalData = await Patient.aggregate([
      {
        $group: {
          _id: '$contact.state',
          totalPatients: { $sum: 1 },
          chronicDiseases: {
            $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$chronicConditions', []] } }, 0] }, 1, 0] }
          },
          biometricVerified: {
            $sum: { $cond: ['$biometrics.biometricVerified', 1, 0] }
          },
          ninRegistered: {
            $sum: { $cond: [{ $ne: ['$nationalId.nin', ''] }, 1, 0] }
          }
        }
      },
      { $sort: { totalPatients: -1 } }
    ]);

    res.json({
      regions: regionalData.map(r => ({
        state: r._id,
        totalPatients: r.totalPatients,
        chronicDiseases: r.chronicDiseases,
        chronicDiseaseRate: ((r.chronicDiseases / r.totalPatients) * 100).toFixed(1),
        biometricCoverage: ((r.biometricVerified / r.totalPatients) * 100).toFixed(1),
        ninCoverage: ((r.ninRegistered / r.totalPatients) * 100).toFixed(1)
      }))
    });
  } catch (error) {
    console.error('Error fetching regional health:', error);
    res.status(500).json({
      message: 'Failed to fetch regional health indicators',
      error: error.message
    });
  }
});

module.exports = router;
