import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState('setup'); // 'setup' or 'verify'
  const [generatedCode, setGeneratedCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const { 
    theme, 
    language, 
    timezone, 
    dateFormat, 
    twoFactorEnabled,
    sessionTimeout,
    updateTheme, 
    updateLanguage, 
    updateTimezone, 
    updateDateFormat,
    updateSessionTimeout,
    enableTwoFactor,
    disableTwoFactor
  } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    facilityId: '',
    providerId: ''
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    patientUpdates: true,
    systemAlerts: true,
    marketingEmails: false
  });
  const [appointmentDuration, setAppointmentDuration] = useState('30');

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString && userDataString !== 'undefined') {
      try {
        const data = JSON.parse(userDataString);
        setUserData(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          specialization: data.specialization || 'General Practice',
          licenseNumber: data.licenseNumber || '',
          facilityId: data.facilityId || '',
          providerId: data.providerId || ''
        });
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = { ...userData, ...formData };
    localStorage.setItem('userData', JSON.stringify(updatedData));
    setUserData(updatedData);
    alert('Profile updated successfully!');
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (securityData.newPassword) {
      // Update password logic here
      const updatedUserData = { ...userData, password: securityData.newPassword };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      alert('Password updated successfully!');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      if (window.confirm('Are you sure you want to disable Two-Factor Authentication?')) {
        disableTwoFactor();
        alert('Two-Factor Authentication disabled');
      }
    } else {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setTwoFactorStep('setup');
      setShowTwoFactorModal(true);
    }
  };

  const handleVerifyTwoFactor = () => {
    if (verificationCode === generatedCode) {
      enableTwoFactor(generatedCode);
      setShowTwoFactorModal(false);
      setVerificationCode('');
      alert('Two-Factor Authentication enabled successfully!');
    } else {
      alert('Invalid code. Please try again.');
    }
  };

  const handleNotificationChange = (setting) => {
    const updated = { ...notificationSettings, [setting]: !notificationSettings[setting] };
    setNotificationSettings(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    alert('Preferences saved successfully! Changes applied.');
  };

  if (!userData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Profile Information
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Security
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Notifications
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Preferences
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider ID</label>
                <input
                  type="text"
                  value={formData.providerId}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <select 
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>General Practice</option>
                  <option>Cardiology</option>
                  <option>Pediatrics</option>
                  <option>Orthopedics</option>
                  <option>Neurology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MED-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facility ID</label>
                <input
                  type="text"
                  name="facilityId"
                  value={formData.facilityId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="FAC-12345"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Save Changes
                </button>
              </div>
            </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                <form onSubmit={handleSecuritySubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      {twoFactorEnabled && (
                        <span className="inline-flex items-center mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Enabled
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleTwoFactorToggle}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        twoFactorEnabled 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => updateSessionTimeout(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                    <p className="mt-2 text-sm text-green-600">✓ Session timeout updated</p>
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Update Security Settings
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                  { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Get reminders for upcoming appointments' },
                  { key: 'patientUpdates', label: 'Patient Updates', desc: 'Notifications when patients update their info' },
                  { key: 'systemAlerts', label: 'System Alerts', desc: 'Important system notifications' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive updates about new features' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key]}
                        onChange={() => handleNotificationChange(item.key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Preferences</h2>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      updateLanguage(e.target.value);
                      setTimeout(() => window.location.reload(), 100);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>English</option>
                    <option>Hausa</option>
                    <option>Yoruba</option>
                    <option>Igbo</option>
                  </select>
                  <p className="mt-2 text-sm text-green-600">✓ Current language: {language}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => {
                      updateTimezone(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Africa/Lagos">West Africa Time (WAT)</option>
                    <option value="Africa/Cairo">East Africa Time (EAT)</option>
                    <option value="Europe/London">GMT</option>
                    <option value="America/New_York">EST</option>
                  </select>
                  <p className="mt-2 text-sm text-green-600">✓ Current timezone: {timezone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => {
                      updateDateFormat(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                  <p className="mt-2 text-sm text-green-600">✓ Current format: {dateFormat} (Example: {new Date().toLocaleDateString()})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      updateTheme(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="Auto">Auto</option>
                  </select>
                  <p className="mt-2 text-sm text-green-600">✓ Current theme: {theme}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Appointment Duration</label>
                  <select
                    value={appointmentDuration}
                    onChange={(e) => {
                      setAppointmentDuration(e.target.value);
                      localStorage.setItem('appointmentDuration', e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-600">Duration for new appointments</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Settings Applied</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Theme changes apply immediately</li>
                      <li>• Date format updates across all dates</li>
                      <li>• Timezone affects time displays</li>
                      <li>• Language preference saved</li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication Setup Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full m-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Enable Two-Factor Authentication</h2>
            </div>
            <div className="p-6 space-y-4">
              {twoFactorStep === 'setup' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Setup Instructions</h3>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                      <li>Save this backup code in a secure location</li>
                      <li>You'll need it to log in along with your password</li>
                      <li>Enter the code below to verify and enable 2FA</li>
                    </ol>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Your backup code:</p>
                    <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{generatedCode}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        alert('Code copied to clipboard!');
                      }}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                    >
                      📋 Copy to clipboard
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter the code to verify
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-wider"
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowTwoFactorModal(false);
                        setVerificationCode('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyTwoFactor}
                      disabled={verificationCode.length !== 6}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Enable
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
