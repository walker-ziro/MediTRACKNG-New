import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure API_BASE_URL ends with /api
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`;
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests (Legacy support or if using localStorage)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we are not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
         // Clear local storage just in case
         localStorage.removeItem('token');
         localStorage.removeItem('provider');
         localStorage.removeItem('userData');
         localStorage.removeItem('userType');
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};



// Patient API (General)
export const patientAPI = {
  getAll: (params) => api.get('/patients', { params }),
  create: (data) => api.post('/patients', data),
  getByHealthId: (healthId) => api.get(`/patients/${healthId}`),
  getEncounters: (healthId) => api.get(`/patients/${healthId}/encounters`),
  update: (healthId, data) => api.put(`/patients/${healthId}`, data),
};

// Encounter API
export const encounterAPI = {
  create: (data) => api.post('/encounters', data),
  getById: (id) => api.get(`/encounters/${id}`),
  update: (id, data) => api.put(`/encounters/${id}`, data),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Message API
export const messageAPI = {
  getAll: () => api.get('/messages'),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getProviderStats: (providerId) => api.get(`/dashboard/provider-stats/${providerId}`),
  getAdminStats: () => api.get('/dashboard/admin-stats'),
  getTodayAppointments: () => api.get('/dashboard/appointments/today'),
  getDoctorsSchedule: () => api.get('/dashboard/doctors/schedule'),
  getPatientOverview: () => api.get('/dashboard/patients/overview'),
  getDepartmentOverview: () => api.get('/dashboard/departments/overview'),
  getFinancialOverview: () => api.get('/dashboard/financials/overview'),
};



// AI API
export const aiAPI = {
  generateInsights: () => api.post('/ai/generate-insights'),
  analyzePatient: (healthId) => api.post(`/ai/analyze-patient/${healthId}`),
};

// Appointment API
export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Emergency API
export const emergencyAPI = {
  getAll: (params) => api.get('/emergency', { params }),
  getById: (id) => api.get(`/emergency/${id}`),
  create: (data) => api.post('/emergency', data),
  update: (id, data) => api.put(`/emergency/${id}`, data),
  delete: (id) => api.delete(`/emergency/${id}`),
};

// Laboratory API
export const laboratoryAPI = {
  getAll: (params) => api.get('/laboratory', { params }),
  getById: (id) => api.get(`/laboratory/${id}`),
  create: (data) => api.post('/laboratory', data),
  update: (id, data) => api.put(`/laboratory/${id}`, data),
};

// Pharmacy API
export const pharmacyAPI = {
  getAll: (params) => api.get('/pharmacy', { params }),
  getById: (id) => api.get(`/pharmacy/${id}`),
  create: (data) => api.post('/pharmacy', data),
  update: (id, data) => api.put(`/pharmacy/${id}`, data),
};

// Doctors API
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
};

// Staff API
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
};

// Bills API
export const billsAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
};

// Transactions API
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getStats: (params) => api.get('/transactions/stats', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Beds API
export const bedAPI = {
  getAll: (params) => api.get('/beds', { params }),
  getStats: () => api.get('/beds/stats'),
  getById: (id) => api.get(`/beds/${id}`),
  create: (data) => api.post('/beds', data),
  update: (id, data) => api.put(`/beds/${id}`, data),
  delete: (id) => api.delete(`/beds/${id}`),
  assignPatient: (id, patientId) => api.post(`/beds/${id}/assign`, { patientId }),
  discharge: (id) => api.post(`/beds/${id}/discharge`),
};

// Rooms API
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getStats: () => api.get('/rooms/stats'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Consent API (National System)
export const consentAPI = {
  create: (data) => api.post('/consents', data),
  getByPatient: (healthId) => api.get(`/consents/patient/${healthId}`),
  checkConsent: (healthId, facilityId) => api.get(`/consents/check/${healthId}/${facilityId}`),
  revoke: (id, data) => api.post(`/consents/${id}/revoke`, data),
  emergencyAccess: (data) => api.post('/consents/emergency', data),
  getFacilityStats: (facilityId) => api.get(`/consents/stats/facility/${facilityId}`),
};

// Audit API (National System)
export const auditAPI = {
  getLogs: (params) => api.get('/audit/all', { params }),
  logAccess: (data) => api.post('/audit/log', data),
  getByPatient: (healthId, params) => api.get(`/audit/patient/${healthId}`, { params }),
  getSuspicious: (params) => api.get('/audit/suspicious', { params }),
  reviewLog: (id, data) => api.post(`/audit/${id}/review`, data),
  getFacilityStats: (facilityId, params) => api.get(`/audit/stats/facility/${facilityId}`, { params }),
  getProviderHistory: (providerId, params) => api.get(`/audit/provider/${providerId}`, { params }),
};

// Facility API (National System)
export const facilityAPI = {
  register: (data) => api.post('/facilities/register', data),
  getAll: (params) => api.get('/facilities', { params }),
  getById: (facilityId) => api.get(`/facilities/${facilityId}`),
  update: (facilityId, data) => api.put(`/facilities/${facilityId}`, data),
  updateSubscription: (facilityId, data) => api.post(`/facilities/${facilityId}/subscription`, data),
  addAdministrator: (facilityId, data) => api.post(`/facilities/${facilityId}/administrators`, data),
  updateIntegration: (facilityId, data) => api.post(`/facilities/${facilityId}/integration`, data),
  getStats: (facilityId) => api.get(`/facilities/${facilityId}/stats`),
  getOverview: () => api.get('/facilities/analytics/overview'),
};

// Analytics API (National System - Public Health)
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getDiseaseSurveillance: (params) => api.get('/analytics/disease-surveillance', { params }),
  getDemographics: () => api.get('/analytics/demographics'),
  getImmunizationCoverage: (params) => api.get('/analytics/immunization-coverage', { params }),
  getMedicationTrends: () => api.get('/analytics/medication-trends'),
  getFacilityPerformance: (params) => api.get('/analytics/facility-performance', { params }),
  getSystemUsage: (params) => api.get('/analytics/system-usage', { params }),
  getRegionalHealth: () => api.get('/analytics/regional-health'),
};

// Patient Portal API (National System - Citizens)
export const patientPortalAPI = {
  getProfile: (healthId) => api.get(`/patient-portal/profile/${healthId}`),
  getPrescriptions: (healthId) => api.get(`/prescriptions/patient/${healthId}`),
  getMedicalHistory: (healthId) => api.get(`/patient-portal/medical-history/${healthId}`),
  getMedications: (healthId) => api.get(`/patient-portal/medications/${healthId}`),
  getImmunizations: (healthId) => api.get(`/patient-portal/immunizations/${healthId}`),
  getEncounters: (healthId) => api.get(`/patient-portal/encounters/${healthId}`),
  getLabResults: (healthId) => api.get(`/patient-portal/lab-results/${healthId}`),
  getAppointments: (healthId) => api.get(`/patient-portal/appointments/${healthId}`),
  getConsents: (healthId) => api.get(`/patient-portal/consents/${healthId}`),
  getAccessLog: (healthId, params) => api.get(`/patient-portal/access-log/${healthId}`, { params }),
  revokeConsent: (consentId, data) => api.post(`/patient-portal/revoke-consent/${consentId}`, data),
  downloadRecord: (healthId, format) => api.get(`/patient-portal/download/${healthId}`, { 
    params: { format },
    responseType: format === 'pdf' ? 'blob' : 'json'
  }),
};

export default api;
