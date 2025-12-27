import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const AuditLogs = () => {
  const { theme, t, darkMode } = useSettings();
  const { fetchData } = useApi();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Default to 'all' to show activity immediately

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        // Use the suspicious endpoint for now as it's the most relevant for admins
        // Ideally we'd have a generic /audit endpoint with filters
        const endpoint = filter === 'suspicious' ? '/audit/suspicious' : '/audit/all'; 
        const data = await fetchData(endpoint);
        
        if (data && data.logs) {
          setLogs(data.logs);
        } else if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (error) {
        console.error('Failed to load audit logs', error);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [filter]);

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security Audit Logs</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor system access and suspicious activities</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('suspicious')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'suspicious'
              ? 'bg-red-600 text-white'
              : (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border')
          }`}
        >
          Suspicious Activities
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border')
          }`}
        >
          All Logs
        </button>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Timestamp</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>User</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Action</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resource</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Details</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className={`px-6 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`px-6 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.suspicious ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-900/50 text-red-300 border border-red-800">
                          Suspicious
                        </span>
                      ) : log.wasEmergencyAccess ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-900/50 text-orange-300 border border-orange-800">
                          Emergency
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {log.accessedBy?.firstName} {log.accessedBy?.lastName}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{log.accessedBy?.role || 'User'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.actionType === 'Delete' ? 'bg-red-900/50 text-red-300' :
                        log.actionType === 'Update' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-blue-900/50 text-blue-300'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.resourceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.accessResult === 'Success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                      }`}>
                        {log.accessResult}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className={`text-blue-400 ${darkMode ? 'hover:text-blue-300' : 'hover:text-blue-600'} hover:underline focus:outline-none`}
                      >
                        {log.suspiciousReason ? 'View Alert' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Log Details
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Timestamp</label>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Log Type</label>
                  <div className="flex items-center gap-2">
                    {selectedLog.suspicious && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-300 border border-red-800">
                        Suspicious
                      </span>
                    )}
                    {selectedLog.wasEmergencyAccess && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-900/50 text-orange-300 border border-orange-800">
                        Emergency
                      </span>
                    )}
                    {!selectedLog.suspicious && !selectedLog.wasEmergencyAccess && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        Standard
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">User</label>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedLog.accessedBy?.firstName} {selectedLog.accessedBy?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{selectedLog.accessedBy?.role || 'User'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Action</label>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedLog.actionType} on {selectedLog.resourceType}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3 uppercase`}>Access Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`text-sm font-medium ${
                      selectedLog.accessResult === 'Success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedLog.accessResult}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">IP Address:</span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedLog.ipAddress || 'N/A'}
                    </span>
                  </div>
                  {selectedLog.suspiciousReason && (
                    <div className={`pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className="block text-sm text-red-400 font-medium mb-1">Suspicious Activity Reason:</span>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedLog.suspiciousReason}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Raw Data</label>
                <pre className={`p-4 rounded-lg text-xs overflow-x-auto ${darkMode ? 'bg-black text-green-400' : 'bg-gray-100 text-gray-800'}`}>
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <button
                onClick={() => setSelectedLog(null)}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
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

export default AuditLogs;
