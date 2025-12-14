import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const HealthRecords = () => {
  const { theme, t , darkMode } = useSettings();
  const { fetchData } = useApi();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const loadRecords = async () => {
      if (!userData.healthId) return;
      try {
        const data = await fetchData(`/patient-portal/encounters/${userData.healthId}`);
        if (data && data.encounters) {
          const formattedRecords = data.encounters.map(enc => ({
            id: enc.id,
            date: new Date(enc.date).toLocaleDateString(),
            type: enc.type,
            provider: enc.provider ? `Dr. ${enc.provider.firstName} ${enc.provider.lastName}` : 'Unknown Provider',
            diagnosis: (enc.diagnosis && enc.diagnosis.length > 0) 
              ? enc.diagnosis.map(d => d.description || d.code).join(', ') 
              : 'No diagnosis',
            notes: enc.chiefComplaint || 'No notes'
          }));
          setRecords(formattedRecords);
        }
      } catch (error) {
        console.error("Error loading health records", error);
      }
    };
    loadRecords();
  }, [userData.healthId, fetchData]);

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('healthRecords')}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>View your complete medical history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Records</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{records.length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Visit</p>
          <p className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {records.length > 0 ? records[0].date : 'N/A'}
          </p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Health Status</p>
          <p className="text-xl font-bold text-green-600 mt-1">Good</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Medical Records</h2>
        </div>
        <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {records.map((record) => (
            <div key={record.id} className={`p-6 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{record.type}</span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{record.date}</span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.diagnosis}</h3>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Provider: {record.provider}</p>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{record.notes}</p>
                </div>
                <button 
                  onClick={() => handleViewDetails(record)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  {t('view')} Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Record Details</h2>
              <button onClick={() => setSelectedRecord(null)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Diagnosis</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.diagnosis}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.type}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.date}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Provider</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.provider}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Notes</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.notes}</p>
              </div>
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;
