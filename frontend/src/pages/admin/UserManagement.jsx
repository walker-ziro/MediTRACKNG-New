import { useSettings } from '../../context/SettingsContext';

const UserManagement = () => {
  const { theme, t } = useSettings();
  const darkMode = theme.toLowerCase() === 'dark';
  const users = [
    { id: 'USR-001', name: 'Dr. Sarah Johnson', role: 'Provider', email: 'sarah.j@example.com', status: 'Active', lastLogin: '2024-12-08 10:30 AM' },
    { id: 'USR-002', name: 'John Doe', role: 'Patient', email: 'john.doe@example.com', status: 'Active', lastLogin: '2024-12-08 09:15 AM' },
    { id: 'USR-003', name: 'Dr. Michael Chen', role: 'Provider', email: 'michael.c@example.com', status: 'Active', lastLogin: '2024-12-07 04:20 PM' },
    { id: 'USR-004', name: 'Jane Smith', role: 'Patient', email: 'jane.smith@example.com', status: 'Inactive', lastLogin: '2024-11-25 02:10 PM' },
  ];

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('userManagement')}</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage all users across the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
          <p className="text-3xl font-bold text-green-500 mt-1">{users.filter(u => u.status === 'Active').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Providers</p>
          <p className="text-3xl font-bold text-blue-500 mt-1">{users.filter(u => u.role === 'Provider').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('patients')}</p>
          <p className="text-3xl font-bold text-purple-500 mt-1">{users.filter(u => u.role === 'Patient').length}</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Provider' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-400 hover:text-blue-300 font-medium text-sm mr-3">View</button>
                    <button className="text-red-400 hover:text-red-300 font-medium text-sm">Suspend</button>
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

export default UserManagement;
