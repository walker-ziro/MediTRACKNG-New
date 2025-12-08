import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <div className="landing-header">
          <h1>🏥 MediTRACKNG</h1>
          <p>National Health Records System</p>
          <span className="version-badge">Version 2.0</span>
        </div>

        <div className="portal-grid">
          {/* Provider Portal */}
          <Link to="/provider/login" className="portal-card provider-portal">
            <div className="portal-icon">👨‍⚕️</div>
            <h3>Healthcare Provider</h3>
            <p>Doctors, Nurses, Medical Staff</p>
            <div className="portal-features">
              <span>✓ Patient Records</span>
              <span>✓ Prescriptions</span>
              <span>✓ Lab Orders</span>
            </div>
            <div className="portal-button">
              <span>Enter Portal</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          {/* Patient Portal */}
          <Link to="/patient/login" className="portal-card patient-portal">
            <div className="portal-icon">💚</div>
            <h3>Patient Portal</h3>
            <p>Access Your Health Records</p>
            <div className="portal-features">
              <span>✓ Health Records</span>
              <span>✓ Appointments</span>
              <span>✓ Telemedicine</span>
            </div>
            <div className="portal-button">
              <span>Enter Portal</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link to="/admin/login" className="portal-card admin-portal">
            <div className="portal-icon">🛡️</div>
            <h3>Administrator</h3>
            <p>Health Management System</p>
            <div className="portal-features">
              <span>✓ User Management</span>
              <span>✓ Analytics</span>
              <span>✓ Audit Logs</span>
            </div>
            <div className="portal-button">
              <span>Enter Portal</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>
        </div>

        <div className="landing-footer">
          <div className="features-banner">
            <div className="feature-item">
              <i className="fas fa-shield-alt"></i>
              <span>Secure & Encrypted</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-globe-africa"></i>
              <span>Nationwide Coverage</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-chart-line"></i>
              <span>Real-time Analytics</span>
            </div>
          </div>
          <p className="copyright">
            © 2025 MediTRACKNG. All rights reserved. | Ministry of Health, Nigeria
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
