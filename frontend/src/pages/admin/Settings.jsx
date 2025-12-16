import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';

const AdminSettings = () => {
  const { fetchData, updateData } = useApi();
  const { showNotification } = useNotification();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    adminId: ''
  });
  
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const { theme, language, timezone, dateFormat, twoFactorEnabled,
          updateTheme, updateLanguage, updateTimezone, updateDateFormat,
          enableTwoFactor, disableTwoFactor, t , darkMode } = useSettings();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Try to fetch from API first
        const data = await fetchData('/multi-auth/profile');
        if (data) {
          setUserData(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'Admin',
            department: data.department || 'Administration',
            adminId: data.adminId || ''
          });
        } else {
          // Fallback to local storage if API fails or returns nothing (e.g. offline)
          const userDataString = localStorage.getItem('userData');
          if (userDataString && userDataString !== 'undefined') {
            const data = JSON.parse(userDataString);
            setUserData(data);
            setFormData({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              phone: data.phone || '',
              role: data.role || 'Admin',
              department: data.department || 'Administration',
              adminId: data.adminId || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update via API
      const updatedProfile = await updateData('/multi-auth/profile', formData);
      
      if (updatedProfile) {
        const updatedData = { ...userData, ...updatedProfile };
        localStorage.setItem('userData', JSON.stringify(updatedData));
        setUserData(updatedData);
        showNotification(t('profileUpdated') || 'Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    }
  };

  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      if (window.confirm(t('confirmDisable2FA') || 'Are you sure you want to disable Two-Factor Authentication?')) {
        disableTwoFactor();
        showNotification(t('twoFactorDisabled') || 'Two-Factor Authentication disabled successfully!', 'info');
      }
    } else {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setShowTwoFactorModal(true);
    }
  };

  const handleVerifyTwoFactor = () => {
    if (verificationCode === generatedCode) {
      enableTwoFactor(generatedCode);
      setShowTwoFactorModal(false);
      setVerificationCode('');
      showNotification(t('twoFactorEnabledMsg') || 'Two-Factor Authentication enabled successfully!', 'success');
    } else {
      showNotification(t('invalidCode') || 'Invalid code. Please try again.', 'error');
    }
  };

  if (!userData) {
    return (
      <div className={`p-8 min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('settings') || 'Settings'}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageAccount') || 'Manage your account and preferences'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className={`rounded-xl shadow-sm border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${activeTab === 'profile' ? (darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')}`}
              >
                {t('profileInformation') || 'Profile Information'}
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'security' ? (darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')}`}
              >
                {t('security') || 'Security'}
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'preferences' ? (darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')}`}
              >
                {t('preferences') || 'Preferences'}
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <>
              <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('profileInformation') || 'Profile Information'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('adminId') || 'Admin ID'}</label>
                <input
                  type="text"
                  value={formData.adminId}
                  className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('firstName') || 'First Name'}</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('lastName') || 'Last Name'}</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('email') || 'Email'}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('phone') || 'Phone Number'}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13)}
                  maxLength={13}
                  pattern="[0-9]*"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('role') || 'Role'}</label>
                <input
                  type="text"
                  value={formData.role}
                  className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  disabled
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('department') || 'Department'}</label>
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                >
                  <option value="Administration">Administration</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>

              <div className="pt-4">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  {t('saveChanges') || 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 mt-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('accountStatus') || 'Account Status'}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('twoFactorEnabled') || '2FA Enabled'}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                  {userData.twoFactorEnabled ? (t('yes') || 'Yes') : (t('no') || 'No')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('lastLogin') || 'Last Login'}</span>
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('accountStatus') || 'Account Status'}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                  {userData.isActive ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                </span>
              </div>
            </div>
          </div>

              <div className={`border rounded-xl p-6 mt-6 ${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{t('dangerZone') || 'Danger Zone'}</h2>
                <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('dangerZoneDesc') || 'Administrative actions with serious consequences'}</p>
                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  {t('revokeAdminAccess') || 'Revoke Admin Access'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('securitySettings') || 'Security Settings'}</h2>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('changePassword') || 'Change Password'}</label>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder={t('currentPassword') || "Current Password"}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                    />
                    <input
                      type="password"
                      placeholder={t('newPassword') || "New Password"}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                    />
                    <input
                      type="password"
                      placeholder={t('confirmPassword') || "Confirm New Password"}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                    />
                  </div>
                  <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {t('updatePassword') || 'Update Password'}
                  </button>
                </div>

                <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('twoFactorAuth') || 'Two-Factor Authentication'}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('twoFactorDesc') || 'Add an extra layer of security to your account'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {twoFactorEnabled && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('enabled') || 'Enabled'}
                        </span>
                      )}
                      <button
                        onClick={handleTwoFactorToggle}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          twoFactorEnabled 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {twoFactorEnabled ? (t('disable') || 'Disable') : (t('enable') || 'Enable')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('sessionManagement') || 'Session Management'}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('activeSessions') || 'Active Sessions'}</span>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>1 {t('device') || 'device'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('lastLogin') || 'Last Login'}</span>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date().toLocaleString()}</span>
                    </div>
                    <button className={`mt-3 px-4 py-2 rounded-lg ${darkMode ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                      {t('terminateAllSessions') || 'Terminate All Sessions'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('preferences') || 'Preferences'}</h2>
              
              <div className="space-y-6">

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('theme') || 'Theme'}</label>
                  <select 
                    value={theme}
                    onChange={(e) => {
                      updateTheme(e.target.value);
                      showNotification(t('themeChanged') || `Theme changed to ${e.target.value}`, 'info');
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                  >
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="Auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('language') || 'Language'}</label>
                  <select 
                    value={language}
                    onChange={(e) => {
                      updateLanguage(e.target.value);
                      showNotification(t('languageChanged') || `Language changed to ${e.target.value}`, 'info');
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                  >
                    <option value="English">English</option>
                    <option value="Hausa">Hausa</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Igbo">Igbo</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('timezone') || 'Timezone'}</label>
                  <select 
                    value={timezone}
                    onChange={(e) => {
                      updateTimezone(e.target.value);
                      showNotification(t('timezoneChanged') || `Timezone changed to ${e.target.value}`, 'info');
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('dateFormat') || 'Date Format'}</label>
                  <select 
                    value={dateFormat}
                    onChange={(e) => {
                      updateDateFormat(e.target.value);
                      showNotification(t('dateFormatChanged') || `Date format changed to ${e.target.value}`, 'info');
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication Setup Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-xl max-w-md w-full m-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('enableTwoFactor') || 'Enable Two-Factor Authentication'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <h3 className={`font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>{t('setupInstructions') || 'Setup Instructions'}</h3>
                <ol className={`text-sm space-y-2 list-decimal list-inside ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <li>{t('saveBackupCode') || 'Save this backup code in a secure location'}</li>
                  <li>{t('needItToLogin') || "You'll need it to log in along with your password"}</li>
                  <li>{t('enterCodeToVerify') || 'Enter the code below to verify and enable 2FA'}</li>
                </ol>
              </div>
              <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('yourBackupCode') || 'Your backup code:'}</p>
                <p className={`text-3xl font-mono font-bold tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>{generatedCode}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    showNotification(t('codeCopied') || 'Code copied to clipboard!', 'success');
                  }}
                  className={`mt-3 text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  📋 {t('copyToClipboard') || 'Copy to clipboard'}
                </button>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('enterCodeToVerify') || 'Enter the code to verify'}
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-wider ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="000000"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowTwoFactorModal(false);
                    setVerificationCode('');
                  }}
                  className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleVerifyTwoFactor}
                  disabled={verificationCode.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('verifyAndEnable') || 'Verify & Enable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
