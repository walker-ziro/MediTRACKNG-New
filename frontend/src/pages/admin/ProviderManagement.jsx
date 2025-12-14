import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/Modal';

const ProviderManagement = () => {
  const { theme, t , darkMode } = useSettings();
  const { fetchData, putData } = useApi();
  const { showNotification } = useNotification();
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProviders = async () => {
    try {
      const data = await fetchData('/auth/providers');
      if (data) {
        setProviders(data);
      }
    } catch (error) {
      console.error('Failed to load providers', error);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleView = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleApprove = async (providerId) => {
    if (window.confirm('Are you sure you want to approve this provider?')) {
      try {
        await putData(`/auth/providers/${providerId}/approve`, {});
        showNotification('Provider approved successfully', 'success');
        loadProviders();
      } catch (error) {
        console.error('Failed to approve provider', error);
      }
    }
  };

  const handleReject = async (providerId) => {
    if (window.confirm('Are you sure you want to reject this provider?')) {
      try {
        await putData(`/auth/providers/${providerId}/reject`, {});
        showNotification('Provider rejected successfully', 'success');
        loadProviders();
      } catch (error) {
        console.error('Failed to reject provider', error);
      }
    }
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Provider Management</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage healthcare provider registrations and credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Providers</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{providers.length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
          <p className="text-3xl font-bold text-green-500 mt-1">{providers.filter(p => p.status === 'Active').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">{providers.filter(p => p.status === 'Pending').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total {t('patients')} Served</p>
          <p className="text-3xl font-bold text-blue-500 mt-1">{providers.reduce((acc, p) => acc + p.patients, 0)}</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Provider ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Specialization</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Facility</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Patients</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {providers.map((provider) => (
                <tr key={provider.id} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{provider.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{provider.name}</span>
                      {provider.verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{provider.specialization}</td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{provider.facility}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{provider.patients}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      provider.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                    }`}>
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {provider.status === 'Pending' ? (
                      <>
                        <button onClick={() => handleApprove(provider.id)} className="text-green-400 hover:text-green-300 font-medium text-sm mr-3">Approve</button>
                        <button onClick={() => handleReject(provider.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Reject</button>
                      </>
                    ) : (
                      <button onClick={() => handleView(provider)} className="text-blue-400 hover:text-blue-300 font-medium text-sm">View Details</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provider Details"
      >
        {selectedProvider && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Provider ID</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.id}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.name}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Specialization</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.specialization}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Facility</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.facility}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Patients Served</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.patients}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
              <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                selectedProvider.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
              }`}>
                {selectedProvider.status}
              </span>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Verified</label>
              <p className={`mt-1 text-lg ${selectedProvider.verified ? 'text-green-500' : 'text-red-500'}`}>
                {selectedProvider.verified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProviderManagement;
