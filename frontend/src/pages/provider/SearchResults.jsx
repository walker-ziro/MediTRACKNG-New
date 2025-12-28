import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const ProviderSearchResults = () => {
  const { darkMode } = useSettings();
  const { fetchData } = useApi();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({
    patients: [],
    appointments: [],
    encounters: []
  });
  const [searching, setSearching] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const performSearch = async () => {
      if (!query || !userData.providerId) return;
      
      setSearching(true);
      try {
        // Fetch data in parallel
        // Note: In a real app, these should be dedicated search endpoints to avoid over-fetching
        const [patientsData, appointmentsData, encountersData] = await Promise.all([
          fetchData('/patients'), // Assuming this returns all patients accessible to provider
          fetchData(`/appointments/provider/${userData.providerId}`),
          fetchData(`/encounters/provider/${userData.providerId}`)
        ]);

        const lowerQuery = query.toLowerCase();

        // Process Patients
        const filteredPatients = (patientsData || [])
          .filter(p => {
            const fullName = `${p.firstName} ${p.lastName}`;
            return (
              fullName.toLowerCase().includes(lowerQuery) ||
              (p.healthId || '').toLowerCase().includes(lowerQuery) ||
              (p.contact?.email || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(p => ({
            id: p.healthId,
            title: `${p.firstName} ${p.lastName}`,
            subtitle: `ID: ${p.healthId} | ${p.gender} | ${p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 'N/A'} yrs`,
            date: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'No visits',
            status: p.status || 'Active',
            type: 'patient',
            link: `/provider/patients?search=${p.healthId}` // Or a detail page if available
          }));

        // Process Appointments
        const filteredAppointments = (appointmentsData || [])
          .filter(apt => {
            const patientName = typeof apt.patient === 'string' ? apt.patient : (apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : '');
            return (
              patientName.toLowerCase().includes(lowerQuery) ||
              (apt.reason || '').toLowerCase().includes(lowerQuery) ||
              (apt.status || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(apt => ({
            id: apt._id,
            title: `Appointment: ${typeof apt.patient === 'string' ? apt.patient : (apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown')}`,
            subtitle: `${apt.reason || 'Consultation'} - ${apt.time}`,
            date: new Date(apt.date).toLocaleDateString(),
            status: apt.status,
            type: 'appointment',
            link: '/provider/appointments'
          }));

        // Process Encounters
        const filteredEncounters = (encountersData || [])
          .filter(enc => {
            const patientName = enc.patient ? `${enc.patient.firstName} ${enc.patient.lastName}` : '';
            const diagnosis = (enc.diagnosis || []).map(d => d.description || d.code).join(' ');
            return (
              patientName.toLowerCase().includes(lowerQuery) ||
              diagnosis.toLowerCase().includes(lowerQuery) ||
              (enc.type || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(enc => ({
            id: enc._id,
            title: `${enc.type || 'Encounter'} - ${enc.patient ? `${enc.patient.firstName} ${enc.patient.lastName}` : 'Unknown'}`,
            subtitle: (enc.diagnosis && enc.diagnosis.length > 0) 
                ? enc.diagnosis.map(d => d.description || d.code).join(', ') 
                : (enc.chiefComplaint || 'No diagnosis'),
            date: new Date(enc.date).toLocaleDateString(),
            status: 'Completed',
            type: 'encounter',
            link: '/provider/encounters'
          }));

        setResults({
          patients: filteredPatients,
          appointments: filteredAppointments,
          encounters: filteredEncounters
        });

      } catch (error) {
        console.error('Provider search failed:', error);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [query, userData.providerId]);

  const totalResults = results.patients.length + results.appointments.length + results.encounters.length;

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
          {/* Patients Section */}
          {results.patients.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Patients</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.patients.map(item => (
                  <ResultCard key={item.id} item={item} darkMode={darkMode} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

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

          {/* Encounters Section */}
          {results.encounters.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Encounters</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.encounters.map(item => (
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
        item.type === 'patient' ? 'bg-blue-100 text-blue-800' :
        item.type === 'appointment' ? 'bg-green-100 text-green-800' :
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

export default ProviderSearchResults;
