import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './PatientLogin.css';

const PatientLogin = () => {
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
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));

        // Navigate to patient dashboard
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
    <div className="patient-login-container">
      <div className="patient-login-card">
        <div className="patient-login-header">
          <div className="patient-logo">
            <i className="fas fa-heartbeat"></i>
          </div>
          <h1>Patient Portal</h1>
          <p>Access your health records anytime, anywhere</p>
        </div>

        <form onSubmit={handleSubmit} className="patient-login-form">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/patient/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="patient-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </>
            )}
          </button>

          <div className="signup-prompt">
            Don't have an account?{' '}
            <Link to="/patient/signup">Register now</Link>
          </div>

          <div className="quick-access">
            <h4>Quick Access</h4>
            <div className="quick-links">
              <Link to="/patient/biometric-login" className="quick-link">
                <i className="fas fa-fingerprint"></i>
                <span>Biometric Login</span>
              </Link>
              <Link to="/patient/emergency" className="quick-link emergency">
                <i className="fas fa-ambulance"></i>
                <span>Emergency Access</span>
              </Link>
            </div>
          </div>
        </form>

        <div className="patient-login-footer">
          <div className="portal-links">
            <Link to="/provider/login">
              <i className="fas fa-user-md"></i>
              Healthcare Provider
            </Link>
            <Link to="/admin/login">
              <i className="fas fa-user-shield"></i>
              Administrator
            </Link>
          </div>
          <p className="security-note">
            <i className="fas fa-shield-alt"></i>
            Your health data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
