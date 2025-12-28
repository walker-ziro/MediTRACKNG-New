import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const SearchResults = () => {
  const { darkMode } = useSettings();
  const { fetchData, loading } = useApi();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({
    appointments: [],
    prescriptions: [],
    records: []
  });
  const [searching, setSearching] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const performSearch = async () => {
      if (!query || !userData.healthId) return;
      
      setSearching(true);
      try {
        // Fetch all data in parallel
        const [appointmentsData, prescriptionsData, recordsData] = await Promise.all([
          fetchData(`/patient-portal/appointments/${userData.healthId}`),
          fetchData(`/prescriptions/patient/${userData.healthId}`),
          fetchData(`/patient-portal/encounters/${userData.healthId}`)
        ]);

        const lowerQuery = query.toLowerCase();

        // Process Appointments
        const filteredAppointments = (appointmentsData?.appointments || [])
          .filter(apt => {
            const doctorName = typeof apt.doctor === 'string' ? apt.doctor : (apt.doctor ? `${apt.doctor.firstName} ${apt.doctor.lastName}` : '');
            return (
              doctorName.toLowerCase().includes(lowerQuery) ||
              (apt.specialization || '').toLowerCase().includes(lowerQuery) ||
              (apt.reason || '').toLowerCase().includes(lowerQuery) ||
              (apt.status || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(apt => ({
            id: apt.appointmentId || apt._id,
            title: `Appointment with ${typeof apt.doctor === 'string' ? apt.doctor : (apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unknown')}`,
            subtitle: apt.reason || 'Consultation',
            date: new Date(apt.date).toLocaleDateString(),
            status: apt.status,
            type: 'appointment',
            link: '/patient/appointments'
          }));

        // Process Prescriptions
        const filteredPrescriptions = (prescriptionsData?.data || [])
          .flatMap(rx => rx.medications.map(med => ({ ...med, rx })))
          .filter(item => {
            return (
              (item.drugName || '').toLowerCase().includes(lowerQuery) ||
              (item.rx.provider?.name || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(item => ({
            id: `${item.rx._id}-${item.drugName}`,
            title: `Prescription: ${item.drugName}`,
            subtitle: `Prescribed by ${item.rx.provider?.name || 'Unknown'}`,
            date: new Date(item.rx.createdAt).toLocaleDateString(),
            status: item.rx.status,
            type: 'prescription',
            link: '/patient/prescriptions'
          }));

        // Process Health Records
        const filteredRecords = (recordsData?.encounters || [])
          .filter(enc => {
            const providerName = enc.provider ? `${enc.provider.firstName} ${enc.provider.lastName}` : '';
            const diagnosis = (enc.diagnosis || []).map(d => d.description || d.code).join(' ');
            return (
              providerName.toLowerCase().includes(lowerQuery) ||
              diagnosis.toLowerCase().includes(lowerQuery) ||
              (enc.type || '').toLowerCase().includes(lowerQuery) ||
              (enc.chiefComplaint || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(enc => ({
            id: enc.id,
            title: `${enc.type || 'Encounter'} - ${enc.provider ? `Dr. ${enc.provider.firstName} ${enc.provider.lastName}` : 'Unknown'}`,
            subtitle: (enc.diagnosis && enc.diagnosis.length > 0) 
                ? enc.diagnosis.map(d => d.description || d.code).join(', ') 
                : (enc.chiefComplaint || 'No diagnosis'),
            date: new Date(enc.date).toLocaleDateString(),
            status: 'Completed',
            type: 'record',
            link: '/patient/health-records'
          }));

        setResults({
          appointments: filteredAppointments,
          prescriptions: filteredPrescriptions,
          records: filteredRecords
        });

      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [query, userData.healthId]);

  const totalResults = results.appointments.length + results.prescriptions.length + results.records.length;

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Search Results</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Found {totalResults} results for "{query}"
        </p>
      </div>

      {searching ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Appointments Section */}
          {results.appointments.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appointments</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.appointments.map(item => (
                  <ResultCard key={item.id} item={item} darkMode={darkMode} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* Prescriptions Section */}
          {results.prescriptions.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Prescriptions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.prescriptions.map(item => (
                  <ResultCard key={item.id} item={item} darkMode={darkMode} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* Health Records Section */}
          {results.records.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Health Records</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.records.map(item => (
                  <ResultCard key={item.id} item={item} darkMode={darkMode} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className={`text-center py-12 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No results found matching your query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultCard = ({ item, darkMode, navigate }) => (
  <div 
    onClick={() => navigate(item.link)}
    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
      darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        item.type === 'appointment' ? 'bg-blue-100 text-blue-800' :
        item.type === 'prescription' ? 'bg-green-100 text-green-800' :
        'bg-purple-100 text-purple-800'
      }`}>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
      </span>
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.date}</span>
    </div>
    <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.subtitle}</p>
  </div>
);

export default SearchResults;
