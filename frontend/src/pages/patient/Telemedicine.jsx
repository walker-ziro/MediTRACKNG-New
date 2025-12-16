import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';
import VideoCallModal from '../../components/VideoCallModal';

const Telemedicine = () => {
  const { theme, t, darkMode } = useSettings();
  const { showNotification } = useNotification();
  const { fetchData } = useApi();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('userData');
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const loadConsultations = async () => {
      if (!userData?.healthId) return;
      try {
        const data = await fetchData(`/telemedicine/patient/${userData.healthId}`);
        if (data) {
          const formatted = data.map(c => ({
            id: c._id,
            doctor: (c.provider?.name && !c.provider.name.includes('undefined')) ? c.provider.name : 'Unknown Provider',
            specialty: c.provider?.specialization || 'General',
            date: new Date(c.scheduledDate).toLocaleDateString(),
            time: new Date(c.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: `${c.duration} mins`,
            status: c.status,
            type: c.consultationType || 'Video Call'
          }));
          setAppointments(formatted);
        }
      } catch (error) {
        console.error('Failed to load consultations', error);
      }
    };
    loadConsultations();
  }, [userData, fetchData]);

  const handleJoinCall = (appointment) => {
    setActiveCall(appointment);
    setShowVideoModal(true);
    showNotification(`Joining call with ${appointment.doctor}`, 'info');
  };

  const handleEndCall = () => {
    setShowVideoModal(false);
    setActiveCall(null);
    showNotification('Call ended', 'info');
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Telemedicine</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Virtual consultations with your healthcare providers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Consultations</h2>
            
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} flex flex-col md:flex-row items-center justify-between gap-4`}>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {apt.doctor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{apt.doctor}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{apt.specialty} • {apt.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{apt.date}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{apt.time}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleJoinCall(apt)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Consultations History */}
          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>History</h2>
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No past consultations found.
            </div>
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Check</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Camera</span>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-1 rounded-full">READY</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Microphone</span>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-1 rounded-full">READY</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Connection</span>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-1 rounded-full">GOOD</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Need Help?</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
              Having trouble connecting? Contact our technical support team for immediate assistance.
            </p>
            <button className="w-full py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <VideoCallModal 
        isOpen={showVideoModal} 
        onClose={handleEndCall} 
        remoteName={activeCall?.doctor} 
      />
    </div>
  );
};

export default Telemedicine;
