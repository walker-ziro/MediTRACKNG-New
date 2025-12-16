import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const Encounters = () => {
  const { theme, t , darkMode } = useSettings();
  const { fetchData, postData } = useApi();
  const [showModal, setShowModal] = useState(false);
  const [encounters, setEncounters] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [encountersData, patientsData] = await Promise.all([
          fetchData('/encounters'),
          fetchData('/patients')
        ]);

        if (encountersData) {
          const formattedEncounters = encountersData.map(e => ({
            id: e.encounterId || e._id,
            patient: e.patient ? `${e.patient.firstName} ${e.patient.lastName}` : 'Unknown',
            healthId: e.patient?.healthId || 'N/A',
            date: new Date(e.date || e.createdAt).toLocaleDateString(),
            time: new Date(e.date || e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: e.encounterType || 'Consultation',
            status: e.status || 'Completed'
          }));
          setEncounters(formattedEncounters);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datetime = formData.get('datetime');
    
    const payload = {
      healthId: formData.get('patient'),
      date: datetime ? datetime.split('T')[0] : new Date().toISOString().split('T')[0],
      time: datetime ? datetime.split('T')[1] : '00:00',
      type: formData.get('type'),
      status: 'In Progress'
    };

    try {
      const response = await postData('/encounters', payload);
      if (response && response.encounter) {
        const e = response.encounter;
        const newEncounter = {
          id: e.encounterId || e._id,
          patient: e.patient ? `${e.patient.firstName} ${e.patient.lastName}` : 'Unknown',
          healthId: e.patient?.healthId || 'N/A',
          date: new Date(e.encounterDate).toLocaleDateString(),
          time: new Date(e.encounterDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: e.encounterType,
          status: e.status
        };
        setEncounters([newEncounter, ...encounters]);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to create encounter', error);
    }
  };

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('encounters')}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track all patient consultations and visits</p>
      </div>

      <div className={`rounded-xl shadow-sm border p-6 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Encounter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today's {t('encounters')}</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{encounters.filter(e => e.date === new Date().toLocaleDateString()).length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{encounters.filter(e => e.status === 'In Progress').length}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{encounters.filter(e => e.status === 'Completed').length}</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Encounter ID</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Patient</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Health ID</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date & Time</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {encounters.map((encounter) => (
                <tr key={encounter.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">{encounter.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{encounter.patient}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{encounter.healthId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{encounter.date} {encounter.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{encounter.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      encounter.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {encounter.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedEncounter(encounter)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Encounter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Encounter</h2>
              <button onClick={() => setShowModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Patient *</label>
                <select name="patient" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.healthId} value={p.healthId}>
                      {p.firstName} {p.lastName} ({p.healthId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Encounter Type *</label>
                  <select name="type" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="">Select Type</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date & Time *</label>
                  <input 
                    name="datetime" 
                    type="datetime-local" 
                    required 
                    min="1900-01-01T00:00"
                    max={new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 16)}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const minDate = new Date('1900-01-01');
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 6);
                      
                      if (selectedDate < minDate || selectedDate > maxDate) {
                        e.target.value = '';
                        alert('Please select a valid date between 1900 and 6 months from now.');
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} 
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chief Complaint *</label>
                <textarea rows="2" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} placeholder="Patient's main reason for visit"></textarea>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vital Signs</label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="BP (e.g., 120/80)" className={`px-4 py-2 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
                  <input type="text" placeholder="Temp (°F)" className={`px-4 py-2 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
                  <input type="text" placeholder="Heart Rate" className={`px-4 py-2 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Clinical Notes</label>
                <textarea rows="4" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} placeholder="Assessment, diagnosis, and plan"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={`px-6 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Encounter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Encounter Modal */}
      {selectedEncounter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Encounter Details</h2>
              <button onClick={() => setSelectedEncounter(null)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Encounter ID</label>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEncounter.id}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Patient</label>
                <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEncounter.patient} <span className="text-sm text-gray-500">({selectedEncounter.healthId})</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</label>
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEncounter.type}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEncounter.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedEncounter.status}
                  </span>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date & Time</label>
                <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEncounter.date} at {selectedEncounter.time}</p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button 
                  onClick={() => setSelectedEncounter(null)}
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

export default Encounters;
