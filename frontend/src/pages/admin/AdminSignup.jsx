import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';

const AdminSignup = () => {
  const { theme , darkMode } = useSettings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    adminLevel: '',
    state: '',
    facilityId: '',
    facilityName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (formData.adminLevel === 'State' && !formData.state) {
      setError('State is required for State-level administrators');
      setLoading(false);
      return;
    }

    if (formData.adminLevel === 'Facility' && (!formData.facilityId || !formData.facilityName)) {
      setError('Facility ID and Name are required for Facility-level administrators');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await api.post('/multi-auth/admin/register', dataToSend);

      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', data.userType);
      localStorage.setItem('userData', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-8`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl overflow-hidden border`}>
          {/* Header */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} px-8 py-8 text-center border-b`}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <i className="fas fa-heartbeat text-xl text-white"></i>
              </div>
              <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Medi<span className="text-blue-600">TRACKNG</span>
              </span>
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Administrator Registration</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Request access to system administration</p>
          </div>

          {/* Warning Banner */}
          <div className={`bg-yellow-50 border-y border-yellow-200 px-6 py-4 ${darkMode ? 'bg-yellow-900/20 border-yellow-700' : ''}`}>
            <div className="flex items-start">
              <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3 text-lg"></i>
              <div className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'} text-sm`}>
                <strong className="block mb-1">Restricted Registration</strong>
                Administrator accounts require approval from authorized personnel. Unauthorized access attempts are logged and may result in legal action.
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
                  <i className="fas fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                  <i className={`fas fa-user mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@example.com"
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13)}
                      maxLength={13}
                      pattern="[0-9]*"
                      placeholder="08012345678"
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Role */}
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                  <i className={`fas fa-id-badge mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
                  Administrative Role
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Admin Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                      required
                    >
                      <option value="">Select role</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="System Admin">System Admin</option>
                      <option value="Data Admin">Data Admin</option>
                      <option value="Security Admin">Security Admin</option>
                      <option value="Facility Admin">Facility Admin</option>
                      <option value="Support Admin">Support Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Admin Level *</label>
                    <select
                      name="adminLevel"
                      value={formData.adminLevel}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                      required
                    >
                      <option value="">Select level</option>
                      <option value="National">National</option>
                      <option value="State">State</option>
                      <option value="Facility">Facility</option>
                    </select>
                  </div>

                  {formData.adminLevel === 'State' && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state name"
                        className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                        required
                      />
                    </div>
                  )}

                  {formData.adminLevel === 'Facility' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Facility ID *</label>
                        <input
                          type="text"
                          name="facilityId"
                          value={formData.facilityId}
                          onChange={handleChange}
                          placeholder="FAC-XXXXX"
                          className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Facility Name *</label>
                        <input
                          type="text"
                          name="facilityName"
                          value={formData.facilityName}
                          onChange={handleChange}
                          placeholder="Enter facility name"
                          className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                  <i className={`fas fa-lock mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
                  Account Security
                </h3>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    <i className="fas fa-info-circle mr-1"></i>
                    Use a strong password with letters, numbers, and special characters
                  </p>
                </div>
              </div>

              {/* Agreement */}
              <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <label className="flex items-start cursor-pointer">
                  <input type="checkbox" className={`mt-1 mr-3 w-4 h-4 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded focus:ring-gray-500`} required />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                    I understand that this is a restricted system and I agree to comply with all security policies, data protection regulations, and acceptable use guidelines. I acknowledge that all my activities will be monitored and logged.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'} font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Registration Request
                  </>
                )}
              </button>

              <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Already have an admin account?{' '}
                <Link to="/admin/login" className={`${darkMode ? 'text-white hover:text-gray-200' : 'text-gray-900 hover:text-gray-700'} font-semibold`}>
                  Sign in here
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} px-8 py-6 border-t`}>
            <div className="flex justify-center gap-6 mb-4">
              <Link to="/provider/login" className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} font-medium text-sm flex items-center`}>
                <i className="fas fa-user-md mr-1"></i>
                Provider Portal
              </Link>
              <Link to="/patient/login" className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} font-medium text-sm flex items-center`}>
                <i className="fas fa-user mr-1"></i>
                Patient Portal
              </Link>
            </div>
            <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <i className={`fas fa-shield-alt mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
              All registration requests are reviewed and approved manually
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
