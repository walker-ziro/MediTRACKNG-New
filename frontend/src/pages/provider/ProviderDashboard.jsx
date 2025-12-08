import React from 'react';
import { Link } from 'react-router-dom';

const ProviderDashboard = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Top Header */}
      <header className="bg-white shadow-sm p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, Dr. {userData.lastName || 'Provider'}</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your practice today</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Patients</p>
              <h3 className="text-3xl font-bold text-gray-800">247</h3>
            </div>
            <i className="fas fa-users text-blue-500 text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Today's Appointments</p>
              <h3 className="text-3xl font-bold text-gray-800">12</h3>
            </div>
            <i className="fas fa-calendar-check text-green-500 text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Pending Prescriptions</p>
              <h3 className="text-3xl font-bold text-gray-800">8</h3>
            </div>
            <i className="fas fa-prescription text-purple-500 text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Lab Orders</p>
              <h3 className="text-3xl font-bold text-gray-800">15</h3>
            </div>
            <i className="fas fa-flask text-orange-500 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Provider Info Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="opacity-80">Provider ID</p>
            <p className="font-semibold">{userData.providerId || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Role</p>
            <p className="font-semibold">{userData.role || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Specialization</p>
            <p className="font-semibold">{userData.specialization || 'General'}</p>
          </div>
          <div>
            <p className="opacity-80">Facility</p>
            <p className="font-semibold">{userData.facilityName || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: 'user-plus', label: 'Register New Patient', color: 'blue', link: '/provider/patients' },
              { icon: 'notes-medical', label: 'Create Encounter', color: 'green', link: '/provider/encounters' },
              { icon: 'prescription-bottle', label: 'Write Prescription', color: 'purple', link: '/provider/prescriptions' },
              { icon: 'vial', label: 'Order Lab Test', color: 'orange', link: '/provider/lab-orders' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.link}
                className={`flex items-center gap-3 p-3 border-2 border-${action.color}-200 hover:bg-${action.color}-50 rounded-lg transition-colors`}
              >
                <i className={`fas fa-${action.icon} text-${action.color}-600`}></i>
                <span className="font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {[
              { time: '09:00 AM', patient: 'John Doe', type: 'Consultation' },
              { time: '10:30 AM', patient: 'Jane Smith', type: 'Follow-up' },
              { time: '02:00 PM', patient: 'Mike Johnson', type: 'Check-up' },
            ].map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-purple-600"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{apt.patient}</p>
                    <p className="text-xs text-gray-500">{apt.type}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-purple-600">{apt.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
