import { useSettings } from '../../context/SettingsContext';

const HealthRecords = () => {
  const { theme, t , darkMode } = useSettings();
  const records = [
    { id: 'REC-001', date: '2024-12-08', type: 'Consultation', provider: 'Dr. Sarah Johnson', diagnosis: 'Seasonal Allergies', notes: 'Prescribed antihistamines' },
    { id: 'REC-002', date: '2024-11-25', type: 'Lab Results', provider: 'Dr. Sarah Johnson', diagnosis: 'Blood Work - Normal', notes: 'All values within normal range' },
    { id: 'REC-003', date: '2024-10-15', type: 'Consultation', provider: 'Dr. Michael Chen', diagnosis: 'Annual Checkup', notes: 'Good health status' },
  ];

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
          <p className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dec 8, 2024</p>
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
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('view')} Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
