import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';

const PatientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'patient') {
      navigate('/patient/login');
      return;
    }

    const userDataString = localStorage.getItem('userData');
    if (userDataString && userDataString !== 'undefined') {
      try {
        const data = JSON.parse(userDataString);
        setUserData(data);
      } catch (error) {
        console.error('Error parsing userData:', error);
        navigate('/patient/login');
      }
    } else {
      navigate('/patient/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/patient/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-green-600 to-emerald-700 text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-green-500">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-xl">MediTrack</h2>
                <p className="text-xs text-green-100">Patient Portal</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-green-500 rounded-lg transition-colors"
            >
              <i className={`fas fa-${sidebarOpen ? 'angles-left' : 'angles-right'}`}></i>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-green-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-user text-lg"></i>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{userData.name}</p>
                <p className="text-xs text-green-100 truncate">{userData.healthId}</p>
                {userData.bloodType && (
                  <p className="text-xs text-green-200 truncate">Blood: {userData.bloodType}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/patient/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/dashboard')
                ? 'bg-green-500 text-white'
                : 'hover:bg-green-500/50'
            }`}
          >
            <i className="fas fa-home w-5"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/patient/health-records"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/health-records')
                ? 'bg-green-500 text-white'
                : 'hover:bg-green-500/50'
            }`}
          >
            <i className="fas fa-file-medical w-5"></i>
            {sidebarOpen && <span>Health Records</span>}
          </Link>

          <Link
            to="/patient/appointments"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/appointments')
                ? 'bg-green-500 text-white'
                : 'hover:bg-green-500/50'
            }`}
          >
            <i className="fas fa-calendar-check w-5"></i>
            {sidebarOpen && <span>Appointments</span>}
          </Link>

          <Link
            to="/patient/prescriptions"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/prescriptions')
                ? 'bg-green-500 text-white'
                : 'hover:bg-green-500/50'
            }`}
          >
            <i className="fas fa-pills w-5"></i>
            {sidebarOpen && <span>Prescriptions</span>}
          </Link>

          <Link
            to="/patient/telemedicine"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/telemedicine')
                ? 'bg-green-500 text-white'
                : 'hover:bg-green-500/50'
            }`}
          >
            <i className="fas fa-video w-5"></i>
            {sidebarOpen && <span>Telemedicine</span>}
          </Link>

          <Link
            to="/patient/family-health"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/family-health')
                ? 'bg-green-500 text-white'
                : 'hover:bg-green-500/50'
            }`}
          >
            <i className="fas fa-users w-5"></i>
            {sidebarOpen && <span>Family Health</span>}
          </Link>

          <Link
            to="/patient/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/settings')
                ? 'bg-green-500 text-white'
                : 'hover:bg-green-500/50'
            }`}
          >
            <i className="fas fa-cog w-5"></i>
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-green-500">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors w-full"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;
