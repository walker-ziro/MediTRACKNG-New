import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';

const ProviderLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'provider') {
      navigate('/provider/login');
      return;
    }

    const userDataString = localStorage.getItem('userData');
    if (userDataString && userDataString !== 'undefined') {
      try {
        const data = JSON.parse(userDataString);
        setUserData(data);
      } catch (error) {
        console.error('Error parsing userData:', error);
        navigate('/provider/login');
      }
    } else {
      navigate('/provider/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/provider/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-purple-700 to-purple-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-purple-600">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-xl">MediTrack</h2>
                <p className="text-xs text-purple-200">Provider Portal</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-purple-600 rounded-lg transition-colors"
            >
              <i className={`fas fa-${sidebarOpen ? 'angles-left' : 'angles-right'}`}></i>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-user-md text-lg"></i>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{userData.name}</p>
                <p className="text-xs text-purple-200 truncate">{userData.specialization}</p>
                <p className="text-xs text-purple-300 truncate">{userData.providerId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/provider/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/provider/dashboard')
                ? 'bg-purple-600 text-white'
                : 'hover:bg-purple-600/50'
            }`}
          >
            <i className="fas fa-home w-5"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/provider/patients"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/provider/patients')
                ? 'bg-purple-600 text-white'
                : 'hover:bg-purple-600/50'
            }`}
          >
            <i className="fas fa-users w-5"></i>
            {sidebarOpen && <span>Patients</span>}
          </Link>

          <Link
            to="/provider/encounters"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/provider/encounters')
                ? 'bg-purple-600 text-white'
                : 'hover:bg-purple-600/50'
            }`}
          >
            <i className="fas fa-stethoscope w-5"></i>
            {sidebarOpen && <span>Encounters</span>}
          </Link>

          <Link
            to="/provider/prescriptions"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/provider/prescriptions')
                ? 'bg-purple-600 text-white'
                : 'hover:bg-purple-600/50'
            }`}
          >
            <i className="fas fa-prescription w-5"></i>
            {sidebarOpen && <span>Prescriptions</span>}
          </Link>

          <Link
            to="/provider/lab-orders"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/provider/lab-orders')
                ? 'bg-purple-600 text-white'
                : 'hover:bg-purple-600/50'
            }`}
          >
            <i className="fas fa-flask w-5"></i>
            {sidebarOpen && <span>Lab Orders</span>}
          </Link>

          <Link
            to="/provider/telemedicine"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/provider/telemedicine')
                ? 'bg-purple-600 text-white'
                : 'hover:bg-purple-600/50'
            }`}
          >
            <i className="fas fa-video w-5"></i>
            {sidebarOpen && <span>Telemedicine</span>}
          </Link>

          <Link
            to="/provider/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/provider/settings')
                ? 'bg-purple-600 text-white'
                : 'hover:bg-purple-600/50'
            }`}
          >
            <i className="fas fa-cog w-5"></i>
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-purple-600">
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

export default ProviderLayout;
