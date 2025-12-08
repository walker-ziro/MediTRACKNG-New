import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
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
      const response = await fetch('http://localhost:5000/api/multi-auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.require2FA) {
          setRequire2FA(true);
          setTempToken(data.tempToken);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userType', data.userType);
          localStorage.setItem('userData', JSON.stringify(data.user));
          navigate('/admin/dashboard');
        }
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

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/multi-auth/admin/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code: formData.twoFactorCode })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || '2FA verification failed');
      }
    } catch (err) {
      setError('Unable to verify code. Please try again.');
      console.error('2FA error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black px-8 py-10 text-white text-center border-b border-red-900">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-900 to-red-700 rounded-full mb-4 shadow-lg">
              <i className="fas fa-shield-alt text-4xl text-red-200"></i>
            </div>
            <h1 className="text-3xl font-bold mb-2">Administrator Portal</h1>
            <p className="text-gray-400 text-sm">Secure System Access - Enhanced Security Required</p>
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

                <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 px-4 py-3 rounded-lg flex items-start">
                  <i className="fas fa-lock text-yellow-500 mt-0.5 mr-3"></i>
                  <div className="text-yellow-200 text-xs">
                    <strong>Security Notice:</strong> This is a restricted access area. All login attempts are logged and monitored.
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                    <i className="fas fa-envelope mr-2 text-red-400"></i>
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your admin email"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                    <i className="fas fa-lock mr-2 text-red-400"></i>
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
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
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
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2 w-4 h-4 bg-gray-900 border-gray-600 rounded focus:ring-red-500" />
                    <span className="text-gray-400">Remember this device</span>
                  </label>
                  <Link to="/admin/forgot-password" className="text-red-400 hover:text-red-300 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="text-center text-sm text-gray-400">
                  Need admin access?{' '}
                  <Link to="/admin/signup" className="text-red-400 hover:text-red-300 font-semibold">
                    Request registration
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-5">
                {error && (
                  <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
                    <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 mr-3"></i>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full mb-4">
                    <i className="fas fa-mobile-alt text-3xl text-blue-200"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-semibold text-gray-300 mb-2 text-center">
                    <i className="fas fa-key mr-2 text-blue-400"></i>
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
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-center text-2xl tracking-widest rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full text-gray-400 hover:text-gray-300 text-sm font-medium"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to login
                </button>
              </form>
            )}
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
            <p className="text-center text-xs text-gray-500 flex items-center justify-center">
              <i className="fas fa-shield-alt mr-2 text-red-500"></i>
              Military-grade encryption • All activities monitored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
