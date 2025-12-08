import React from 'react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Top Header */}
      <header className="bg-white shadow-sm p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {userData.name || 'Patient'}</h1>
        <p className="text-gray-600 mt-1">Your health information at your fingertips</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Health ID</p>
              <h3 className="text-xl font-bold text-gray-800">{userData.healthId || 'N/A'}</h3>
            </div>
            <i className="fas fa-id-card text-green-500 text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Blood Type</p>
              <h3 className="text-3xl font-bold text-gray-800">{userData.bloodType || 'N/A'}</h3>
            </div>
            <i className="fas fa-tint text-red-500 text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Appointments</p>
              <h3 className="text-3xl font-bold text-gray-800">3</h3>
            </div>
            <i className="fas fa-calendar-alt text-blue-500 text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Prescriptions</p>
              <h3 className="text-3xl font-bold text-gray-800">5</h3>
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
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
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
                <span className="font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {[
              { date: 'Dec 12, 2025', doctor: 'Dr. Sarah Johnson', specialty: 'Cardiologist', time: '10:00 AM' },
              { date: 'Dec 15, 2025', doctor: 'Dr. Mike Brown', specialty: 'General', time: '02:30 PM' },
              { date: 'Dec 20, 2025', doctor: 'Dr. Lisa White', specialty: 'Dermatologist', time: '11:00 AM' },
            ].map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-md text-green-600"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{apt.doctor}</p>
                    <p className="text-xs text-gray-500">{apt.specialty}</p>
                    <p className="text-xs text-gray-400">{apt.date} at {apt.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
