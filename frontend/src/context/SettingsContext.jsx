import { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../translations';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [darkMode, setDarkMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTheme(settings.theme || 'light');
        setLanguage(settings.language || 'English');
        setTimezone(settings.timezone || 'Africa/Lagos');
        setDateFormat(settings.dateFormat || 'DD/MM/YYYY');
        setTwoFactorEnabled(settings.twoFactorEnabled || false);
        setSessionTimeout(settings.sessionTimeout || '30');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeValue = theme.toLowerCase();
    
    const applyTheme = (isDark) => {
      setDarkMode(isDark);
      if (isDark) {
        root.classList.add('dark');
        body.style.backgroundColor = '#111827'; // bg-gray-900
        body.style.color = '#f9fafb';
      } else {
        root.classList.remove('dark');
        body.style.backgroundColor = '#ffffff'; // white
        body.style.color = '#111827';
      }
    };

    if (themeValue === 'dark') {
      applyTheme(true);
    } else if (themeValue === 'light') {
      applyTheme(false);
    } else if (themeValue === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handleChange = (e) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Save settings to localStorage whenever they change
  const saveSettings = () => {
    const settings = {
      theme,
      language,
      timezone,
      dateFormat,
      twoFactorEnabled,
      sessionTimeout
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    const settings = { theme: newTheme, language, timezone, dateFormat, twoFactorEnabled, sessionTimeout };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    const settings = { theme, language: newLanguage, timezone, dateFormat, twoFactorEnabled, sessionTimeout };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const t = (key) => {
    // Map full language names to language codes
    const langMap = {
      'English': 'en',
      'Hausa': 'ha',
      'Yoruba': 'yo',
      'Igbo': 'ig'
    };
    const langCode = langMap[language] || 'en';
    return getTranslation(langCode, key);
  };

  const updateTimezone = (newTimezone) => {
    setTimezone(newTimezone);
    const settings = { theme, language, timezone: newTimezone, dateFormat, twoFactorEnabled, sessionTimeout };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const updateDateFormat = (newFormat) => {
    setDateFormat(newFormat);
    const settings = { theme, language, timezone, dateFormat: newFormat, twoFactorEnabled, sessionTimeout };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const updateSessionTimeout = (newTimeout) => {
    setSessionTimeout(newTimeout);
    const settings = { theme, language, timezone, dateFormat, twoFactorEnabled, sessionTimeout: newTimeout };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const enableTwoFactor = (code) => {
    setTwoFactorEnabled(true);
    setTwoFactorCode(code);
    const settings = { theme, language, timezone, dateFormat, twoFactorEnabled: true, sessionTimeout };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    localStorage.setItem('twoFactorCode', code);
  };

  const disableTwoFactor = () => {
    setTwoFactorEnabled(false);
    setTwoFactorCode('');
    const settings = { theme, language, timezone, dateFormat, twoFactorEnabled: false, sessionTimeout };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    localStorage.removeItem('twoFactorCode');
  };

  const verifyTwoFactorCode = (code) => {
    const savedCode = localStorage.getItem('twoFactorCode');
    return code === savedCode;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return new Date(date).toLocaleTimeString();
    }
  };

  const value = {
    theme,
    language,
    timezone,
    dateFormat,
    twoFactorEnabled,
    sessionTimeout,
    darkMode,
    updateTheme,
    updateLanguage,
    updateTimezone,
    updateDateFormat,
    updateSessionTimeout,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactorCode,
    formatDate,
    formatTime,
    t
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
