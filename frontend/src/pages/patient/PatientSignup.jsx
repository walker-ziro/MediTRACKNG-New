import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';

const PatientSignup = ({ isEmbedded = false }) => {
  const { theme , darkMode } = useSettings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    genotype: '',
    allergies: '',
    chronicConditions: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP State
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (showOTP && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOTP, resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        return; // Prevent selecting future dates
      }
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await api.post('/multi-auth/patient/register', dataToSend);

      const data = response.data;

      if (data.requiresVerification) {
        setShowOTP(true);
      } else {
        // Token is now handled via httpOnly cookie
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/patient/dashboard');
      }
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Registration failed';
      if (err.response?.data?.error) {
        errorMessage += ` (${err.response.data.error})`;
      }
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/multi-auth/verify-otp', { 
        email: formData.email, 
        otp, 
        userType: 'patient' 
      });
      const data = response.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', data.userType);
      localStorage.setItem('userData', JSON.stringify(data.user));
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/multi-auth/resend-otp', { 
        email: formData.email, 
        userType: 'patient' 
      });
      
      setResendTimer(30);
      setCanResend(false);
      // Optional: show success message
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-8 flex items-center justify-center`}>
        <div className={`max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden p-8`}>
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full mb-4`}>
              <i className={`fas fa-envelope-open-text text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
            </div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Verify Your Email</h2>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              We sent a verification code to <br/> <span className="font-semibold">{formData.email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
                <i className="fas fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className={`w-full px-4 py-3 text-center text-2xl tracking-widest border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'} font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all shadow-lg disabled:opacity-50`}
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || loading}
                className={`text-sm font-medium ${
                  canResend 
                    ? (darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700') 
                    : (darkMode ? 'text-gray-500' : 'text-gray-400')
                }`}
              >
                {canResend ? 'Resend Code' : `Resend Code in ${resendTimer}s`}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Patient Registration</h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Create your account to access health services</p>
      </div>

      {/* Form */}
      <div className="px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-md flex items-start">
              <i className="fas fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <i className={`fas fa-user mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13)}
                  maxLength={13}
                  pattern="[0-9]*"
                  placeholder="08012345678"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <i className={`fas fa-heartbeat mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Medical Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Blood Type</label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Genotype</label>
                <select
                  name="genotype"
                  value={formData.genotype}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                >
                  <option value="">Select genotype</option>
                  <option value="AA">AA</option>
                  <option value="AS">AS</option>
                  <option value="AC">AC</option>
                  <option value="SS">SS</option>
                  <option value="SC">SC</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="List any known allergies (e.g., medications, food, environmental)"
                  rows="2"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none resize-none`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chronic Conditions</label>
                <textarea
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                  placeholder="List any chronic conditions (e.g., diabetes, hypertension, asthma)"
                  rows="2"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <i className={`fas fa-phone-alt mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Emergency Contact
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact Name *</label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Relationship *</label>
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact Phone *</label>
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  placeholder="+234 XXX XXX XXXX"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact Email</label>
                <input
                  type="email"
                  name="emergencyContact.email"
                  value={formData.emergencyContact.email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <i className={`fas fa-map-marker-alt mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Address
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Street Address *</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="Street address"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>State *</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Postal Code *</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                  className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <i className={`fas fa-lock mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              Account Security
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
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
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-2.5 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-gray-700`}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'} font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-check mr-2"></i>
                Create Account
              </>
            )}
          </button>

          {!isEmbedded && (
            <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/patient/login" className={`${darkMode ? 'text-white hover:text-gray-200' : 'text-gray-900 hover:text-gray-700'} font-semibold`}>
                Sign in here
              </Link>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      {!isEmbedded && (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-8 py-6 border-t`}>
          <div className="flex justify-center gap-6 mb-4">
            <Link to="/provider/login" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} font-medium text-sm flex items-center`}>
              <i className="fas fa-user-md mr-1"></i>
              Provider Portal
            </Link>
            <Link to="/admin/login" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-gray-900 font-medium text-sm flex items-center`}>
              <i className="fas fa-user-shield mr-1"></i>
              Admin Portal
            </Link>
          </div>
          <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <i className={`fas fa-shield-alt mr-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
            Your data is secure and encrypted
          </p>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-8`}>
      <div className="max-w-4xl mx-auto">
        {content}
      </div>
    </div>
  );
};

export default PatientSignup;
