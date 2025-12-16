import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/Modal';

const UserManagement = () => {
  const { theme, t , darkMode } = useSettings();
  const { fetchData, putData } = useApi();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await fetchData('/auth/users');
      if (data) {
        const formattedUsers = data.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          email: u.email,
          status: u.status,
          lastLogin: new Date(u.lastLogin).toLocaleString()
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSuspend = async (userId) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      try {
        await putData(`/auth/users/${userId}/suspend`, {});
        showNotification('User suspended successfully', 'success');
        loadUsers();
      } catch (error) {
        console.error('Failed to suspend user', error);
      }
    }
  };

  const handleActivate = async (userId) => {
    if (window.confirm('Are you sure you want to activate this user?')) {
      try {
        await putData(`/auth/users/${userId}/activate`, {});
        showNotification('User activated successfully', 'success');
        loadUsers();
      } catch (error) {
        console.error('Failed to activate user', error);
      }
    }
  };

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
            <thead className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
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
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {users.map((user) => (
                <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{user.id}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Provider' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleView(user)} className="text-blue-400 hover:text-blue-300 font-medium text-sm mr-3">View</button>
                    {user.status === 'Active' ? (
                      <button onClick={() => handleSuspend(user.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Suspend</button>
                    ) : (
                      <button onClick={() => handleActivate(user.id)} className="text-green-400 hover:text-green-300 font-medium text-sm">Activate</button>
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
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>User ID</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.id}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.name}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.email}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.role}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
              <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                selectedUser.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'
              }`}>
                {selectedUser.status}
              </span>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Login</label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.lastLogin}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
