import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import VideoCallModal from '../../components/VideoCallModal';
import { useApi } from '../../hooks/useApi';

const Telemedicine = () => {
  const { theme, t , darkMode } = useSettings();
  const { fetchData, postData } = useApi();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const userStr = localStorage.getItem('userData');
      if (userStr) {
        const localData = JSON.parse(userStr);
        setUserData(localData);
        
        // Fetch full profile if firstName/lastName are missing or "undefined"
        if (!localData.firstName || !localData.lastName || localData.firstName === 'undefined' || localData.lastName === 'undefined') {
          try {
            const { api } = await import('../../utils/api');
            const profile = await api.get('/multi-auth/profile');
            if (profile.data) {
              const updatedData = { ...localData, ...profile.data };
              localStorage.setItem('userData', JSON.stringify(updatedData));
              setUserData(updatedData);
            }
          } catch (error) {
            console.error('Failed to load provider profile', error);
          }
        }
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!userData?.providerId) return;

      try {
        const [appointmentsData, patientsData] = await Promise.all([
          fetchData(`/telemedicine/provider/${userData.providerId}`),
          fetchData('/patients')
        ]);

        if (appointmentsData) {
          const formattedAppointments = appointmentsData.map(apt => ({
            id: apt._id,
            patient: apt.patient?.name || 'Unknown',
            healthId: apt.patient?.healthId || 'N/A',
            date: new Date(apt.scheduledDate).toLocaleDateString(),
            time: new Date(apt.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: `${apt.duration} mins`,
            status: apt.status,
            type: apt.consultationType || 'Video Call',
            meetingUrl: apt.meetingRoom?.meetingUrl
          }));
          setAppointments(formattedAppointments);
        }

        if (patientsData) {
          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    loadData();
  }, [userData]);

  const handleStartCall = (appointment) => {
    setActiveCall(appointment);
    setShowVideoModal(true);
  };

  const handleEndCall = () => {
    if (activeCall) {
      const updated = appointments.map(apt => 
        apt.id === activeCall.id ? { ...apt, status: 'Completed' } : apt
      );
      setAppointments(updated);
    }
    setShowVideoModal(false);
    setActiveCall(null);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const patientId = formData.get('patientId');
    const selectedPatient = patients.find(p => p.healthId === patientId);

    const payload = {
      providerId: userData.providerId || userData._id || userData.id,
      patientHealthId: patientId,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
      providerName: `${(userData.firstName && userData.firstName !== 'undefined') ? userData.firstName : 'Dr.'} ${(userData.lastName && userData.lastName !== 'undefined') ? userData.lastName : 'Provider'}`,
      providerSpecialization: userData.specialization || userData.specialty || 'General',
      facilityName: userData.facilityName || 'MediTRACKING',
      scheduledDate: `${formData.get('date')}T${formData.get('time')}`,
      duration: parseInt(formData.get('duration')),
      consultationType: formData.get('type'),
      chiefComplaint: formData.get('chiefComplaint'),
      status: 'Scheduled'
    };

    try {
      const response = await postData('/telemedicine', payload);
      if (response) {
        const apt = response.consultation || response.appointment || response; // Adjust based on API response
        const newAppointment = {
          id: apt._id,
          patient: payload.patientName,
          healthId: payload.patientHealthId,
          date: new Date(payload.scheduledDate).toLocaleDateString(),
          time: new Date(payload.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: `${payload.duration} mins`,
          status: 'Scheduled',
          type: payload.consultationType
        };
        setAppointments([...appointments, newAppointment]);
        setShowScheduleModal(false);
      }
    } catch (error) {
      console.error('Failed to schedule appointment', error);
    }
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('telemedicine')}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Virtual consultations and remote patient care</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => setShowVideoModal(true)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Start Video Call
            </button>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className={`w-full px-4 py-3 border rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule {t('appointments')}
            </button>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Today's Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Appointments</span>
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{appointments.filter(a => a.date === '2024-12-08').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</span>
              <span className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'Completed').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Scheduled</span>
              <span className="text-2xl font-bold text-blue-600">{appointments.filter(a => a.status === 'Scheduled').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Scheduled Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Appointment ID</th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Patient</th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Date & Time</th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Duration</th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Type</th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Status</th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">{appointment.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{appointment.patient}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{appointment.healthId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{appointment.date} {appointment.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{appointment.duration}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {appointment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.status === 'Scheduled' ? (
                      <button 
                        onClick={() => handleStartCall(appointment)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Join Call
                      </button>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Notes</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Call Modal */}
      <VideoCallModal 
        isOpen={showVideoModal} 
        onClose={handleEndCall} 
        remoteName={activeCall?.patient} 
      />

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Schedule Telemedicine Appointment</h2>
              <button onClick={() => setShowScheduleModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleScheduleSubmit}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Patient *</label>
                <select 
                  name="patientId"
                  required 
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                >
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
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date *</label>
                  <input 
                    name="date"
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]}
                    required 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time *</label>
                  <input 
                    name="time"
                    type="time" 
                    required 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration *</label>
                  <select 
                    name="duration"
                    required 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  >
                    <option value="15 mins">15 minutes</option>
                    <option value="30 mins">30 minutes</option>
                    <option value="45 mins">45 minutes</option>
                    <option value="60 mins">1 hour</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type *</label>
                  <select 
                    name="type"
                    required 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  >
                    <option value="Video">Video Call</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Chat">Chat</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label>
                <textarea 
                  name="chiefComplaint"
                  rows="3" 
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} 
                  placeholder="Reason for consultation..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)} 
                  className={`px-6 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telemedicine;
