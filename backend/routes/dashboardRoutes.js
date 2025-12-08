const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const Encounter = require('../models/Encounter');
const Bed = require('../models/Bed');
const Room = require('../models/Room');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      todayPatients,
      yesterdayPatients,
      totalDoctors,
      onDutyDoctors,
      todayAppointments,
      yesterdayAppointments,
      totalBeds,
      occupiedBeds,
      totalRooms,
      occupiedRooms,
      todayTransactions
    ] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Patient.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      Provider.countDocuments({ role: 'doctor' }),
      Provider.countDocuments({ role: 'doctor', status: 'Active' }),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ date: { $gte: yesterday, $lt: today } }),
      Bed.countDocuments(),
      Bed.countDocuments({ status: 'Occupied' }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'Occupied' }),
      Transaction.find({ date: { $gte: today, $lt: tomorrow } })
    ]);

    const availableBeds = totalBeds - occupiedBeds;
    const availableRooms = totalRooms - occupiedRooms;
    const absentDoctors = totalDoctors - onDutyDoctors;
    
    // Calculate today's revenue and expenses
    const todayRevenue = todayTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const todayExpenses = todayTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const stats = {
      todayPatients: todayPatients,
      yesterdayPatients: yesterdayPatients,
      patientsDiff: todayPatients - yesterdayPatients,
      doctorsAvailable: onDutyDoctors,
      totalDoctors: totalDoctors,
      absentDoctors: absentDoctors,
      appointments: todayAppointments,
      yesterdayAppointments: yesterdayAppointments,
      appointmentsDiff: todayAppointments - yesterdayAppointments,
      bedsRooms: { 
        beds: occupiedBeds,
        totalBeds: totalBeds,
        availableBeds: availableBeds,
        rooms: occupiedRooms,
        totalRooms: totalRooms,
        availableRooms: availableRooms
      },
      financials: {
        todayRevenue,
        todayExpenses,
        todayNet: todayRevenue - todayExpenses
      }
    };

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get today's appointments/schedule
router.get('/appointments/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('doctorName', 'firstName lastName')
      .populate('patientName', 'firstName lastName')
      .sort({ appointmentTime: 1 })
      .limit(10);

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get doctors schedule
router.get('/doctors/schedule', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const doctors = await Provider.find({ role: 'doctor' })
      .select('firstName lastName specialty status')
      .limit(10);

    // Get appointment count for each doctor today
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const appointmentCount = await Appointment.countDocuments({
          doctorName: doctor._id,
          date: { $gte: today, $lt: tomorrow }
        });

        return {
          _id: doctor._id,
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialty: doctor.specialty || 'General',
          status: doctor.status || 'Active',
          appointments: appointmentCount
        };
      })
    );

    res.json(doctorsWithStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get patient overview by age group (last 6 months)
router.get('/patients/overview', auth, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const patients = await Patient.find({
      createdAt: { $gte: sixMonthsAgo }
    }).select('dateOfBirth createdAt');

    // Group by month and age category
    const monthlyData = {};
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    
    patients.forEach(patient => {
      const month = new Date(patient.createdAt).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { children: 0, adult: 0, elders: 0 };
      }

      // Calculate age
      const age = patient.dateOfBirth 
        ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : 30; // Default age if not provided

      if (age < 18) monthlyData[month].children++;
      else if (age < 60) monthlyData[month].adult++;
      else monthlyData[month].elders++;
    });

    // Format response
    const overview = months.map(month => ({
      month,
      children: monthlyData[month]?.children || 0,
      adult: monthlyData[month]?.adult || 0,
      elders: monthlyData[month]?.elders || 0
    }));

    res.json(overview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get department overview
router.get('/departments/overview', auth, async (req, res) => {
  try {
    const departments = await Provider.aggregate([
      { $match: { role: 'doctor', specialty: { $exists: true, $ne: null } } },
      { $group: { _id: '$specialty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const total = departments.reduce((sum, dept) => sum + dept.count, 0);
    
    const overview = departments.map(dept => ({
      department: dept._id,
      count: dept.count,
      percentage: total > 0 ? ((dept.count / total) * 100).toFixed(1) : 0
    }));

    res.json(overview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get financial overview
router.get('/financials/overview', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const transactions = await Transaction.find({
      date: { $gte: startOfMonth }
    });

    const revenue = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const total = revenue + expenses;

    res.json({
      total,
      revenue,
      expenses,
      revenuePercentage: total > 0 ? ((revenue / total) * 100).toFixed(1) : 0,
      expensePercentage: total > 0 ? ((expenses / total) * 100).toFixed(1) : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;