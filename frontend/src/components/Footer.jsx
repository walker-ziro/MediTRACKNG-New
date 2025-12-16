import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { theme } = useSettings();
  const darkMode = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <footer className={`py-8 px-6 border-t mt-auto ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-heartbeat text-sm text-white"></i>
          </div>
          <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Medi<span className="text-blue-600">TRACKNG</span>
          </span>
        </div>
        
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          © 2025 MediTRACKNG. Ministry of Health, Nigeria.
        </p>
        
        <div className="flex gap-6 flex-wrap justify-center">
          <Link to="/admin/login" className={`text-sm font-medium hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Admin Portal
          </Link>
          <a href="#" className={`text-sm font-medium hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Privacy Policy
          </a>
          <a href="#" className={`text-sm font-medium hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
