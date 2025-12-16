import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';
import { dashboardAPI, api } from '../../utils/api';

const ProviderDashboard = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const { theme, t , darkMode } = useSettings();
  const { wrapRequest } = useApi();
  const [providerName, setProviderName] = useState(userData.lastName || 'Provider');
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPrescriptions: 0,
    labOrders: 0,
    upcomingAppointments: []
  });

  useEffect(() => {
    const loadData = async () => {
      // Load Stats
      const id = userData.providerId || userData._id || userData.id;
      if (id) {
        try {
          const data = await wrapRequest(dashboardAPI.getProviderStats(id));
          if (data) {
            setStats(data);
          }
        } catch (error) {
          console.error('Failed to load provider stats', error);
        }
      } else {
        console.warn('No provider ID found in user data', userData);
      }

      // Load Profile to get up-to-date name
      try {
        const profile = await api.get('/multi-auth/profile');
        if (profile.data && profile.data.lastName) {
           setProviderName(profile.data.lastName);
           // Update local storage
           const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
           localStorage.setItem('userData', JSON.stringify({ ...currentData, ...profile.data }));
        }
      } catch (error) {
         console.error('Failed to load profile', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Header */}
      <header className={`shadow-sm p-4 md:p-6 rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Welcome, Dr. {providerName}</h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Here's what's happening with your practice today</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-blue-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total {t('patients')}</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalPatients}</h3>
            </div>
            <i className="fas fa-users text-blue-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-green-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today's {t('appointments')}</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.todayAppointments}</h3>
            </div>
            <i className="fas fa-calendar-check text-green-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-purple-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending {t('prescriptions')}</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.pendingPrescriptions}</h3>
            </div>
            <i className="fas fa-prescription text-purple-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border-l-4 border-orange-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('labOrders')}</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.labOrders}</h3>
            </div>
            <i className="fas fa-flask text-orange-500 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Provider Info Card */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-6 rounded-lg mb-6 shadow-sm`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Profile</h2>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div>
            <p className="opacity-80">Provider ID</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.providerId || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Role</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.role || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Specialization</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.specialization || 'General'}</p>
          </div>
          <div>
            <p className="opacity-80">Facility</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.facilityName || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: 'user-plus', label: `Register New ${t('patients')}`, color: 'blue', link: '/provider/patients' },
              { icon: 'notes-medical', label: `Create ${t('encounters')}`, color: 'green', link: '/provider/encounters' },
              { icon: 'prescription-bottle', label: `Write ${t('prescriptions')}`, color: 'purple', link: '/provider/prescriptions' },
              { icon: 'vial', label: `Order ${t('labOrders')}`, color: 'orange', link: '/provider/lab-orders' },
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

        {/* Today's Schedule */}
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Today's Schedule</h3>
          <div className="space-y-3">
            {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
              stats.upcomingAppointments.map((apt, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-purple-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{apt.patientName}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{apt.type}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-purple-600">{apt.time}</span>
                </div>
              ))
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No appointments for today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
