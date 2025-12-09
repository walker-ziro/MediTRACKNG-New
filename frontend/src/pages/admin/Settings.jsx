import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

const AdminSettings = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
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
          enableTwoFactor, disableTwoFactor } = useSettings();

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
          role: data.role || 'Admin',
          department: data.department || 'Administration',
          adminId: data.adminId || ''
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

  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      if (window.confirm('Are you sure you want to disable Two-Factor Authentication?')) {
        disableTwoFactor();
        alert('Two-Factor Authentication disabled successfully!');
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
      alert('Two-Factor Authentication enabled successfully!');
    } else {
      alert('Invalid code. Please try again.');
    }
  };

  if (!userData) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
        <p className="text-gray-400 mt-2">Manage your administrative account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Profile Information
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'security' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Security & 2FA
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'preferences' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                System Preferences
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <>
              <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin ID</label>
                <input
                  type="text"
                  value={formData.adminId}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-400"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-400"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Security Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">2FA Enabled</span>
                <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm font-medium">
                  {userData.twoFactorEnabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Last Login</span>
                <span className="text-gray-400">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Account Status</span>
                <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm font-medium">
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

              <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 mt-6">
                <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                <p className="text-gray-400 mb-4">Administrative actions with serious consequences</p>
                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Revoke Admin Access
                </button>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Security & Two-Factor Authentication</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Change Password</label>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Update Password
                  </button>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {twoFactorEnabled && (
                        <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Enabled
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
                        {twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="font-medium text-white mb-3">Session Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-300">Active Sessions</span>
                      <span className="text-gray-400">1 device</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-300">Last Login</span>
                      <span className="text-gray-400">{new Date().toLocaleString()}</span>
                    </div>
                    <button className="mt-3 px-4 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900/70">
                      Terminate All Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">System Preferences</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> Changes to these settings are applied immediately and saved automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select 
                    value={theme}
                    onChange={(e) => {
                      updateTheme(e.target.value);
                      alert(`Theme changed to ${e.target.value}`);
                    }}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                  <p className="mt-2 text-sm text-green-400">✓ Current theme: {theme} (Applied immediately)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => {
                      updateLanguage(e.target.value);
                      alert(`Language changed to ${e.target.value}`);
                    }}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                  <p className="mt-2 text-sm text-green-400">✓ Current language: {language}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select 
                    value={timezone}
                    onChange={(e) => {
                      updateTimezone(e.target.value);
                      alert(`Timezone changed to ${e.target.value}`);
                    }}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                  <p className="mt-2 text-sm text-green-400">✓ Current timezone: {timezone}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
                  <select 
                    value={dateFormat}
                    onChange={(e) => {
                      updateDateFormat(e.target.value);
                      alert(`Date format changed to ${e.target.value}`);
                    }}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                  <p className="mt-2 text-sm text-green-400">✓ Current format: {dateFormat}</p>
                  <p className="mt-1 text-xs text-gray-500">Example: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication Setup Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-w-md w-full m-4">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Enable Two-Factor Authentication</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                <h3 className="font-medium text-blue-300 mb-2">Setup Instructions</h3>
                <ol className="text-sm text-blue-200 space-y-2 list-decimal list-inside">
                  <li>Save this backup code in a secure location</li>
                  <li>You'll need it to log in along with your password</li>
                  <li>Enter the code below to verify and enable 2FA</li>
                </ol>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-sm text-gray-400 mb-2">Your backup code:</p>
                <p className="text-3xl font-mono font-bold text-white tracking-wider">{generatedCode}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    alert('Code copied to clipboard!');
                  }}
                  className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                >
                  📋 Copy to clipboard
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter the code to verify
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-wider"
                  placeholder="000000"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowTwoFactorModal(false);
                    setVerificationCode('');
                  }}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
