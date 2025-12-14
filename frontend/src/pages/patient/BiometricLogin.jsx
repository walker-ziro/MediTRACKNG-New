import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { startAuthentication } from '@simplewebauthn/browser';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../utils/api';

const BiometricLogin = () => {
  const { theme, darkMode } = useSettings();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, scanning, success, error
  const [message, setMessage] = useState('');

  const handleBiometricAuth = async () => {
    setStatus('scanning');
    setMessage('Scanning... Please verify your identity.');

    try {
      // 1. Get options from server
      const resp = await api.get('/webauthn/login-options');
      const options = resp.data;

      // 2. Pass options to browser
      let asseResp;
      try {
        asseResp = await startAuthentication(options);
      } catch (error) {
        throw error;
      }

      // 3. Send response to server
      const verificationResp = await api.post('/webauthn/login-verify', asseResp);
      const verificationJSON = verificationResp.data;

      if (verificationJSON && verificationJSON.verified) {
        setStatus('success');
        setMessage('Identity Verified Successfully');
        
        localStorage.setItem('token', verificationJSON.token);
        localStorage.setItem('userType', verificationJSON.userType);
        localStorage.setItem('userData', JSON.stringify(verificationJSON.user));

        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 1500);
      } else {
        throw new Error('Verification failed');
      }

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <i className="fas fa-fingerprint text-3xl text-white"></i>
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Biometric Login</h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Use your fingerprint or face ID to access your portal securely.
          </p>
        </div>

        {/* Status Display */}
        <div className="mb-8 text-center">
          {status === 'idle' && (
            <div className={`p-4 rounded-lg border border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
              <i className={`fas fa-shield-alt text-4xl mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}></i>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ready to scan</p>
            </div>
          )}

          {status === 'scanning' && (
            <div className="animate-pulse">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-500 font-medium">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-bounce-in">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <p className="text-green-500 font-bold text-lg">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-times text-white text-2xl"></i>
              </div>
              <p className="text-red-500 font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleBiometricAuth}
            disabled={status === 'scanning' || status === 'success'}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]
              ${status === 'scanning' ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30'}
            `}
          >
            {status === 'idle' || status === 'error' ? 'Authenticate Now' : 'Processing...'}
          </button>

          <Link 
            to="/patient/login"
            className={`block text-center text-sm font-medium ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Use Password Instead
          </Link>
        </div>

        {/* Security Note */}
        <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} text-center`}>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <i className="fas fa-lock mr-1"></i>
            Secured by MediTRACKNG National Identity System
          </p>
        </div>

      </div>
    </div>
  );
};

export default BiometricLogin;
