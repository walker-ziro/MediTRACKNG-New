import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const Prescriptions = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const { theme, t , darkMode } = useSettings();
  const { fetchData, postData } = useApi();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    duration: '',
    notes: ''
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prescriptionsData, patientsData] = await Promise.all([
          fetchData('/prescriptions'),
          fetchData('/patients')
        ]);

        if (prescriptionsData?.data) {
          const flattenedPrescriptions = prescriptionsData.data.flatMap(rx => 
            rx.medications.map((med, index) => ({
              id: `${rx.prescriptionId || rx._id}-${index}`,
              patient: rx.patient?.name || 'Unknown',
              healthId: rx.patient?.healthId || 'N/A',
              medication: med.drugName,
              dosage: `${med.dosage ? (typeof med.dosage === 'object' ? `${med.dosage.amount || ''} ${med.dosage.unit || ''}` : med.dosage) : ''} ${med.frequency || ''}`.trim(),
              duration: typeof med.duration === 'object' ? `${med.duration.value} ${med.duration.unit}` : med.duration,
              date: new Date(rx.createdAt).toLocaleDateString(),
              status: rx.status
            }))
          );
          setPrescriptions(flattenedPrescriptions);
        }

        if (patientsData) {
          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedPatient = patients.find(p => p.healthId === formData.patientId);
      const payload = {
        patient: {
            healthId: formData.patientId,
            name: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
        },
        provider: {
            providerId: userData.providerId || userData.id || userData._id,
            name: `${userData.firstName} ${userData.lastName}`,
            licenseNumber: userData.licenseNumber || 'N/A',
            specialization: userData.specialization || 'General'
        },
        medications: [{
          drugName: formData.medication,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration,
          notes: formData.notes
        }],
        status: 'Active'
      };

      const response = await postData('/prescriptions', payload);
      if (response) {
        const rx = response.prescription || response.data || response; // Adjust based on API response
        const newPrescriptions = rx.medications.map((med, index) => ({
          id: `${rx.prescriptionId || rx._id}-${index}`,
          patient: payload.patient.name,
          healthId: payload.patient.healthId,
          medication: med.drugName,
          dosage: `${med.dosage.amount || med.dosage} ${med.dosage.unit || ''} ${med.frequency || ''}`.trim(),
          duration: med.duration.value ? `${med.duration.value} ${med.duration.unit}` : med.duration,
          date: new Date().toLocaleDateString(),
          status: 'Active'
        }));
        
        setPrescriptions([...newPrescriptions, ...prescriptions]);
        setShowModal(false);
        setFormData({
          patientId: '',
          medication: '',
          dosage: '',
          frequency: 'Once daily',
          duration: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to create prescription', error);
    }
  };

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('prescriptions')}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage electronic prescriptions for patients</p>
      </div>

      <div className={`rounded-xl shadow-sm border p-6 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + New Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total {t('prescriptions')}</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{prescriptions.length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{prescriptions.filter(p => p.status === 'Active').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dispensed</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{prescriptions.filter(p => p.status === 'Dispensed').length}</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Prescription ID</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Patient</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Medication</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dosage</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">{prescription.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{prescription.patient}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{prescription.healthId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{prescription.medication}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{prescription.dosage}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {typeof prescription.duration === 'object' && prescription.duration !== null 
                        ? `${prescription.duration.value} ${prescription.duration.unit}` 
                        : prescription.duration}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{prescription.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      prescription.status === 'Active' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedPrescription(prescription)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('newPrescription')}</h2>
              <button onClick={() => setShowModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Patient</label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p.healthId} value={p.healthId}>
                        {p.firstName} {p.lastName} ({p.healthId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Medication</label>
                    <input
                      type="text"
                      name="medication"
                      value={formData.medication}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                      placeholder="e.g. Amoxicillin"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dosage</label>
                    <input
                      type="text"
                      name="dosage"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                      placeholder="e.g. 500mg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Frequency</label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                      placeholder="e.g. 7 days"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes / Instructions</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                    placeholder="Additional instructions..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)} 
                    className={`px-6 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prescription ID</label>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.id}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Patient</label>
                <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.patient} <span className="text-sm text-gray-500">({selectedPrescription.healthId})</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Medication</label>
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.medication}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPrescription.status === 'Active' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedPrescription.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dosage</label>
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Duration</label>
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.duration}</p>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date Prescribed</label>
                <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.date}</p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button 
                  onClick={() => setSelectedPrescription(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Prescriptions;
