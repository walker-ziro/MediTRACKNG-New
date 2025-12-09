import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';

const PatientLogin = () => {
  const { theme } = useSettings();
  const darkMode = theme.toLowerCase() === 'dark';
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/multi-auth/patient/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/patient/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-white text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full mb-4 shadow-lg`}>
              <i className="fas fa-heartbeat text-4xl text-green-500"></i>
            </div>
            <h1 className="text-3xl font-bold mb-2">Patient Portal</h1>
            <p className="text-green-100 text-sm">Access your health records anytime, anywhere</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
                  <i className="fas fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  <i className="fas fa-envelope mr-2 text-green-500"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  <i className="fas fa-lock mr-2 text-green-500"></i>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-gray-700`}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className={`mr-2 w-4 h-4 text-green-500 ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded focus:ring-green-500`} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remember me</span>
                </label>
                <Link to="/patient/forgot-password" className="text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Alternative Login */}
            <div className="mt-6 space-y-3">
              <Link
                to="/patient/biometric-login"
                className="block w-full text-center px-4 py-3 border-2 border-green-500 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-all"
              >
                <i className="fas fa-fingerprint mr-2"></i>
                Use Biometric Login
              </Link>
              <Link
                to="/patient/emergency-access"
                className="block w-full text-center px-4 py-3 border-2 border-orange-500 text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all"
              >
                <i className="fas fa-ambulance mr-2"></i>
                Emergency Access
              </Link>
            </div>

            <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/patient/signup" className="text-green-600 hover:text-green-700 font-semibold">
                Register here
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-8 py-6 border-t`}>
            <div className="flex justify-center gap-6 mb-4">
              <Link to="/provider/login" className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center">
                <i className="fas fa-user-md mr-1"></i>
                Provider Portal
              </Link>
              <Link to="/admin/login" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-gray-900 font-medium text-sm flex items-center`}>
                <i className="fas fa-user-shield mr-1"></i>
                Admin Portal
              </Link>
            </div>
            <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center justify-center`}>
              <i className="fas fa-shield-alt mr-2 text-green-500"></i>
              Secure connection with end-to-end encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
