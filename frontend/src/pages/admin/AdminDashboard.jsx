import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const AdminDashboard = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const { theme, t } = useSettings();
  const darkMode = theme.toLowerCase() === 'dark';

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Header */}
      <header className={`shadow-lg p-6 rounded-lg mb-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('dashboard')}</h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>System Overview and Management</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`p-6 rounded-lg shadow-lg border-l-4 border-blue-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>12,487</h3>
            </div>
            <i className="fas fa-users text-blue-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg border-l-4 border-green-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Facilities</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>243</h3>
            </div>
            <i className="fas fa-hospital text-green-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Approvals</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>18</h3>
            </div>
            <i className="fas fa-clock text-yellow-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg border-l-4 border-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>System Alerts</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>3</h3>
            </div>
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Admin Info Card */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-lg mb-6 border border-red-700">
        <h2 className="text-xl font-bold mb-4">Administrator Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="opacity-80">Admin ID</p>
            <p className="font-semibold">{userData.adminId || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Role</p>
            <p className="font-semibold">{userData.role || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Admin Level</p>
            <p className="font-semibold">{userData.adminLevel || 'N/A'}</p>
          </div>
          <div>
            <p className="opacity-80">Jurisdiction</p>
            <p className="font-semibold">{userData.jurisdiction?.state || userData.jurisdiction?.facilityName || 'National'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: 'user-check', label: 'Approve New Providers', color: 'green', link: '/admin/providers' },
              { icon: 'hospital', label: 'Manage Facilities', color: 'blue', link: '/admin/facilities' },
              { icon: 'chart-line', label: 'View Analytics', color: 'purple', link: '/admin/analytics' },
              { icon: 'clipboard-list', label: 'Audit Logs', color: 'yellow', link: '/admin/audit-logs' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.link}
                className={`flex items-center gap-3 p-3 border-2 border-gray-700 hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <i className={`fas fa-${action.icon} text-${action.color}-400`}></i>
                <span className="font-medium text-gray-200">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'Provider approved', user: 'Dr. John Doe', time: '5 min ago', icon: 'check-circle', color: 'green' },
              { action: 'Facility registered', user: 'Lagos General Hospital', time: '1 hour ago', icon: 'hospital', color: 'blue' },
              { action: 'User deactivated', user: 'Jane Smith', time: '2 hours ago', icon: 'user-times', color: 'red' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${activity.color}-900 rounded-full flex items-center justify-center`}>
                    <i className={`fas fa-${activity.icon} text-${activity.color}-400 text-sm`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Indicator */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-green-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fas fa-shield-alt text-green-400 text-xl"></i>
          <div>
            <p className="font-semibold text-white">Secure Session Active</p>
            <p className="text-xs text-gray-400">2FA Enabled • Last login: Today at 9:15 AM</p>
          </div>
        </div>
        <span className="px-4 py-2 bg-green-900 text-green-200 rounded-full text-sm font-semibold">Protected</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
