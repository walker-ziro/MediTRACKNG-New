import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const userDataString = localStorage.getItem('userData');
    if (userDataString && userDataString !== 'undefined') {
      try {
        const data = JSON.parse(userDataString);
        setUserData(data);
      } catch (error) {
        console.error('Error parsing userData:', error);
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-800 to-black text-white transition-all duration-300 flex flex-col border-r border-gray-700`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-xl text-red-400">MediTrack</h2>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i className={`fas fa-${sidebarOpen ? 'angles-left' : 'angles-right'}`}></i>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-900 to-red-700 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-user-shield text-lg"></i>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{userData.name}</p>
                <p className="text-xs text-gray-400 truncate">{userData.role}</p>
                <p className="text-xs text-gray-500 truncate">{userData.adminId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/dashboard')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-home w-5"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/users')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-users w-5"></i>
            {sidebarOpen && <span>User Management</span>}
          </Link>

          <Link
            to="/admin/providers"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/providers')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-user-md w-5"></i>
            {sidebarOpen && <span>Provider Management</span>}
          </Link>

          <Link
            to="/admin/facilities"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/facilities')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-hospital w-5"></i>
            {sidebarOpen && <span>Facilities</span>}
          </Link>

          <Link
            to="/admin/analytics"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/analytics')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-chart-line w-5"></i>
            {sidebarOpen && <span>Analytics</span>}
          </Link>

          <Link
            to="/admin/audit-logs"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/audit-logs')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-clipboard-list w-5"></i>
            {sidebarOpen && <span>Audit Logs</span>}
          </Link>

          <Link
            to="/admin/insurance"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/insurance')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-shield-alt w-5"></i>
            {sidebarOpen && <span>Insurance</span>}
          </Link>

          <Link
            to="/admin/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/settings')
                ? 'bg-red-900 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-cog w-5"></i>
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
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

export default AdminLayout;
