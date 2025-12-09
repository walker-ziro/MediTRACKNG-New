import { useSettings } from '../../context/SettingsContext';

const LabOrders = () => {
  const { theme, t } = useSettings();
  const darkMode = theme.toLowerCase() === 'dark';
  const labOrders = [
    { id: 'LAB-001', patient: 'John Doe', healthId: 'HID-20241208-001', test: 'Complete Blood Count (CBC)', priority: 'Routine', date: '2024-12-08', status: 'Pending' },
    { id: 'LAB-002', patient: 'Jane Smith', healthId: 'HID-20241208-002', test: 'Lipid Panel', priority: 'Routine', date: '2024-12-05', status: 'Completed' },
    { id: 'LAB-003', patient: 'Michael Johnson', healthId: 'HID-20241207-003', test: 'HbA1c Test', priority: 'Urgent', date: '2024-12-07', status: 'In Progress' },
    { id: 'LAB-004', patient: 'Sarah Williams', healthId: 'HID-20241206-004', test: 'Thyroid Function Test', priority: 'Routine', date: '2024-12-06', status: 'Completed' },
  ];

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('labOrders')}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage and track laboratory test orders</p>
      </div>

      <div className={`rounded-xl shadow-sm border p-6 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + New Lab Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Total Orders</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>{labOrders.length}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{labOrders.filter(l => l.status === 'Pending').length}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{labOrders.filter(l => l.status === 'In Progress').length}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{labOrders.filter(l => l.status === 'Completed').length}</p>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Order ID</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Patient</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Test Name</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Priority</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Order Date</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {labOrders.map((order) => (
                <tr key={order.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{order.patient}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.healthId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{order.test}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{order.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-2">View</button>
                    {order.status === 'Completed' && (
                      <button className="text-green-600 hover:text-green-800 font-medium text-sm">Results</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LabOrders;
