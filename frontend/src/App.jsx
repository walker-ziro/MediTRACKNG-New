import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';

import Login from './components/Login';
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
import BiometricLogin from './pages/patient/BiometricLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminDashboard from './pages/admin/AdminDashboard';
import { ProtectedProviderRoute, ProtectedPatientRoute, ProtectedAdminRoute } from './components/ProtectedPortalRoute';

// Layout Components
import ProviderLayout from './layouts/ProviderLayout';
import PatientLayout from './layouts/PatientLayout';

// Provider Pages
import ProviderPatients from './pages/provider/Patients';
import ProviderEncounters from './pages/provider/Encounters';
import ProviderPrescriptions from './pages/provider/Prescriptions';
import ProviderLabOrders from './pages/provider/LabOrders';
import ProviderTelemedicine from './pages/provider/Telemedicine';
import ProviderSettings from './pages/provider/Settings';

// Patient Pages
import PatientHealthRecords from './pages/patient/HealthRecords';
import PatientAppointments from './pages/patient/Appointments';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientTelemedicine from './pages/patient/Telemedicine';
import PatientFamilyHealth from './pages/patient/FamilyHealth';
import PatientSettings from './pages/patient/Settings';

// Admin Pages
import AdminUserManagement from './pages/admin/UserManagement';
import AdminProviderManagement from './pages/admin/ProviderManagement';
import AdminFacilityManagement from './pages/admin/FacilityManagement';
import AdminAnalytics from './pages/admin/Analytics';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminInsuranceManagement from './pages/admin/InsuranceManagement';
import AdminSettings from './pages/admin/Settings';
import AdminLayout from './layouts/AdminLayout';

function App() {
  const { theme } = useSettings();
  const darkMode = theme && theme.toLowerCase() === 'dark';
  return (

    <Router>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Routes>
          <Route path="/login" element={<Login />} />
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
            <Route path="patients" element={<ProviderPatients />} />
            <Route path="encounters" element={<ProviderEncounters />} />
            <Route path="prescriptions" element={<ProviderPrescriptions />} />
            <Route path="lab-orders" element={<ProviderLabOrders />} />
            <Route path="telemedicine" element={<ProviderTelemedicine />} />
            <Route path="settings" element={<ProviderSettings />} />
          </Route>
          
          {/* Patient Portal */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/biometric-login" element={<BiometricLogin />} />
          <Route path="/patient/signup" element={<PatientSignup />} />
          <Route path="/patient/*" element={
            <ProtectedPatientRoute>
              <PatientLayout />
            </ProtectedPatientRoute>
          }>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="health-records" element={<PatientHealthRecords />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="telemedicine" element={<PatientTelemedicine />} />
            <Route path="family-health" element={<PatientFamilyHealth />} />
            <Route path="settings" element={<PatientSettings />} />
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
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="providers" element={<AdminProviderManagement />} />
            <Route path="facilities" element={<AdminFacilityManagement />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="insurance" element={<AdminInsuranceManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>

  );
}

export default App;
