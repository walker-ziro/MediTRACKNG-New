import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { api } from '../utils/api';

const ProviderLogin = ({ isEmbedded = false }) => {
  const { theme } = useSettings();
  const darkMode = theme === 'dark';
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
      const response = await api.post('/multi-auth/provider/login', formData);
      const data = response.data;

      // Store token in localStorage (required by ProviderLayout)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('userType', data.userType);
      localStorage.setItem('userData', JSON.stringify(data.user));
      navigate('/provider/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-100'} px-8 py-8 text-center`}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <i className="fas fa-heartbeat text-xl text-white"></i>
          </div>
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Medi<span className="text-blue-600">TRACKNG</span>
          </span>
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Provider Portal</h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Sign in to access patient records and clinical tools</p>
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
              <i className={`fas fa-envelope mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all`}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <i className={`fas fa-lock mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Password
            </label>
            <div className="password-input-wrapper relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all`}
                required
              />
              <button
                type="button"
                className="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className={`mr-2 w-4 h-4 ${darkMode ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'} rounded focus:ring-gray-500`} />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remember me</span>
            </label>
            <Link to="/provider/forgot-password" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} font-medium`}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className={`w-full ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'} font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={loading}
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

          {!isEmbedded && (
            <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              New healthcare provider?{' '}
              <Link to="/provider/signup" className={`${darkMode ? 'text-white hover:text-gray-200' : 'text-gray-900 hover:text-gray-700'} font-semibold`}>Register here</Link>
            </div>
          )}
        </form>

        {!isEmbedded && (
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-8 py-6 border-t`}>
            <div className="flex justify-center gap-6 mb-4">
              <Link to="/patient/login" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} font-medium text-sm flex items-center`}>
                <i className="fas fa-user mr-1"></i>
                Patient Portal
              </Link>
              <Link to="/admin/login" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-gray-900 font-medium text-sm flex items-center`}>
                <i className="fas fa-user-shield mr-1"></i>
                Admin Portal
              </Link>
              <Link to="/" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-gray-900 font-medium text-sm flex items-center`}>
                <i className="fas fa-home mr-1"></i>
                Home
              </Link>
            </div>
            <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center justify-center`}>
              <i className={`fas fa-shield-alt mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Secure connection with end-to-end encryption
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-8`}>
      <div className="w-full max-w-md">
        {content}
      </div>
    </div>
  );
};

export default ProviderLogin;
