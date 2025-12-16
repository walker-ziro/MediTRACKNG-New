import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';
import { dashboardAPI, auditAPI } from '../../utils/api';

const AdminDashboard = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const { theme, t , darkMode } = useSettings();
  const { wrapRequest } = useApi();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeFacilities: 0,
    pendingApprovals: 0,
    systemAlerts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          wrapRequest(dashboardAPI.getAdminStats()),
          wrapRequest(auditAPI.getLogs({ limit: 5 }))
        ]);
        
        if (statsData) {
          setStats(statsData);
        }
        
        if (logsData && logsData.logs) {
          const formattedActivity = logsData.logs.map(log => ({
            action: log.actionType,
            user: `${log.accessedBy?.firstName} ${log.accessedBy?.lastName}`,
            time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: getActionIcon(log.actionType),
            color: getActionColor(log.actionType)
          }));
          setRecentActivity(formattedActivity);
        }
      } catch (error) {
        console.error('Failed to load admin stats', error);
      }
    };
    loadStats();
  }, []);

  const getActionIcon = (type) => {
    switch (type) {
      case 'CREATE': return 'plus-circle';
      case 'UPDATE': return 'edit';
      case 'DELETE': return 'trash';
      case 'LOGIN': return 'sign-in-alt';
      case 'APPROVE': return 'check-circle';
      default: return 'info-circle';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      case 'LOGIN': return 'purple';
      case 'APPROVE': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</h3>
            </div>
            <i className="fas fa-users text-blue-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg border-l-4 border-green-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Facilities</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeFacilities}</h3>
            </div>
            <i className="fas fa-hospital text-green-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Approvals</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pendingApprovals}</h3>
            </div>
            <i className="fas fa-clock text-yellow-500 text-2xl"></i>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg border-l-4 border-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>System Alerts</p>
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.systemAlerts}</h3>
            </div>
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Admin Info Card */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} p-6 rounded-lg mb-6 border`}>
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
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-lg border`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
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
                className={`flex items-center gap-3 p-3 border-2 ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} rounded-lg transition-colors`}
              >
                <i className={`fas fa-${action.icon} text-${action.color}-400`}></i>
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-lg border`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <Link to="/admin/audit-logs" key={idx} className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors block`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${activity.color}-900 rounded-full flex items-center justify-center`}>
                      <i className={`fas fa-${activity.icon} text-${activity.color}-400 text-sm`}></i>
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.user}</p>
                    </div>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</span>
                </Link>
              ))
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No recent activity recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Indicator */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-green-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fas fa-shield-alt text-green-400 text-xl"></i>
          <div>
            <p className="font-semibold text-white">Secure Session Active</p>
            <p className="text-xs text-gray-400">
              2FA Enabled • Last login: {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Just now'}
            </p>
          </div>
        </div>
        <span className="px-4 py-2 bg-green-900 text-green-200 rounded-full text-sm font-semibold">Protected</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
