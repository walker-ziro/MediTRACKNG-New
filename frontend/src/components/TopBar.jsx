import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useApp } from '../context/AppContext';
import NotificationsPanel from './NotificationsPanel';
import MessagesPanel from './MessagesPanel';
import GlobalSearch from './GlobalSearch';
import AIAssistant from './AIAssistant';

const TopBar = ({ title, subtitle }) => {
  const { unreadNotificationsCount, unreadMessagesCount } = useApp();
  const { theme, updateTheme, timezone } = useSettings();
  const darkMode = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const provider = JSON.parse(localStorage.getItem('provider') || '{}');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  return (
    <>
      {/* Top Bar */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-2 md:px-8 md:py-4`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center flex-1 max-w-2xl">
            {/* Desktop Search */}
            <div className="relative w-full hidden md:block">
              <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {/* Mobile Search Icon */}
            <button 
              onClick={() => setShowGlobalSearch(true)}
              className={`md:hidden p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            
            <div className={`hidden md:flex items-center px-4 py-2 rounded-lg mr-4 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                {currentTime.toLocaleTimeString('en-US', { 
                  timeZone: timezone,
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>

            <button 
              onClick={() => setShowAIAssistant(true)}
              className="px-3 py-2 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span className="hidden md:inline">AI Assistant</span>
              <span className="text-lg">✨</span>
            </button>

            <button 
              type="button"
              
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateTheme(darkMode ? 'light' : 'dark');
              }}

              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Healthcare Provider</div>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(provider.username || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Panels */}
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <MessagesPanel isOpen={showMessages} onClose={() => setShowMessages(false)} />
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
      {showAIAssistant && <AIAssistant onClose={() => setShowAIAssistant(false)} />}
    </>
  );
};

export default TopBar;
