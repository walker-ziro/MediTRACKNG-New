import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientRecord from './components/PatientRecord';
import NewEncounterForm from './components/NewEncounterForm';
import Laboratory from './components/Laboratory';
import Patients from './components/Patients';
import Doctors from './components/Doctors';
import Appointments from './components/Appointments';
import Emergency from './components/Emergency';
import Pharmacy from './components/Pharmacy';
import Staffs from './components/Staffs';
import Bills from './components/Bills';
import Accounts from './components/Accounts';
import BedsRooms from './components/BedsRooms';
import Settings from './components/Settings';
import ConsentManagement from './pages/ConsentManagement';
import PatientPortal from './pages/PatientPortal';
import AuditLogViewer from './pages/AuditLogViewer';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import FacilityRegistration from './pages/FacilityRegistration';
import PrivateRoute from './components/PrivateRoute';

// Three-Portal Architecture
import LandingPage from './pages/LandingPage';
import ProviderLogin from './pages/ProviderLogin';
import ProviderSignup from './pages/provider/ProviderSignup';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import PatientLogin from './pages/patient/PatientLogin';
import PatientSignup from './pages/patient/PatientSignup';
import PatientDashboard from './pages/patient/PatientDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminDashboard from './pages/admin/AdminDashboard';
import { ProtectedProviderRoute, ProtectedPatientRoute, ProtectedAdminRoute } from './components/ProtectedPortalRoute';

// Layout Components
import ProviderLayout from './layouts/ProviderLayout';
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/:healthId"
            element={
              <PrivateRoute>
                <PatientRecord />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/:healthId/new-encounter"
            element={
              <PrivateRoute>
                <NewEncounterForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/laboratory"
            element={
              <PrivateRoute>
                <Laboratory />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute>
                <Patients />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <PrivateRoute>
                <Doctors />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/emergency"
            element={
              <PrivateRoute>
                <Emergency />
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacy"
            element={
              <PrivateRoute>
                <Pharmacy />
              </PrivateRoute>
            }
          />
          <Route
            path="/staffs"
            element={
              <PrivateRoute>
                <Staffs />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <PrivateRoute>
                <Bills />
              </PrivateRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <PrivateRoute>
                <Accounts />
              </PrivateRoute>
            }
          />
          <Route
            path="/beds-rooms"
            element={
              <PrivateRoute>
                <BedsRooms />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/consent-management"
            element={
              <PrivateRoute>
                <ConsentManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient-portal"
            element={
              <PatientPortal />
            }
          />
          <Route
            path="/audit-log-viewer"
            element={
              <PrivateRoute>
                <AuditLogViewer />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics-dashboard"
            element={
              <PrivateRoute>
                <AnalyticsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/facility-registration"
            element={
              <PrivateRoute>
                <FacilityRegistration />
              </PrivateRoute>
            }
          />
          
          {/* Three-Portal Routes */}
          <Route path="/home" element={<LandingPage />} />
          
          {/* Provider Portal */}
          <Route path="/provider/login" element={<ProviderLogin />} />
          <Route path="/provider/signup" element={<ProviderSignup />} />
          <Route path="/provider/*" element={
            <ProtectedProviderRoute>
              <ProviderLayout />
            </ProtectedProviderRoute>
          }>
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="patients" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Patients</h1><p className="text-gray-600 mt-4">Patient list page coming soon...</p></div>} />
            <Route path="encounters" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Encounters</h1><p className="text-gray-600 mt-4">Encounters page coming soon...</p></div>} />
            <Route path="prescriptions" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Prescriptions</h1><p className="text-gray-600 mt-4">Prescriptions page coming soon...</p></div>} />
            <Route path="lab-orders" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Lab Orders</h1><p className="text-gray-600 mt-4">Lab orders page coming soon...</p></div>} />
            <Route path="telemedicine" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Telemedicine</h1><p className="text-gray-600 mt-4">Telemedicine page coming soon...</p></div>} />
            <Route path="settings" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Settings</h1><p className="text-gray-600 mt-4">Settings page coming soon...</p></div>} />
          </Route>
          
          {/* Patient Portal */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/signup" element={<PatientSignup />} />
          <Route path="/patient/*" element={
            <ProtectedPatientRoute>
              <PatientLayout />
            </ProtectedPatientRoute>
          }>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="health-records" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Health Records</h1><p className="text-gray-600 mt-4">Health records page coming soon...</p></div>} />
            <Route path="appointments" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Appointments</h1><p className="text-gray-600 mt-4">Appointments page coming soon...</p></div>} />
            <Route path="prescriptions" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Prescriptions</h1><p className="text-gray-600 mt-4">Prescriptions page coming soon...</p></div>} />
            <Route path="telemedicine" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Telemedicine</h1><p className="text-gray-600 mt-4">Telemedicine page coming soon...</p></div>} />
            <Route path="family-health" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Family Health</h1><p className="text-gray-600 mt-4">Family health page coming soon...</p></div>} />
            <Route path="settings" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-800">Settings</h1><p className="text-gray-600 mt-4">Settings page coming soon...</p></div>} />
          </Route>
          
          {/* Admin Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/*" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<div className="p-8 bg-gray-900 min-h-screen"><h1 className="text-3xl font-bold text-white">User Management</h1><p className="text-gray-400 mt-4">User management page coming soon...</p></div>} />
            <Route path="providers" element={<div className="p-8 bg-gray-900 min-h-screen"><h1 className="text-3xl font-bold text-white">Provider Management</h1><p className="text-gray-400 mt-4">Provider management page coming soon...</p></div>} />
            <Route path="facilities" element={<div className="p-8 bg-gray-900 min-h-screen"><h1 className="text-3xl font-bold text-white">Facilities</h1><p className="text-gray-400 mt-4">Facilities page coming soon...</p></div>} />
            <Route path="analytics" element={<div className="p-8 bg-gray-900 min-h-screen"><h1 className="text-3xl font-bold text-white">Analytics</h1><p className="text-gray-400 mt-4">Analytics page coming soon...</p></div>} />
            <Route path="audit-logs" element={<div className="p-8 bg-gray-900 min-h-screen"><h1 className="text-3xl font-bold text-white">Audit Logs</h1><p className="text-gray-400 mt-4">Audit logs page coming soon...</p></div>} />
            <Route path="insurance" element={<div className="p-8 bg-gray-900 min-h-screen"><h1 className="text-3xl font-bold text-white">Insurance</h1><p className="text-gray-400 mt-4">Insurance page coming soon...</p></div>} />
            <Route path="settings" element={<div className="p-8 bg-gray-900 min-h-screen"><h1 className="text-3xl font-bold text-white">Settings</h1><p className="text-gray-400 mt-4">Settings page coming soon...</p></div>} />
          </Route>
          
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
    </AppProvider>
  );
}

export default App;
