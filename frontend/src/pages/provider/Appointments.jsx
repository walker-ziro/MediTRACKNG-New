import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const Appointments = () => {
  const { theme, t, darkMode } = useSettings();
  const { fetchData, putData, postData } = useApi();
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    type: 'consultation',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('userData');
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!userData) return;
      
      // Try to get ID from various possible fields
      const providerId = userData.providerId || userData._id || userData.id;
      
      if (!providerId) return;

      try {
        const [appointmentsData, patientsData] = await Promise.all([
          fetchData(`/appointments?doctorId=${providerId}`),
          fetchData('/patients')
        ]);

        if (appointmentsData) {
          setAppointments(appointmentsData);
        }
        if (patientsData) {
          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userData, fetchData]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await putData(`/appointments/${id}`, { status: newStatus });
      setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, status: newStatus } : apt
      ));
    } catch (error) {
      console.error(`Failed to update appointment status to ${newStatus}`, error);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    // Validate date range (max 6 months)
    const selectedDate = new Date(formData.date);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    
    if (selectedDate > maxDate) {
      alert("Appointments cannot be scheduled more than 6 months in advance.");
      return;
    }

    try {
      const selectedPatient = patients.find(p => p.healthId === formData.patientId);
      if (!selectedPatient) return;

      const providerId = userData.providerId || userData._id || userData.id;
      const providerName = `${userData.firstName} ${userData.lastName}`;

      const payload = {
        healthId: selectedPatient.healthId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        doctorId: providerId,
        doctorName: providerName,
        department: userData.specialization || 'General',
        date: formData.date,
        time: formData.time,
        type: formData.type,
        reason: formData.reason,
        notes: formData.notes,
        status: 'confirmed'
      };

      const response = await postData('/appointments', payload);
      if (response && response.appointment) {
        setAppointments([response.appointment, ...appointments]);
        setShowCreateModal(false);
        setFormData({
          patientId: '',
          date: '',
          time: '',
          type: 'consultation',
          reason: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to create appointment', error);
    }
  };

  const canCancelAppointment = (apt) => {
    if (!userData) return false;
    const currentUserId = userData._id || userData.id;
    
    // If created by current user (provider), restrict cancellation to 2 hours
    if (apt.createdBy === currentUserId) {
      const createdTime = new Date(apt.createdAt).getTime();
      const now = new Date().getTime();
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      return (now - createdTime) < twoHours;
    }
    return true;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appointments</h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your patient appointments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Appointment
        </button>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date & Time</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Patient</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reason</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No appointments found</td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(apt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} <br/>
                      <span className="text-xs text-gray-500">{apt.time}</span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="font-medium">{apt.patientName}</div>
                      <div className="text-xs text-gray-500">ID: {apt.healthId}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {apt.type}
                    </td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {apt.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {apt.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {apt.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(apt._id, 'completed')}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                          >
                            Mark Complete
                          </button>
                          {canCancelAppointment(apt) && (
                            <button 
                              onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Appointment</h2>
              <button onClick={() => setShowCreateModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Patient</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
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
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="checkup">Checkup</option>
                  <option value="procedure">Procedure</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  placeholder="Brief reason for visit"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  rows="3"
                  placeholder="Additional notes..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
