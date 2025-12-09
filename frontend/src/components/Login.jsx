import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const Login = () => {
  const { theme } = useSettings();
  const darkMode = theme && theme.toLowerCase() === 'dark';
  const navigate = useNavigate();
  const [userType, setUserType] = useState('provider'); // 'provider' or 'patient'
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    facilityName: '',
    healthId: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      
      if (userType === 'patient') {
        // Patient portal login - redirect to patient portal page
        navigate('/patient-portal');
        setLoading(false);
        return;
      }
      
      // Provider login/registration
      if (isLogin) {
        response = await authAPI.login({
          username: formData.username,
          password: formData.password
        });
      } else {
        response = await authAPI.register(formData);
      }

      const { token, provider } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('provider', JSON.stringify(provider));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">MediTRACKNG</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>National Health Records System</p>
        </div>

        {/* User Type Toggle */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-2 mb-6 flex gap-2`}>
          <button
            onClick={() => {
              setUserType('provider');
              setError('');
              setFormData({ username: '', password: '', facilityName: '', healthId: '', pin: '' });
            }}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              userType === 'provider'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏥 Healthcare Provider
          </button>
          <button
            onClick={() => {
              setUserType('patient');
              setError('');
              setFormData({ username: '', password: '', facilityName: '', healthId: '', pin: '' });
            }}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              userType === 'patient'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👤 Patient
          </button>
        </div>

        {/* Login/Register Form */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {userType === 'patient' 
              ? 'Patient Portal Access' 
              : (isLogin ? 'Provider Login' : 'Provider Registration')}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === 'patient' ? (
              // Patient Login Fields
              <>
                <div>
                  <label className="label">Health ID</label>
                  <input
                    type="text"
                    name="healthId"
                    value={formData.healthId}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="MTN-XXXXXXX"
                    required
                  />
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Enter your National Health ID</p>
                </div>

                <div>
                  <label className="label">PIN</label>
                  <input
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your 6-digit PIN"
                    maxLength="6"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    🔐 Use Biometric Login
                  </a>
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    Forgot PIN?
                  </a>
                </div>
              </>
            ) : (
              // Provider Login/Registration Fields
              <>
                <div>
                  <label className="label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="label">Facility Name</label>
                    <input
                      type="text"
                      name="facilityName"
                      value={formData.facilityName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter your facility name"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (userType === 'patient' ? 'Access Portal' : (isLogin ? 'Login' : 'Register'))}
            </button>
          </form>

          {userType === 'provider' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ username: '', password: '', facilityName: '', healthId: '', pin: '' });
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : 'Already have an account? Login'}
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {userType === 'patient' ? (
            <>
              <p className="font-semibold text-gray-800 mb-2">For Patients:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Access your complete medical history</li>
                <li>View lab results and prescriptions</li>
                <li>Manage consent for data sharing</li>
                <li>Download your health records</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-800 mb-2">For Healthcare Providers:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Secure access to patient records</li>
                <li>Complete medical history tracking</li>
                <li>Multi-facility collaboration</li>
                <li>National health data integration</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
