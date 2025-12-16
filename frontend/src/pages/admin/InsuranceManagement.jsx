import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const InsuranceManagement = () => {
  const { theme, t, darkMode } = useSettings();
  const { fetchData } = useApi();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        const data = await fetchData('/insurance');
        if (data) {
          setPolicies(data);
        }
      } catch (error) {
        console.error('Failed to load insurance policies', error);
      } finally {
        setLoading(false);
      }
    };
    loadPolicies();
  }, []);

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Insurance Management</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage patient insurance policies and claims</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Policies</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{policies.length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
          <p className="text-3xl font-bold text-green-500 mt-1">{policies.filter(p => p.status === 'Active').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expired</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{policies.filter(p => p.status === 'Expired').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Verification</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">{policies.filter(p => p.status === 'Pending').length}</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Policy Number</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Provider</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Effective Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-400">Loading policies...</td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-400">No policies found</td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{policy.policyNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{policy.patient?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.provider?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{policy.policyType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(policy.effectiveDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        policy.status === 'Active' ? 'bg-green-900/50 text-green-300' : 
                        policy.status === 'Expired' ? 'bg-red-900/50 text-red-300' :
                        'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-400 hover:text-blue-300 font-medium text-sm mr-3">View</button>
                      <button className="text-yellow-400 hover:text-yellow-300 font-medium text-sm">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsuranceManagement;
