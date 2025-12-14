import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';

// Import Auth Components
import PatientLogin from '../pages/patient/PatientLogin';
import PatientSignup from '../pages/patient/PatientSignup';
import ProviderLogin from '../pages/ProviderLogin';
import ProviderSignup from '../pages/provider/ProviderSignup';

const Login = () => {
  const { theme } = useSettings();
  const darkMode = theme === 'dark';
  
  // State for toggles
  const [userType, setUserType] = useState('patient'); // 'patient' or 'provider'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const toggleUserType = (type) => {
    setUserType(type);
  };

  const toggleAuthMode = (mode) => {
    setAuthMode(mode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      
      {/* Main Container */}
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo & Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <i className="fas fa-heartbeat text-2xl text-white"></i>
            </div>
            <span className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Medi<span className="text-blue-600">TRACKNG</span>
            </span>
          </div>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Unified Healthcare Access
          </p>
        </div>

        {/* User Type Toggle */}
        <div className={`flex p-1 space-x-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => toggleUserType('patient')}
            className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
              userType === 'patient'
                ? `${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'} shadow-md`
                : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-700`
            }`}
          >
            <i className="fas fa-user mr-2"></i>
            Patient
          </button>
          <button
            onClick={() => toggleUserType('provider')}
            className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
              userType === 'provider'
                ? `${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'} shadow-md`
                : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-700`
            }`}
          >
            <i className="fas fa-user-md mr-2"></i>
            Provider
          </button>
        </div>

        {/* Auth Mode Toggle (Login/Signup) */}
        <div className="flex justify-center space-x-6 border-b border-gray-200 dark:border-gray-700 pb-1">
          <button
            onClick={() => toggleAuthMode('login')}
            className={`pb-2 text-sm font-medium transition-colors duration-200 relative ${
              authMode === 'login'
                ? `${darkMode ? 'text-white' : 'text-gray-900'}`
                : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Sign In
            {authMode === 'login' && (
              <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${darkMode ? 'bg-white' : 'bg-gray-900'}`}></div>
            )}
          </button>
          <button
            onClick={() => toggleAuthMode('signup')}
            className={`pb-2 text-sm font-medium transition-colors duration-200 relative ${
              authMode === 'signup'
                ? `${darkMode ? 'text-white' : 'text-gray-900'}`
                : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Create Account
            {authMode === 'signup' && (
              <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${darkMode ? 'bg-white' : 'bg-gray-900'}`}></div>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-300 ease-in-out">
          {userType === 'patient' ? (
            authMode === 'login' ? (
              <PatientLogin isEmbedded={true} />
            ) : (
              <PatientSignup isEmbedded={true} />
            )
          ) : (
            authMode === 'login' ? (
              <ProviderLogin isEmbedded={true} />
            ) : (
              <ProviderSignup isEmbedded={true} />
            )
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <Link to="/admin/login" className={`text-xs font-medium ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
            <i className="fas fa-shield-alt mr-1"></i>
            Admin Access
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
