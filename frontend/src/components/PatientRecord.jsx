import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../utils/api';

const PatientRecord = () => {
  const { theme , darkMode } = useSettings();
  const { healthId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientData();
  }, [healthId]);

  const fetchPatientData = async () => {
    setLoading(true);
    setError('');

    try {
      const [patientRes, encountersRes] = await Promise.all([
        patientAPI.getByHealthId(healthId),
        patientAPI.getEncounters(healthId)
      ]);

      setPatient(patientRes.data.patient);
      setEncounters(encountersRes.data.encounters);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
            <h3 className="font-semibold mb-2">Error Loading Patient</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Patient Medical Record</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header Card */}
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {patient.demographics.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {patient.demographics.name}
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Health ID: <span className="font-semibold text-primary-700">{patient.healthId}</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Age</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {calculateAge(patient.demographics.dateOfBirth)} years
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gender</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{patient.demographics.gender}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date of Birth</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(patient.demographics.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {patient.demographics.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 md:ml-6">
              <button
                onClick={() => navigate(`/patient/${healthId}/new-encounter`)}
                className="btn-primary w-full md:w-auto"
              >
                + New Encounter
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow mb-6`}>
          <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('encounters')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'encounters'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Encounter History ({encounters.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab patient={patient} />
            )}
            {activeTab === 'encounters' && (
              <EncountersTab encounters={encounters} formatDateTime={formatDateTime} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ patient }) => {
  return (
    <div className="space-y-6">
      {/* Demographics */}
      <section>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
          <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          Demographics
        </h3>
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4`}>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</p>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{patient.demographics.name}</p>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Address</p>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{patient.demographics.address || 'Not provided'}</p>
          </div>
        </div>
      </section>

      {/* Medical History */}
      <section>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
          <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          Medical History
        </h3>
        <div className="bg-red-50 rounded-lg p-4">
          {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
            <ul className="space-y-2">
              {patient.medicalHistory.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>No medical history recorded</p>
          )}
        </div>
      </section>

      {/* Medication History */}
      <section>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </span>
          Medication History
        </h3>
        <div className="bg-green-50 rounded-lg p-4">
          {patient.medicationHistory && patient.medicationHistory.length > 0 ? (
            <ul className="space-y-2">
              {patient.medicationHistory.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>No medication history recorded</p>
          )}
        </div>
      </section>

      {/* Immunization Records */}
      <section>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
          <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          Immunization Records
        </h3>
        <div className="bg-purple-50 rounded-lg p-4">
          {patient.immunizationRecords && patient.immunizationRecords.length > 0 ? (
            <ul className="space-y-2">
              {patient.immunizationRecords.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>No immunization records</p>
          )}
        </div>
      </section>
    </div>
  );
};

// Encounters Tab Component
const EncountersTab = ({ encounters, formatDateTime }) => {
  const [selectedEncounter, setSelectedEncounter] = useState(null);

  if (encounters.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>No encounters</h3>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          This patient has no encounter history yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Complete Encounter Timeline
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          View patient's medical journey across all healthcare facilities
        </p>
      </div>

      <div className="space-y-4">
        {encounters.map((encounter, index) => (
          <div
            key={encounter._id}
            className="relative"
          >
            {/* Timeline line */}
            {index < encounters.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-300" />
            )}

            <div className="card hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setSelectedEncounter(selectedEncounter === encounter._id ? null : encounter._id)}>
              <div className="flex items-start">
                {/* Timeline dot */}
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <div>
                      <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {encounter.providerName}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Provider ID: {encounter.providerId}
                      </p>
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 md:mt-0`}>
                      <span className="font-medium">{formatDateTime(encounter.date)}</span>
                    </div>
                  </div>

                  {selectedEncounter === encounter._id && (
                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-4`}>
                      {/* Clinical Notes */}
                      {encounter.clinicalNotes && (
                        <div>
                          <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Clinical Notes</h5>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-3 rounded-md`}>
                            {encounter.clinicalNotes}
                          </p>
                        </div>
                      )}

                      {/* Lab Results */}
                      {encounter.labResults && encounter.labResults.length > 0 && (
                        <div>
                          <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Lab Results</h5>
                          <div className="space-y-2">
                            {encounter.labResults.map((lab, labIndex) => (
                              <div key={labIndex} className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-3 rounded-md flex justify-between items-center`}>
                                <div>
                                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lab.name}</p>
                                  {lab.link && (
                                    <a href={lab.link} className="text-sm text-primary-600 hover:underline">
                                      View Report
                                    </a>
                                  )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  lab.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  lab.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {lab.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Discharge Summary */}
                      {encounter.dischargeSummary && (
                        <div>
                          <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Discharge Summary</h5>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-3 rounded-md`}>
                            {encounter.dischargeSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {selectedEncounter === encounter._id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientRecord;
