import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

const Appointments = () => {
  const { theme, t } = useSettings();
  const darkMode = theme.toLowerCase() === 'dark';
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([
    { id: 'APT-001', date: '2024-12-15', time: '10:00 AM', doctor: 'Dr. Sarah Johnson', specialization: 'General Practice', type: 'Consultation', status: 'Scheduled' },
    { id: 'APT-002', date: '2024-12-08', time: '02:00 PM', doctor: 'Dr. Michael Chen', specialization: 'Cardiology', type: 'Follow-up', status: 'Completed' },
    { id: 'APT-003', date: '2024-11-25', time: '11:30 AM', doctor: 'Dr. Sarah Johnson', specialization: 'General Practice', type: 'Checkup', status: 'Completed' },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAppointment = {
      id: `APT-${String(appointments.length + 1).padStart(3, '0')}`,
      date: formData.get('date'),
      time: formData.get('time'),
      doctor: formData.get('doctor'),
      specialization: formData.get('specialization'),
      type: formData.get('type'),
      status: 'Scheduled'
    };
    setAppointments([newAppointment, ...appointments]);
    setShowModal(false);
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
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 text-sm">Next Appointment</p>
          <p className="text-lg font-bold text-gray-900 mt-1">Dec 15</p>
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
                      <button className="text-red-600 hover:text-red-800 font-medium text-sm">Cancel</button>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Details</button>
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                <select name="specialization" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
                <select name="doctor" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Doctor</option>
                  <option value="dr-johnson">Dr. Sarah Johnson - General Practice</option>
                  <option value="dr-chen">Dr. Michael Chen - Cardiology</option>
                  <option value="dr-williams">Dr. Emily Williams - Pediatrics</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                  <input name="date" type="date" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <select name="time" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type *</label>
                <select name="type" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Type</option>
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="checkup">Regular Checkup</option>
                  <option value="emergency">Urgent Care</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit *</label>
                <textarea rows="3" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Please describe your symptoms or reason for the appointment"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Any additional information for the doctor"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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
    </div>
  );
};

export default Appointments;
