import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TopBar from './TopBar';

const Layout = ({ children, currentPage }) => {
  const navigate = useNavigate();
  const { darkMode } = useApp();

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col overflow-hidden`}>
        {/* Fixed Logo Section */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} sticky top-0 z-10`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9V6h2v3h3v2h-3v3H9v-3H6V9h3z"/>
              </svg>
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>MediTRACKNG</span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto">
          <div 
            className={currentPage === 'dashboard' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/dashboard')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={currentPage === 'dashboard' ? 'font-medium' : ''}>Dashboard</span>
          </div>

          <div 
            className={currentPage === 'appointments' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/appointments')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={currentPage === 'appointments' ? 'font-medium' : ''}>Appointments</span>
          </div>

          <div 
            className={currentPage === 'emergency' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/emergency')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className={currentPage === 'emergency' ? 'font-medium' : ''}>Emergency</span>
          </div>

          <div 
            className={currentPage === 'patients' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/patients')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className={currentPage === 'patients' ? 'font-medium' : ''}>Patients</span>
          </div>

          <div 
            className={currentPage === 'laboratory' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/laboratory')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className={currentPage === 'laboratory' ? 'font-medium' : ''}>Laboratory</span>
          </div>

          <div 
            className={currentPage === 'pharmacy' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/pharmacy')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className={currentPage === 'pharmacy' ? 'font-medium' : ''}>Pharmacy</span>
          </div>

          <div 
            className={currentPage === 'doctors' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/doctors')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={currentPage === 'doctors' ? 'font-medium' : ''}>Doctors</span>
          </div>

          <div 
            className={currentPage === 'staffs' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/staffs')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={currentPage === 'staffs' ? 'font-medium' : ''}>Staffs</span>
          </div>

          <div 
            className={currentPage === 'bills' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/bills')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={currentPage === 'bills' ? 'font-medium' : ''}>Bills & Payments</span>
          </div>

          <div 
            className={currentPage === 'accounts' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/accounts')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className={currentPage === 'accounts' ? 'font-medium' : ''}>Accounts</span>
          </div>

          <div 
            className={currentPage === 'beds-rooms' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/beds-rooms')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={currentPage === 'beds-rooms' ? 'font-medium' : ''}>Beds & Rooms</span>
          </div>

          <div className="my-4 border-t border-gray-700 pt-4">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              National Health System
            </div>
          </div>

          <div 
            className={currentPage === 'facility-registration' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/facility-registration')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className={currentPage === 'facility-registration' ? 'font-medium' : ''}>Facility Registration</span>
          </div>

          <div 
            className={currentPage === 'consent-management' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/consent-management')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className={currentPage === 'consent-management' ? 'font-medium' : ''}>Consent Management</span>
          </div>

          <div 
            className={currentPage === 'patient-portal' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/patient-portal')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={currentPage === 'patient-portal' ? 'font-medium' : ''}>Patient Portal</span>
          </div>

          <div 
            className={currentPage === 'analytics-dashboard' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/analytics-dashboard')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className={currentPage === 'analytics-dashboard' ? 'font-medium' : ''}>Analytics</span>
          </div>

          <div 
            className={currentPage === 'audit-log-viewer' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/audit-log-viewer')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className={currentPage === 'audit-log-viewer' ? 'font-medium' : ''}>Audit Log</span>
          </div>

          <div className="my-4"></div>

          <div 
            className={currentPage === 'settings' ? 'sidebar-item-active' : 'sidebar-item'} 
            onClick={() => navigate('/settings')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={currentPage === 'settings' ? 'font-medium' : ''}>Settings</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
