import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { api } from '../utils/api';
import Footer from '../components/Footer';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const { theme, updateTheme, timezone, t , darkMode } = useSettings();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (userData) {
      fetchNotifications();
    }
  }, [userData]);

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

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!userData) return null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-transform duration-300 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo/Brand */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <i className="fas fa-heartbeat text-xl text-white"></i>
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Medi<span className="text-blue-600">TRACKNG</span>
            </span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={`px-6 pb-2 pt-1 md:hidden`}>
           <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <Link
            to="/admin/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/dashboard')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{t('dashboard')}</span>
          </Link>

          <Link
            to="/admin/users"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/users')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{t('userManagement')}</span>
          </Link>

          <Link
            to="/admin/providers"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/providers')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('providers')}</span>
          </Link>

          <Link
            to="/admin/facilities"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/facilities')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{t('facilities')}</span>
          </Link>

          <Link
            to="/admin/analytics"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/analytics')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{t('analytics')}</span>
          </Link>

          <Link
            to="/admin/audit-logs"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/audit-logs')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t('auditLogs')}</span>
          </Link>

          <Link
            to="/admin/insurance"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/insurance')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{t('insurance')}</span>
          </Link>

          <div className={`my-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

          <Link
            to="/admin/settings"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/settings')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t('settings')}</span>
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('logout')}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="ml-0 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Navigation Bar */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 md:px-8 py-4 sticky top-0 z-40`}>
          <div className="flex items-center justify-between gap-4">
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="flex items-center flex-1 max-w-2xl">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users, facilities, logs... (Ctrl+K)"
                  className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500`}
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => updateTheme(darkMode ? 'light' : 'dark')}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity`}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Time Display */}
              <div className={`hidden md:block px-4 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg text-sm font-medium`}>
                {currentTime.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className={`flex items-center gap-3 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                >
                  <div className={`w-10 h-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {userData.name}
                    </p>
                    <p className="text-xs text-gray-400">{userData.role}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className={`absolute right-0 mt-2 w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border py-2 z-50`}>
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userData.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userData.email}</p>
                      <p className="text-xs text-red-400 mt-1">{userData.adminId}</p>
                    </div>
                    <Link to="/admin/settings" className={`block px-4 py-2 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>Profile Settings</Link>
                    <button onClick={handleLogout} className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-red-900/50' : 'hover:bg-red-50'} text-red-400`}>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col`}>
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowNotifications(false)}>
          <div className={`absolute right-0 top-0 h-full w-96 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl border-l`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification._id} className={`p-4 rounded-lg ${
                      notification.type === 'emergency' ? 'bg-red-900/50 border border-red-700' :
                      notification.type === 'system' ? 'bg-blue-900/50 border border-blue-700' :
                      'bg-gray-800 border border-gray-700'
                    }`}>
                      <p className="font-semibold text-sm text-white">{notification.title}</p>
                      <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
