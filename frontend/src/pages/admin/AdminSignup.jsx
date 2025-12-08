import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminSignup = () => {
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
      
      const response = await fetch('http://localhost:5000/api/multi-auth/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Registration failed');
        console.error('Registration error:', data);
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black px-8 py-8 text-white text-center border-b border-red-900">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-900 to-red-700 rounded-full mb-3 shadow-lg">
              <i className="fas fa-user-shield text-3xl text-red-200"></i>
            </div>
            <h1 className="text-3xl font-bold mb-2">Administrator Registration</h1>
            <p className="text-gray-400 text-sm">Request access to system administration</p>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-900 bg-opacity-20 border-y border-yellow-700 px-6 py-4">
            <div className="flex items-start">
              <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3 text-lg"></i>
              <div className="text-yellow-200 text-sm">
                <strong className="block mb-1">Restricted Registration</strong>
                Administrator accounts require approval from authorized personnel. Unauthorized access attempts are logged and may result in legal action.
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
                  <i className="fas fa-exclamation-circle text-red-400 mt-0.5 mr-3"></i>
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-user mr-2 text-red-400"></i>
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@example.com"
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 XXX XXX XXXX"
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Role */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-id-badge mr-2 text-red-400"></i>
                  Administrative Role
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Admin Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">Admin Level *</label>
                    <select
                      name="adminLevel"
                      value={formData.adminLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                      <label className="block text-sm font-medium text-gray-300 mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state name"
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                        required
                      />
                    </div>
                  )}

                  {formData.adminLevel === 'Facility' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Facility ID *</label>
                        <input
                          type="text"
                          name="facilityId"
                          value={formData.facilityId}
                          onChange={handleChange}
                          placeholder="FAC-XXXXX"
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Facility Name *</label>
                        <input
                          type="text"
                          name="facilityName"
                          value={formData.facilityName}
                          onChange={handleChange}
                          placeholder="Enter facility name"
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-lock mr-2 text-red-400"></i>
                  Account Security
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Use a strong password with letters, numbers, and special characters
                  </p>
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input type="checkbox" className="mt-1 mr-3 w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-red-500" required />
                  <span className="text-gray-300 text-sm">
                    I understand that this is a restricted system and I agree to comply with all security policies, data protection regulations, and acceptable use guidelines. I acknowledge that all my activities will be monitored and logged.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="text-center text-sm text-gray-400">
                Already have an admin account?{' '}
                <Link to="/admin/login" className="text-red-400 hover:text-red-300 font-semibold">
                  Sign in here
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-black px-8 py-6 border-t border-gray-800">
            <div className="flex justify-center gap-6 mb-4">
              <Link to="/provider/login" className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center">
                <i className="fas fa-user-md mr-1"></i>
                Provider Portal
              </Link>
              <Link to="/patient/login" className="text-green-400 hover:text-green-300 font-medium text-sm flex items-center">
                <i className="fas fa-user mr-1"></i>
                Patient Portal
              </Link>
            </div>
            <p className="text-center text-xs text-gray-500">
              <i className="fas fa-shield-alt mr-1 text-red-500"></i>
              All registration requests are reviewed and approved manually
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
