import { useState } from 'react';
import { useApp } from '../context/AppContext';

const NewStaffModal = ({ onClose, onSuccess }) => {
  const { darkMode } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    phone: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['Nurse', 'Lab Technician', 'Pharmacist', 'Receptionist', 'Administrator', 'Maintenance', 'Security', 'Other'];
  const departments = ['Emergency', 'Cardiology', 'Neurology', 'Pediatrics', 'Laboratory', 'Pharmacy', 'Administration', 'General'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.department || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const newStaff = {
        id: `STAFF${Date.now()}`,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      onSuccess(newStaff);
    } catch (err) {
      setError('Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-lg w-full`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Staff Member</h3>
            <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl`}>×</button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                  <option value="">Select role</option>
                  {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department *</label>
                <select name="department" value={formData.department} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                  <option value="">Select department</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13)} maxLength={13} pattern="[0-9]*" onChange={handleChange} placeholder="+234 XXX XXX XXXX" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="staff@hospital.com" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className={`flex-1 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{loading ? 'Adding...' : 'Add Staff'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewStaffModal;
