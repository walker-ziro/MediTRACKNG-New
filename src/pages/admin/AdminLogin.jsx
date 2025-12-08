import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminLogin.css';

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
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.require2FA) {
          // Show 2FA input
          setRequire2FA(true);
          setTempToken(data.tempToken);
        } else {
          // Store token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userType', data.userType);
          localStorage.setItem('userData', JSON.stringify(data.user));

          // Navigate to admin dashboard
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
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));

        // Navigate to admin dashboard
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
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1>Health Management System</h1>
          <p>Administrator Portal - Secure Access</p>
        </div>

        {!require2FA ? (
          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="security-badge">
              <i className="fas fa-lock"></i>
              <span>Enhanced Security Required</span>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Administrator Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your admin email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Continue to 2FA
                </>
              )}
            </button>

            <div className="security-warning">
              <i className="fas fa-info-circle"></i>
              All administrator actions are logged and monitored
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="admin-login-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="two-fa-prompt">
              <i className="fas fa-mobile-alt"></i>
              <h3>Two-Factor Authentication</h3>
              <p>Enter the 6-digit code from your authenticator app</p>
            </div>

            <div className="form-group">
              <label htmlFor="twoFactorCode">
                <i className="fas fa-key"></i>
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
                pattern="[0-9]{6}"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading || formData.twoFactorCode.length !== 6}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  Verify & Sign In
                </>
              )}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => {
                setRequire2FA(false);
                setFormData({ ...formData, twoFactorCode: '' });
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Back to login
            </button>
          </form>
        )}

        <div className="admin-login-footer">
          <div className="portal-links">
            <Link to="/provider/login">
              <i className="fas fa-user-md"></i>
              Healthcare Provider
            </Link>
            <Link to="/patient/login">
              <i className="fas fa-user"></i>
              Patient Portal
            </Link>
          </div>
          <p className="security-note">
            <i className="fas fa-shield-alt"></i>
            End-to-end encrypted connection • Activity monitored
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
