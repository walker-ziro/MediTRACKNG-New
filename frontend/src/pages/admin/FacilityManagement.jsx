import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/Modal';

const FacilityManagement = () => {
  const { theme, t, darkMode } = useSettings();
  const { fetchData, putData } = useApi();
  const { showNotification } = useNotification();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadFacilities = async () => {
    try {
      const data = await fetchData('/facilities');
      if (data) {
        setFacilities(data);
      }
    } catch (error) {
      console.error('Failed to load facilities', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const handleView = (facility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (facility) => {
    const newStatus = facility.status === 'Active' ? 'Inactive' : 'Active';
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      try {
        await putData(`/facilities/${facility._id}`, { status: newStatus });
        showNotification(`Facility status updated to ${newStatus}`, 'success');
        loadFacilities();
      } catch (error) {
        console.error('Failed to update facility status', error);
      }
    }
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Facility Management</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage healthcare facilities and their configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Facilities</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{facilities.length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
          <p className="text-3xl font-bold text-green-500 mt-1">{facilities.filter(f => f.status === 'Active').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hospitals</p>
          <p className="text-3xl font-bold text-blue-500 mt-1">{facilities.filter(f => f.type === 'Hospital').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clinics</p>
          <p className="text-3xl font-bold text-purple-500 mt-1">{facilities.filter(f => f.type === 'Clinic').length}</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Facility ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-400">Loading facilities...</td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-400">No facilities found</td>
                </tr>
              ) : (
                facilities.map((facility) => (
                  <tr key={facility._id} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{facility.facilityId}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{facility.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{facility.type}</td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{facility.location?.state}, {facility.location?.city}</td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{facility.contact?.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        facility.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {facility.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleView(facility)} className="text-blue-400 hover:text-blue-300 font-medium text-sm mr-3">View</button>
                      <button 
                        onClick={() => handleToggleStatus(facility)} 
                        className={`${facility.status === 'Active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} font-medium text-sm`}
                      >
                        {facility.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Facility Details"
      >
        {selectedFacility && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Facility ID</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedFacility.facilityId}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedFacility.name}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedFacility.type}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedFacility.location?.address}, {selectedFacility.location?.city}, {selectedFacility.location?.state} {selectedFacility.location?.zipCode}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Phone: {selectedFacility.contact?.phone}<br/>
                Email: {selectedFacility.contact?.email}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
              <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                selectedFacility.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'
              }`}>
                {selectedFacility.status}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FacilityManagement;
