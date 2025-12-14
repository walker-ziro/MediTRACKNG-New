import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const PatientDashboard = () => {
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData') || '{}'));
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const { theme, t , darkMode } = useSettings();
  const { fetchData } = useApi();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userData.healthId) return;

      try {
        // Fetch Profile for latest info (genotype, etc)
        const profileData = await fetchData(`/patient-portal/profile/${userData.healthId}`);
        if (profileData && profileData.profile) {
          setUserData(prev => ({ ...prev, ...profileData.profile }));
        }

        // Fetch Appointments
        const appointmentsData = await fetchData(`/patient-portal/appointments/${userData.healthId}`);
        if (appointmentsData && appointmentsData.appointments) {
          const allAppointments = appointmentsData.appointments;
          const upcoming = allAppointments.filter(a => a.status === 'Scheduled');
          setStats(prev => ({ ...prev, appointments: upcoming.length }));
          setUpcomingAppointments(upcoming.slice(0, 3)); // Top 3
        }

        // Fetch Prescriptions
        const prescriptionsData = await fetchData(`/prescriptions/patient/${userData.healthId}`);
        if (prescriptionsData && prescriptionsData.data) {
           const activePrescriptions = prescriptionsData.data.filter(p => p.status === 'Active');
           setStats(prev => ({ ...prev, prescriptions: activePrescriptions.length }));
        }

      } catch (error) {
        console.error("Error loading dashboard data", error);
      }
    };

    loadDashboardData();
  }, [userData.healthId, fetchData]);

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Header */}
      <header className={`shadow-sm p-6 rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Welcome, {userData.name || 'Patient'}</h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your health information at your fingertips</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-green-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Health ID</p>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userData.healthId || 'N/A'}</h3>
            </div>
            <i className="fas fa-id-card text-green-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Blood Type</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userData.bloodType || 'N/A'}</h3>
            </div>
            <i className="fas fa-tint text-red-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-blue-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('appointments')}</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.appointments}</h3>
            </div>
            <i className="fas fa-calendar-alt text-blue-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-purple-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('prescriptions')}</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.prescriptions}</h3>
            </div>
            <i className="fas fa-pills text-purple-500 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Your Health Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="opacity-80">Age</p>
            <p className="font-semibold">{userData.age || 'N/A'} years</p>
          </div>
          <div>
            <p className="opacity-80">Blood Type</p>
            <p className="font-semibold">{userData.bloodType || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Genotype</p>
            <p className="font-semibold">{userData.genotype || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Health ID</p>
            <p className="font-semibold">{userData.healthId || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: 'calendar-plus', label: 'Book Appointment', color: 'blue', link: '/patient/appointments' },
              { icon: 'file-medical', label: 'View Health Records', color: 'green', link: '/patient/health-records' },
              { icon: 'exclamation-triangle', label: 'Emergency Access', color: 'red', link: '/patient/emergency' },
              { icon: 'fingerprint', label: 'Biometric Setup', color: 'purple', link: '/patient/settings' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.link}
                className={`flex items-center gap-3 p-3 border-2 border-${action.color}-200 hover:bg-${action.color}-50 rounded-lg transition-colors`}
              >
                <i className={`fas fa-${action.icon} text-${action.color}-600`}></i>
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <h3 className="text-lg font-bold mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg hover:bg-gray-100 transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-md text-green-600"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {typeof apt.doctor === 'string' ? apt.doctor : (apt.doctor?.firstName ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Doctor')}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{apt.department || 'General'}</p>
                    <p className="text-xs text-gray-400">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming appointments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
