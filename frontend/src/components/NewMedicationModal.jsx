import { useState } from 'react';
import { useApp } from '../context/AppContext';

const NewMedicationModal = ({ onClose, onSuccess }) => {
  const { darkMode } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Analgesic',
    stock: '',
    reorderLevel: '',
    price: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Analgesic', 'Antibiotic', 'Cardiovascular', 'Diabetes', 'Gastrointestinal', 'Cholesterol', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock || !formData.reorderLevel || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const newMed = {
        id: `MED${Date.now()}`,
        ...formData,
        stock: parseInt(formData.stock),
        reorderLevel: parseInt(formData.reorderLevel),
        prescriptions: 0,
        status: parseInt(formData.stock) > parseInt(formData.reorderLevel) ? 'In Stock' : 'Low Stock'
      };
      onSuccess(newMed);
    } catch (err) {
      setError('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-lg w-full`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Medication</h3>
            <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl`}>×</button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Medication Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Paracetamol 500mg" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock Quantity *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="500" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reorder Level *</label>
                <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} placeholder="100" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price (₦) *</label>
              <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="2,500" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className={`flex-1 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{loading ? 'Adding...' : 'Add Medication'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewMedicationModal;
