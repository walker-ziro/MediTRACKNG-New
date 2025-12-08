import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Provider Portal
import ProviderLogin from './pages/provider/ProviderLogin';

// Patient Portal  
import PatientLogin from './pages/patient/PatientLogin';

// Admin Portal
import AdminLogin from './pages/admin/AdminLogin';

// Landing Page
const LandingPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '60px 40px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '42px',
          margin: '0 0 20px 0',
          color: '#333',
          fontWeight: 'bold'
        }}>
          🏥 MediTRACKNG
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '40px'
        }}>
          National Health Records System
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '40px'
        }}>
          {/* Provider Portal */}
          <a href="/provider/login" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍⚕️</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', fontWeight: '600' }}>
              Healthcare Provider
            </h3>
            <p style={{ fontSize: '14px', margin: '0', opacity: 0.9 }}>
              Doctors, Nurses, Medical Staff
            </p>
          </a>

          {/* Patient Portal */}
          <a href="/patient/login" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(17, 153, 142, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💚</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', fontWeight: '600' }}>
              Patient Portal
            </h3>
            <p style={{ fontSize: '14px', margin: '0', opacity: 0.9 }}>
              Access Your Health Records
            </p>
          </a>

          {/* Admin Portal */}
          <a href="/admin/login" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px',
            background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', fontWeight: '600' }}>
              Administrator
            </h3>
            <p style={{ fontSize: '14px', margin: '0', opacity: 0.9 }}>
              Health Management System
            </p>
          </a>
        </div>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0'
          }}>
            <strong>🔒 Secure • 🌍 Nationwide • 📊 Comprehensive</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Provider Portal Routes */}
        <Route path="/provider/login" element={<ProviderLogin />} />

        {/* Patient Portal Routes */}
        <Route path="/patient/login" element={<PatientLogin />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Redirect unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
