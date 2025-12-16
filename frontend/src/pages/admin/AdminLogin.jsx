import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import Footer from '../../components/Footer';

const AdminLogin = () => {
  const { theme , darkMode } = useSettings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');

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
      const response = await api.post('/multi-auth/admin/login', {
        email: formData.email,
        password: formData.password
      });

      const data = response.data;

      if (data.require2FA) {
        setRequire2FA(true);
        setTempToken(data.tempToken);
      } else {
        // Store token in localStorage (required by AdminLayout)
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/multi-auth/admin/verify-2fa', 
        { code: formData.twoFactorCode },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );

      const data = response.data;

      // Store token in localStorage (required by AdminLayout)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('userType', data.userType);
      localStorage.setItem('userData', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || '2FA verification failed';
      setError(errorMessage);
      console.error('2FA error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
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
            <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Administrator Portal</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Secure System Access - Enhanced Security Required</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {!require2FA ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
                    <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 mr-3"></i>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                <div className={`bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg flex items-start ${darkMode ? 'bg-yellow-900/20 border-yellow-700' : ''}`}>
                  <i className="fas fa-lock text-yellow-600 mt-0.5 mr-3"></i>
                  <div className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'} text-xs`}>
                    <strong>Security Notice:</strong> This is a restricted access area. All login attempts are logged and monitored.
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <i className={`fas fa-envelope mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your admin email"
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all`}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <i className={`fas fa-lock mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
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
                      className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all`}
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
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className={`mr-2 w-4 h-4 ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} rounded focus:ring-gray-500`} />
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remember this device</span>
                  </label>
                  <Link to="/admin/forgot-password" className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} font-medium`}>
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'} font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Secure Sign In
                    </>
                  )}
                </button>

                <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Need admin access?{' '}
                  <Link to="/admin/signup" className={`${darkMode ? 'text-white hover:text-gray-200' : 'text-gray-900 hover:text-gray-700'} font-semibold`}>
                    Request registration
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
                    <i className="fas fa-exclamation-triangle text-red-500 mt-0.5 mr-3"></i>
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-full mb-4`}>
                    <i className="fas fa-mobile-alt text-3xl"></i>
                  </div>
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Two-Factor Authentication</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Enter the 6-digit code from your authenticator app</p>
                </div>

                <div>
                  <label htmlFor="twoFactorCode" className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 text-center`}>
                    <i className={`fas fa-key mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
                    Authentication Code
                  </label>
                  <input
                    type="text"
                    id="twoFactorCode"
                    name="twoFactorCode"
                    value={formData.twoFactorCode}
                    onChange={handleChange}
                    placeholder="000000"
                    maxLength="6"
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border text-center text-2xl tracking-widest rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'} font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Verify Code
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequire2FA(false);
                    setTempToken('');
                    setFormData({ ...formData, twoFactorCode: '' });
                  }}
                  className={`w-full ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} text-sm font-medium`}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to login
                </button>
              </form>
            )}
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
            <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center justify-center`}>
              <i className={`fas fa-shield-alt mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
              Military-grade encryption • All activities monitored
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLogin;
