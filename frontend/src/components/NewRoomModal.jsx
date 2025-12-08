import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { roomAPI } from '../utils/api';

const NewRoomModal = ({ isOpen, onClose, onRoomAdded }) => {
  const { darkMode } = useApp();
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: '',
    floor: '',
    capacity: '1',
    status: 'Available',
    department: '',
    dailyRate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roomTypes = ['General Ward', 'Private', 'ICU', 'Emergency', 'Maternity', 'Pediatric', 'Operation Theater'];
  const departments = ['General', 'Surgery', 'Pediatrics', 'Obstetrics', 'Emergency', 'ICU', 'Orthopedics', 'Cardiology'];
  const statuses = ['Available', 'Occupied', 'Under Maintenance', 'Reserved'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.roomNumber || !formData.roomType || !formData.floor || !formData.department) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const dataToSend = {
        ...formData,
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : undefined
      };

      await roomAPI.create(dataToSend);
      
      setFormData({
        roomNumber: '',
        roomType: '',
        floor: '',
        capacity: '1',
        status: 'Available',
        department: '',
        dailyRate: '',
        notes: ''
      });
      
      onRoomAdded();
      onClose();
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between z-10`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add New Room</h2>
          <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Room Number *</label>
              <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required placeholder="R-101" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`} />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Room Type *</label>
              <select name="roomType" value={formData.roomType} onChange={handleChange} required className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}>
                <option value="">Select Type</option>
                {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Floor *</label>
              <input type="number" name="floor" value={formData.floor} onChange={handleChange} required min="0" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`} />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Capacity *</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`} />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}>
                {statuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Department *</label>
              <select name="department" value={formData.department} onChange={handleChange} required className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}>
                <option value="">Select Department</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Daily Rate (₦)</label>
              <input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} min="0" step="0.01" placeholder="0.00" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`} />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`} />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className={`flex-1 px-6 py-3 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} font-medium`}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium">{loading ? 'Adding...' : 'Add Room'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRoomModal;
