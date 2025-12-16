import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';

const PatientPrescriptions = () => {
  const navigate = useNavigate();
  const { theme , darkMode } = useSettings();
  const { showNotification } = useNotification();
  const { fetchData, loading } = useApi();
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('userData');
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const loadPrescriptions = async () => {
      if (!userData?.healthId) return;

      try {
        const response = await fetchData(`/prescriptions/patient/${userData.healthId}`);
        if (response?.data) {
          const flattenedPrescriptions = response.data.flatMap(rx => 
            rx.medications.map((med, index) => ({
              id: `${rx._id}-${index}`,
              medication: med.drugName,
              dosage: `${med.dosage?.amount || med.dosage || ''} ${med.dosage?.unit || ''} ${med.frequency || ''}`.trim(),
              duration: `${med.duration?.value || med.duration || ''} ${med.duration?.unit || ''}`.trim(),
              doctor: rx.provider?.name || 'Unknown Doctor',
              date: new Date(rx.createdAt).toLocaleDateString(),
              status: rx.status,
              refills: med.refills || 0,
              originalId: rx._id // Keep original ID for actions if needed
            }))
          );
          setPrescriptions(flattenedPrescriptions);
        }
      } catch (error) {
        console.error('Error loading prescriptions:', error);
        showNotification('Failed to load prescriptions', 'error');
      }
    };

    loadPrescriptions();
  }, [userData]);

  const handleRequestRefill = (rx) => {
    setSelectedRx(rx);
    setShowRefillModal(true);
  };

  const confirmRefill = () => {
    showNotification(`Refill requested for ${selectedRx.medication}. Your pharmacy will be notified.`, 'success');
    setShowRefillModal(false);
    setSelectedRx(null);
  };

  const handleContactDoctor = (rx) => {
    navigate('/patient/telemedicine');
  };

  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Prescriptions</h1>
        <p className="text-gray-600 mt-2">View and manage your medications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Active Prescriptions</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{prescriptions.filter(p => p.status === 'Active').length}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Available Refills</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{prescriptions.reduce((acc, p) => acc + p.refills, 0)}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Expired</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{prescriptions.filter(p => p.status === 'Expired').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prescriptions.map((rx) => (
          <div key={rx.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rx.medication}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rx.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {rx.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-1"><span className="font-medium">Dosage:</span> {rx.dosage}</p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}><span className="font-medium">Duration:</span> {rx.duration}</p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}><span className="font-medium">Prescribed by:</span> {rx.doctor}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prescribed on: {rx.date}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Refills: {rx.refills}</p>
                {rx.status === 'Active' && rx.refills > 0 && (
                  <button 
                    onClick={() => handleRequestRefill(rx)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Request Refill
                  </button>
                )}
                {rx.status === 'Active' && rx.refills === 0 && (
                  <button 
                    onClick={() => handleContactDoctor(rx)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    Contact Doctor
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refill Confirmation Modal */}
      {showRefillModal && selectedRx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Confirm Refill Request</h2>
              <button onClick={() => setShowRefillModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to request a refill for <strong>{selectedRx.medication}</strong>?
              </p>
              <div className={`bg-blue-50 p-4 rounded-lg mb-4 ${darkMode ? 'bg-blue-900/20' : ''}`}>
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Pharmacy:</strong> CVS Pharmacy #1234<br/>
                  <strong>Address:</strong> 123 Main St, Cityville
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowRefillModal(false)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRefill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
