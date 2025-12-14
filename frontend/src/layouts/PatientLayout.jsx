import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const PatientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const { theme, updateTheme, timezone, t , darkMode } = useSettings();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/patient/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!userData) return null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-transform duration-300 z-50`}>
        {/* Logo/Brand */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <i className="fas fa-heartbeat text-xl text-white"></i>
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Medi<span className="text-blue-600">TRACKNG</span>
            </span>
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 ml-1`}>Patient Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <Link
            to="/patient/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/dashboard')
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
            to="/patient/health-records"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/health-records')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t('healthRecords')}</span>
          </Link>

          <Link
            to="/patient/appointments"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/appointments')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{t('appointments')}</span>
          </Link>

          <Link
            to="/patient/prescriptions"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/prescriptions')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>{t('prescriptions')}</span>
          </Link>

          <Link
            to="/patient/telemedicine"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/telemedicine')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{t('telemedicine')}</span>
          </Link>

          <Link
            to="/patient/family-health"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/family-health')
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{t('familyHealth')}</span>
          </Link>

          <div className={`my-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

          <Link
            to="/patient/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/patient/settings')
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
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4 sticky top-0 z-40`}>
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex items-center flex-1 max-w-2xl">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search records, appointments... (Ctrl+K)"
                  className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                className={`relative p-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} hover:bg-gray-100 rounded-lg transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Time Display */}
              <div className={`px-4 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg text-sm font-medium`}>
                {currentTime.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img
                    src={userData.photo || 'https://via.placeholder.com/40'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {userData.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Patient</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className={`absolute right-0 mt-2 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-2 z-50`}>
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className="font-semibold text-gray-800">{userData.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userData.email}</p>
                      <p className="text-xs text-green-600 mt-1">{userData.healthId}</p>
                    </div>
                    <Link to="/patient/settings" className={`block px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profile Settings</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <Outlet />
        </main>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowNotifications(false)}>
          <div className={`absolute right-0 top-0 h-full w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-semibold text-sm">Appointment Reminder</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Dr. Sarah Johnson - Tomorrow at 10:00 AM</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-sm">Lab Results Available</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Your recent blood work results are ready to view</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-sm">Prescription Ready</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Your medication is ready for pickup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientLayout;
