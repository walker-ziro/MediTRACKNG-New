import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { patientAPI, dashboardAPI, aiAPI } from '../utils/api';
import { useApp } from '../context/AppContext';
import NotificationsPanel from './NotificationsPanel';
import MessagesPanel from './MessagesPanel';
import GlobalSearch from './GlobalSearch';
import AIAssistant from './AIAssistant';
import NewAppointmentModal from './NewAppointmentModal';
import NewPatientModal from './NewPatientModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, unreadNotificationsCount, unreadMessagesCount } = useApp();
  const { timezone } = useSettings();
  const [searchHealthId, setSearchHealthId] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [stats, setStats] = useState({
    todayPatients: 0,
    doctorsAvailable: 0,
    appointments: 0,
    bedsRooms: { 
      beds: 0, 
      totalBeds: 0, 
      availableBeds: 0, 
      rooms: 0, 
      totalRooms: 0, 
      availableRooms: 0 
    }
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiInsights, setAiInsights] = useState([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [doctorsSchedule, setDoctorsSchedule] = useState([]);
  const [patientOverview, setPatientOverview] = useState([]);
  const [departmentOverview, setDepartmentOverview] = useState([]);
  const [financialOverview, setFinancialOverview] = useState({ total: 0, revenue: 0, expenses: 0, revenuePercentage: 0, expensePercentage: 0 });

  const provider = JSON.parse(localStorage.getItem('provider') || '{}');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          statsRes,
          appointmentsRes,
          doctorsRes,
          patientsRes,
          departmentsRes,
          financialRes
        ] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getTodayAppointments().catch(() => ({ data: [] })),
          dashboardAPI.getDoctorsSchedule().catch(() => ({ data: [] })),
          dashboardAPI.getPatientOverview().catch(() => ({ data: [] })),
          dashboardAPI.getDepartmentOverview().catch(() => ({ data: [] })),
          dashboardAPI.getFinancialOverview().catch(() => ({ data: { total: 0, revenue: 0, expenses: 0 } }))
        ]);
        
        setStats(statsRes.data);
        setTodayAppointments(appointmentsRes.data);
        setDoctorsSchedule(doctorsRes.data);
        setPatientOverview(patientsRes.data);
        setDepartmentOverview(departmentsRes.data);
        setFinancialOverview(financialRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (localStorage.getItem('token')) {
      fetchDashboardData();
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
        setShowNotifications(false);
        setShowMessages(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('provider');
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchHealthId.trim()) {
      setError('Please enter a Health ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await patientAPI.getByHealthId(searchHealthId.trim());
      navigate(`/patient/${searchHealthId.trim()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Patient not found. Please check the Health ID.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const response = await aiAPI.generateInsights();
      if (response.data.success) {
        setAiInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      setError('Failed to generate AI insights. Please try again.');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning':
        return { bg: darkMode ? 'bg-red-900/20' : 'bg-red-50', border: 'border-red-500', icon: 'bg-red-500' };
      case 'success':
        return { bg: darkMode ? 'bg-green-900/20' : 'bg-green-50', border: 'border-green-500', icon: 'bg-green-500' };
      case 'alert':
        return { bg: darkMode ? 'bg-orange-900/20' : 'bg-orange-50', border: 'border-orange-500', icon: 'bg-orange-500' };
      default:
        return { bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50', border: 'border-blue-500', icon: 'bg-blue-500' };
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col overflow-hidden`}>
        {/* Fixed Logo Section */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} sticky top-0 z-10`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9V6h2v3h3v2h-3v3H9v-3H6V9h3z"/>
              </svg>
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>MediTRACKNG</span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto">
          <div className="sidebar-item-active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/appointments')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Appointments</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/emergency')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Emergency</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/doctors')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Doctors</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/patients')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Patients</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/laboratory')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Laboratory</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/pharmacy')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Pharmacy</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/staffs')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Staffs</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/bills')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Bills & Payments</span>
          </div>

          <div className="sidebar-item" onClick={() => navigate('/accounts')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Accounts</span>
          </div>

          <div className="my-4"></div>

          <div className="sidebar-item" onClick={() => navigate('/settings')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </div>

          <button onClick={handleLogout} className="sidebar-item w-full text-red-600 hover:bg-red-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 max-w-2xl">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search patients, doctors, pages... (Ctrl+K)"
                  onClick={() => setShowGlobalSearch(true)}
                  onFocus={() => setShowGlobalSearch(true)}
                  readOnly
                  className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAIAssistant(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>AI Assistant</span>
                <span className="text-lg">✨</span>
              </button>

              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleDarkMode();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMessages(true);
                }}
                className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors relative`}
                title="Messages"
              >
                <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowNotifications(true);
                }}
                className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors relative`}
                title="Notifications"
              >
                <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <div className={`flex items-center gap-3 pl-4 border-l ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{provider.username || 'Admin'}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin</div>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {(provider.username || 'A').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} p-8`}>
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              Hello {provider.username || 'there'}! 👋
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Here's what's happening in your Hospital</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Today's Patients */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+2.5%</span>
              </div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{stats.todayPatients}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Today's Patients</div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {stats.patientsDiff !== undefined && stats.patientsDiff !== 0
                  ? `${Math.abs(stats.patientsDiff)} ${stats.patientsDiff > 0 ? 'more' : 'less'} than yesterday`
                  : 'Same as yesterday'}
              </div>
            </div>

            {/* Doctors Available */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Available</span>
              </div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{stats.doctorsAvailable}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Doctors Available</div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {stats.absentDoctors !== undefined ? `${stats.absentDoctors} Doctor${stats.absentDoctors !== 1 ? 's' : ''} Absent today` : 'All doctors present'}
              </div>
            </div>

            {/* Appointments */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+8.2%</span>
              </div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{stats.appointments}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Appointments</div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {stats.appointmentsDiff !== undefined && stats.appointmentsDiff !== 0
                  ? `${Math.abs(stats.appointmentsDiff)} ${stats.appointmentsDiff > 0 ? 'more' : 'less'} than yesterday`
                  : 'Same as yesterday'}
              </div>
            </div>

            {/* Beds & Rooms */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end gap-4 mb-2">
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Beds</div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.bedsRooms.beds}/{stats.bedsRooms.totalBeds || 0}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rooms</div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.bedsRooms.rooms}/{stats.bedsRooms.totalRooms || 0}
                  </div>
                </div>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {stats.bedsRooms.availableBeds || 0} Beds • {stats.bedsRooms.availableRooms || 0} Rooms Available
              </div>
            </div>
          </div>

          {/* Search Patient Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Search Patient by Health ID</h3>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSearch} className="flex gap-3">
                  <input
                    type="text"
                    value={searchHealthId}
                    onChange={(e) => {
                      setSearchHealthId(e.target.value);
                      setError('');
                    }}
                    className="input-field flex-1"
                    placeholder="Enter Health ID (e.g., MTN-ABC12345)"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowNewPatientForm(true)}
                    className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Patient
                  </button>
                </div>
              </div>
            </div>

            {/* My Schedule */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>November 2025</div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Schedule</h3>
                </div>
                <button 
                  onClick={() => setShowNewAppointment(true)}
                  className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Today<br/>
                  {formatDate(currentTime)}
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatTime(currentTime)}</div>

                <div className="space-y-2 mt-4">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.slice(0, 3).map((apt, idx) => {
                      const colors = ['blue', 'green', 'purple'];
                      const color = colors[idx % 3];
                      return (
                        <div key={apt._id} className={`p-3 rounded-lg border-l-4 border-${color}-600 ${darkMode ? `bg-${color}-900/20` : `bg-${color}-50`}`}>
                          <div className={`text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{apt.appointmentTime || 'Not set'}</div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {apt.patientName ? `${apt.patientName.firstName} ${apt.patientName.lastName}` : 'Patient appointment'}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {apt.doctorName ? `Dr. ${apt.doctorName.firstName} ${apt.doctorName.lastName}` : 'Doctor not assigned'}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={`p-3 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                      No appointments scheduled for today
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Overview Chart & Total Expense */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Patient Overview</h3>
                <select className={`px-3 py-1.5 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                  <option>Last 6 Months</option>
                  <option>Last 3 Months</option>
                  <option>Last Month</option>
                </select>
              </div>

              <div className="h-64 flex items-end justify-around gap-2">
                {patientOverview.length > 0 ? patientOverview.map((data) => {
                  const maxValue = Math.max(data.children, data.adult, data.elders, 1);
                  const scale = 100 / maxValue;
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex gap-1 items-end" style={{ height: '200px' }}>
                        <div className="flex-1 bg-purple-400 rounded-t" style={{ height: `${(data.children * scale * 0.8)}%` }}></div>
                        <div className="flex-1 bg-orange-400 rounded-t" style={{ height: `${(data.adult * scale * 0.8)}%` }}></div>
                        <div className="flex-1 bg-blue-600 rounded-t" style={{ height: `${(data.elders * scale * 0.8)}%` }}></div>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{data.month}</div>
                    </div>
                  );
                }) : (
                  ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((month) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex gap-1 items-end" style={{ height: '200px' }}>
                        <div className="flex-1 bg-gray-200 rounded-t" style={{ height: '20%' }}></div>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{month}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Children</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adult</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Elders</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total Expense</h3>
                <select className={`px-3 py-1.5 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                  <option>19/11/2025</option>
                </select>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="188.4 251.2" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="87.92 251.2" strokeDashoffset="-188.4" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeDasharray="37.68 251.2" strokeDashoffset="-276.32" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Earnings</div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>75%</div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Expense</div>
                <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₦{(financialOverview.total || 0).toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Revenue</span>
                  </div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {financialOverview.revenuePercentage || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expense</span>
                  </div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {financialOverview.expensePercentage || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Others</span>
                  </div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(100 - (parseFloat(financialOverview.revenuePercentage) + parseFloat(financialOverview.expensePercentage))).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Doctors Schedule & Department Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Doctors Schedule */}
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Doctors Schedule</h3>
                <select className={`px-3 py-1.5 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                  <option>All</option>
                  <option>On Duty</option>
                  <option>On Leave</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Doctor</th>
                      <th className={`text-left py-3 px-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Department</th>
                      <th className={`text-left py-3 px-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Shift</th>
                      <th className={`text-left py-3 px-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                      <th className={`text-left py-3 px-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Appointments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsSchedule.length > 0 ? doctorsSchedule.slice(0, 4).map((doctor, idx) => {
                      const colors = ['blue', 'purple', 'green', 'orange'];
                      const color = colors[idx % 4];
                      const initials = doctor.name.split(' ').map(n => n[0]).join('').toUpperCase();
                      
                      return (
                        <tr key={doctor._id} className="border-b border-gray-100">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center text-${color}-600 font-semibold text-sm`}>
                                {initials}
                              </div>
                              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.name}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{doctor.specialty}</td>
                          <td className={`py-3 px-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>8:00 am - 5:00 pm</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 ${
                              doctor.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            } text-xs font-medium rounded`}>
                              <span className={`w-1.5 h-1.5 ${
                                doctor.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                              } rounded-full`}></span>
                              {doctor.status === 'Active' ? 'On Duty' : 'Off Duty'}
                            </span>
                          </td>
                          <td className={`py-3 px-2 text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.appointments}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" className={`py-8 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No doctor schedule available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Department Overview */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Department Overview <span className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>(Top 5)</span></h3>
                <select className={`px-3 py-1.5 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                  <option>Last 6 Months</option>
                </select>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="10" strokeDasharray="75.4 251.2" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="62.8 251.2" strokeDashoffset="-75.4" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="50.2 251.2" strokeDashoffset="-138.2" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="37.7 251.2" strokeDashoffset="-188.4" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="10" strokeDasharray="25.1 251.2" strokeDashoffset="-226.1" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>100%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {departmentOverview.length > 0 ? departmentOverview.map((dept, idx) => {
                  const colors = ['blue-600', 'green-500', 'purple-500', 'red-500', 'orange-500'];
                  const color = colors[idx % 5];
                  
                  return (
                    <div key={dept.department} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 bg-${color} rounded-sm`}></div>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{dept.department}</span>
                      </div>
                      <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dept.percentage}%</span>
                    </div>
                  );
                }) : (
                  <div className={`text-center py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No department data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Rates & AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Rates */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Success Rates</h3>
              </div>

              <div className="h-64 flex items-end justify-around gap-4">
                {[
                  { month: 'Jun', surgeries: 150, success: 190 },
                  { month: 'Jul', surgeries: 160, success: 200 },
                  { month: 'Aug', surgeries: 200, success: 240 },
                  { month: 'Sep', surgeries: 220, success: 270 },
                  { month: 'Oct', surgeries: 190, success: 250 },
                  { month: 'Nov', surgeries: 350, success: 400 }
                ].map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1" style={{ height: '220px', justifyContent: 'flex-end' }}>
                      <div className="w-full bg-gray-200 rounded-t" style={{ height: `${(data.surgeries / 400) * 100}%` }}></div>
                      <div className="w-full bg-blue-600 rounded-t" style={{ height: `${(data.success / 400) * 100}%` }}></div>
                    </div>
                    <div className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{data.month}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-gray-200 rounded"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Surgeries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-blue-600 rounded"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Success</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Month</div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nov</div>
                </div>
                <div>
                  <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Surgeries</div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>350</div>
                </div>
                <div>
                  <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success</div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>400</div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
                  <span className="text-lg">✨</span>
                </div>
                <button 
                  onClick={handleGenerateInsights}
                  disabled={generatingInsights}
                  className="text-purple-600 text-sm font-medium hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingInsights ? 'Generating...' : 'Generate Insights'}
                </button>
              </div>

              <div className="space-y-4">
                {aiInsights.length === 0 ? (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm">Click "Generate Insights" to get AI-powered recommendations</p>
                  </div>
                ) : (
                  aiInsights.map((insight, index) => {
                    const colors = getInsightColor(insight.type);
                    return (
                      <div key={index} className={`flex gap-3 p-3 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}>
                        <div className={`flex-shrink-0 w-8 h-8 ${colors.icon} rounded-lg flex items-center justify-center text-white`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-semibold">{insight.title}:</span> {insight.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Patient Modal */}
      {showNewPatientForm && (
        <NewPatientModal
          onClose={() => setShowNewPatientForm(false)}
          onSuccess={(patientData) => {
            setShowNewPatientForm(false);
            // Navigate to patients page instead of specific patient
            navigate('/patients');
          }}
        />
      )}

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointment(false)}
          onSuccess={(newAppointment) => {
            setShowNewAppointment(false);
            // Could navigate to appointments page or show success message
          }}
        />
      )}

      {/* Notifications Panel */}
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      
      {/* Messages Panel */}
      <MessagesPanel isOpen={showMessages} onClose={() => setShowMessages(false)} />
      
      {/* Global Search */}
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
      
      {/* AI Assistant */}
      {showAIAssistant && <AIAssistant onClose={() => setShowAIAssistant(false)} />}
    </div>
  );
};

export default Dashboard;
