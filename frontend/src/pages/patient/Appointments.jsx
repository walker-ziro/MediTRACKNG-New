import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';

const Appointments = () => {
  const { theme, t , darkMode } = useSettings();
  const { showNotification } = useNotification();
  const { fetchData, postData, putData, loading } = useApi();
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('userData');
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await fetchData('/auth/providers');
        if (data) {
          setDoctors(data);
        }
      } catch (error) {
        console.error('Failed to load doctors', error);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!userData?.healthId) return;
      
      try {
        const response = await fetchData(`/patient-portal/appointments/${userData.healthId}`);
        if (response?.appointments) {
          const formattedAppointments = response.appointments.map(apt => ({
            id: apt.id,
            date: new Date(apt.date).toLocaleDateString(),
            time: apt.time,
            doctor: typeof apt.doctor === 'string' ? apt.doctor : (apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unknown Doctor'),
            specialization: apt.doctor?.specialization || apt.department || 'General',
            type: apt.reason || 'Consultation',
            status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
          }));
          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Failed to load appointments', 'error');
      }
    };

    loadAppointments();
  }, [userData]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const doctorId = formData.get('doctor');
    const selectedDoctor = doctors.find(d => d.id === doctorId);

    const payload = {
      healthId: userData.healthId,
      patientName: userData.name,
      doctorId: doctorId,
      doctorName: selectedDoctor ? selectedDoctor.name : '',
      department: selectedDoctor ? selectedDoctor.specialization : formData.get('specialization'),
      date: formData.get('date'),
      time: formData.get('time'),
      type: formData.get('type'),
      reason: formData.get('reason') || 'Consultation'
    };

    try {
      const response = await postData('/appointments', payload);
      if (response && response.appointment) {
        const apt = response.appointment;
        const newApt = {
          id: apt._id,
          date: new Date(apt.date).toLocaleDateString(),
          time: apt.time,
          doctor: apt.doctorName,
          specialization: apt.department,
          type: apt.type,
          status: 'Scheduled'
        };
        setAppointments([newApt, ...appointments]);
        setShowModal(false);
        showNotification('Appointment booked successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to book appointment', error);
      showNotification('Failed to book appointment', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await putData(`/appointments/${id}`, { status: 'cancelled' });
        setAppointments(appointments.map(apt => 
          apt.id === id ? { ...apt, status: 'Cancelled' } : apt
        ));
        showNotification('Appointment cancelled successfully', 'info');
      } catch (error) {
        console.error('Failed to cancel appointment', error);
        showNotification('Failed to cancel appointment', 'error');
      }
    }
  };

  const handleViewDetails = (apt) => {
    setSelectedAppointment(apt);
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('appointments')}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your medical appointments</p>
      </div>

      <div className={`rounded-xl shadow-sm border p-6 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{appointments.filter(a => a.status === 'Scheduled').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{appointments.filter(a => a.status === 'Completed').length}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Next Appointment</p>
          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
            {appointments.filter(a => a.status === 'Scheduled').length > 0 
              ? appointments.filter(a => a.status === 'Scheduled').sort((a, b) => new Date(a.date) - new Date(b.date))[0].date 
              : 'None'}
          </p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>ID</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date & Time</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Doctor</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {appointments.map((apt) => (
                <tr key={apt.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{apt.id}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{apt.date} {apt.time}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{apt.doctor}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{apt.specialization}</div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{apt.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {apt.status === 'Scheduled' ? (
                      <button 
                        onClick={() => handleCancel(apt.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleViewDetails(apt)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Specialization *</label>
                <select name="specialization" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}>
                  <option value="">Select Specialization</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="general">General Medicine</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Doctor *</label>
                <select name="doctor" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}>
                  <option value="">Select Doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preferred Date *</label>
                  <input name="date" type="date" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preferred Time *</label>
                  <select name="time" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="">Select Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Appointment Type *</label>
                <select name="type" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}>
                  <option value="">Select Type</option>
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="checkup">Regular Checkup</option>
                  <option value="emergency">Urgent Care</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reason for Visit *</label>
                <textarea rows="3" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} placeholder="Please describe your symptoms or reason for the appointment"></textarea>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Additional Notes</label>
                <textarea rows="2" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`} placeholder="Any additional information for the doctor"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={`px-6 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full m-4`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appointment Details</h2>
              <button onClick={() => setSelectedAppointment(null)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Doctor</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAppointment.doctor}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Specialization</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAppointment.specialization}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</p>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAppointment.date}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time</p>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAppointment.time}</p>
                </div>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAppointment.type}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                  selectedAppointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 
                  selectedAppointment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <button 
                onClick={() => setSelectedAppointment(null)}
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

export default Appointments;
