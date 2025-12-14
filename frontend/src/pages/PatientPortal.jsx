import { useState } from 'react';
import { patientPortalAPI } from '../utils/api';
import '../styles/PatientPortal.css';

const PatientPortal = () => {
  const [healthId, setHealthId] = useState('');
  const [pin, setPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [patientData, setPatientData] = useState({
    profile: null,
    medicalHistory: null,
    medications: null,
    immunizations: null,
    encounters: null,
    labResults: null,
    appointments: null,
    consents: null,
    accessLog: null
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!healthId || !pin) {
      alert('Please enter both Health ID and PIN');
      return;
    }

    // TODO: Implement actual authentication
    // For now, we'll just validate format and fetch data
    if (!healthId.startsWith('MTN-')) {
      alert('Invalid Health ID format. Should start with MTN-');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all patient data
      const [profile, history, medications, immunizations, encounters, labs, appointments, consents, accessLog] = await Promise.all([
        patientPortalAPI.getProfile(healthId).catch(() => null),
        patientPortalAPI.getMedicalHistory(healthId).catch(() => null),
        patientPortalAPI.getMedications(healthId).catch(() => null),
        patientPortalAPI.getImmunizations(healthId).catch(() => null),
        patientPortalAPI.getEncounters(healthId).catch(() => null),
        patientPortalAPI.getLabResults(healthId).catch(() => null),
        patientPortalAPI.getAppointments(healthId).catch(() => null),
        patientPortalAPI.getConsents(healthId).catch(() => null),
        patientPortalAPI.getAccessLog(healthId).catch(() => null)
      ]);

      if (!profile) {
        alert('Patient not found or access denied');
        return;
      }

      setPatientData({
        profile: profile.data?.profile,
        medicalHistory: history?.data,
        medications: medications?.data,
        immunizations: immunizations?.data,
        encounters: encounters?.data?.encounters || [],
        labResults: labs?.data?.labResults || [],
        appointments: appointments?.data?.appointments || [],
        consents: consents?.data?.consents || [],
        accessLog: accessLog?.data?.accessLogs || []
      });

      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHealthId('');
    setPin('');
    setPatientData({
      profile: null,
      medicalHistory: null,
      medications: null,
      immunizations: null,
      encounters: null,
      labResults: null,
      appointments: null,
      consents: null,
      accessLog: null
    });
  };

  const handleDownloadRecords = async () => {
    try {
      setLoading(true);
      const response = await patientPortalAPI.downloadRecord(healthId, 'json');
      
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${healthId}_medical_record.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('Medical record downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download records');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (consentId) => {
    if (!window.confirm('Are you sure you want to revoke this consent?')) return;
    
    const reason = prompt('Please provide a reason for revocation:');
    if (!reason) return;

    try {
      setLoading(true);
      await patientPortalAPI.revokeConsent(consentId, { healthId, reason });
      alert('Consent revoked successfully!');
      
      // Refresh consents
      const consents = await patientPortalAPI.getConsents(healthId);
      setPatientData(prev => ({ ...prev, consents: consents.data?.consents || [] }));
    } catch (error) {
      console.error('Revoke error:', error);
      alert('Failed to revoke consent');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="patient-portal-login">
        <div className="login-container">
          <div className="login-header">
            <h1>🏥 MediTRACKNG</h1>
            <h2>Patient Portal</h2>
            <p>Access your medical records securely</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Health ID</label>
              <input
                type="text"
                value={healthId}
                onChange={(e) => setHealthId(e.target.value)}
                placeholder="MTN-XXXXXXX"
                className="form-input"
                required
              />
              <small>Format: MTN-XXXXXXX</small>
            </div>

            <div className="form-group">
              <label>PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="login-footer">
              <p>Don't have a PIN? <a href="#">Request one</a></p>
              <p>Forgot PIN? <a href="#">Reset it</a></p>
              <p className="biometric-link">🔐 <a href="#">Login with Biometric</a></p>
            </div>
          </form>

          <div className="login-info">
            <h3>🔒 Your Privacy is Protected</h3>
            <ul>
              <li>All access to your records is logged and monitored</li>
              <li>You can see who viewed your information</li>
              <li>You control who has access to your data</li>
              <li>Your data is encrypted and secure</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const profile = patientData.profile;

  return (
    <div className="patient-portal">
      {/* Header */}
      <div className="portal-header">
        <div className="patient-info">
          <div className="avatar">
            {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
          </div>
          <div>
            <h2>{profile?.firstName} {profile?.lastName}</h2>
            <p className="health-id">{profile?.healthId}</p>
            {profile?.biometricVerified && <span className="verified-badge">✓ Biometric Verified</span>}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleDownloadRecords} disabled={loading}>
            ⬇ Download Records
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="portal-tabs">
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          👤 Profile
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          📋 Medical History
        </button>
        <button className={activeTab === 'medications' ? 'active' : ''} onClick={() => setActiveTab('medications')}>
          💊 Medications
        </button>
        <button className={activeTab === 'encounters' ? 'active' : ''} onClick={() => setActiveTab('encounters')}>
          🏥 Encounters
        </button>
        <button className={activeTab === 'labs' ? 'active' : ''} onClick={() => setActiveTab('labs')}>
          🧪 Lab Results
        </button>
        <button className={activeTab === 'immunizations' ? 'active' : ''} onClick={() => setActiveTab('immunizations')}>
          💉 Immunizations
        </button>
        <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
          📅 Appointments
        </button>
        <button className={activeTab === 'consents' ? 'active' : ''} onClick={() => setActiveTab('consents')}>
          🔐 Access Control
        </button>
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
          📊 Access Log
        </button>
      </div>

      {/* Tab Content */}
      <div className="portal-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="info-card">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{profile?.firstName} {profile?.lastName}</p>
                </div>
                <div className="info-item">
                  <label>Date of Birth</label>
                  <p>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Gender</label>
                  <p>{profile?.gender}</p>
                </div>
                <div className="info-item">
                  <label>Blood Group</label>
                  <p>{profile?.bloodGroup || 'Not recorded'}</p>
                </div>
                <div className="info-item">
                  <label>Genotype</label>
                  <p>{profile?.genotype || 'Not recorded'}</p>
                </div>
                <div className="info-item">
                  <label>NIN Linked</label>
                  <p>{profile?.ninLinked ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Phone</label>
                  <p>{profile?.contact?.phone}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profile?.contact?.email || 'Not provided'}</p>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <p>{profile?.contact?.address}</p>
                </div>
                <div className="info-item">
                  <label>State</label>
                  <p>{profile?.contact?.state}</p>
                </div>
              </div>
            </div>

            {profile?.emergencyContact && (
              <div className="info-card">
                <h3>Emergency Contact</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <p>{profile.emergencyContact.name}</p>
                  </div>
                  <div className="info-item">
                    <label>Relationship</label>
                    <p>{profile.emergencyContact.relationship}</p>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <p>{profile.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <div className="info-card">
              <h3>Chronic Conditions</h3>
              {patientData.medicalHistory?.chronicConditions?.length > 0 ? (
                <div className="conditions-list">
                  {patientData.medicalHistory.chronicConditions.map((condition, idx) => (
                    <div key={idx} className="condition-item">
                      <strong>{condition.condition}</strong>
                      <p>Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}</p>
                      {condition.notes && <p className="notes">{condition.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No chronic conditions recorded</p>
              )}
            </div>

            <div className="info-card">
              <h3>Allergies</h3>
              {patientData.medicalHistory?.allergies?.length > 0 ? (
                <div className="allergies-list">
                  {patientData.medicalHistory.allergies.map((allergy, idx) => (
                    <div key={idx} className="allergy-item">
                      <span className={`severity-badge ${allergy.severity?.toLowerCase()}`}>
                        {allergy.allergen}
                      </span>
                      <span className="severity">{allergy.severity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No allergies recorded</p>
              )}
            </div>

            <div className="info-card">
              <h3>Past Surgeries</h3>
              {patientData.medicalHistory?.surgeries?.length > 0 ? (
                <div className="surgeries-list">
                  {patientData.medicalHistory.surgeries.map((surgery, idx) => (
                    <div key={idx} className="surgery-item">
                      <strong>{surgery.surgeryName}</strong>
                      <p>Date: {new Date(surgery.date).toLocaleDateString()}</p>
                      {surgery.surgeon && <p>Surgeon: {surgery.surgeon}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No surgeries recorded</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="medications-section">
            <div className="info-card">
              <h3>Current Medications</h3>
              {patientData.medications?.currentMedications?.length > 0 ? (
                <div className="medications-list">
                  {patientData.medications.currentMedications.map((med, idx) => (
                    <div key={idx} className="medication-item">
                      <div className="med-header">
                        <strong>{med.medicationName}</strong>
                        <span className="dosage">{med.dosage}</span>
                      </div>
                      <p>Frequency: {med.frequency}</p>
                      <p>Started: {new Date(med.startDate).toLocaleDateString()}</p>
                      {med.endDate && <p>End: {new Date(med.endDate).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No current medications</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="encounters-section">
            {patientData.encounters?.length > 0 ? (
              <div className="encounters-list">
                {patientData.encounters.map((encounter) => (
                  <div key={encounter.id} className="encounter-card info-card">
                    <div className="encounter-header">
                      <div>
                        <h4>{encounter.type}</h4>
                        <p className="date">{new Date(encounter.date).toLocaleDateString()}</p>
                      </div>
                      <span className="facility-badge">{encounter.facility?.name}</span>
                    </div>
                    <div className="encounter-body">
                      <p><strong>Chief Complaint:</strong> {encounter.chiefComplaint}</p>
                      {encounter.diagnosis && (
                        <p><strong>Diagnosis:</strong> {
                          Array.isArray(encounter.diagnosis) 
                            ? encounter.diagnosis.map(d => d.description || d.code).join(', ') 
                            : encounter.diagnosis
                        }</p>
                      )}
                      <p><strong>Provider:</strong> Dr. {encounter.provider?.firstName} {encounter.provider?.lastName}</p>
                      {encounter.prescriptions?.length > 0 && (
                        <div className="prescriptions">
                          <strong>Prescriptions:</strong>
                          <ul>
                            {encounter.prescriptions.map((rx, idx) => (
                              <li key={idx}>{rx.medication} - {rx.dosage}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No encounters found</p>
            )}
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="labs-section">
            {patientData.labResults?.length > 0 ? (
              <div className="labs-list">
                {patientData.labResults.map((lab) => (
                  <div key={lab.id} className="lab-card info-card">
                    <div className="lab-header">
                      <h4>{lab.testName}</h4>
                      <span className={`status-badge ${lab.status?.toLowerCase()}`}>
                        {lab.status}
                      </span>
                    </div>
                    <div className="lab-body">
                      <p><strong>Type:</strong> {lab.testType}</p>
                      <p><strong>Ordered:</strong> {new Date(lab.dateOrdered).toLocaleDateString()}</p>
                      {lab.dateCompleted && (
                        <p><strong>Completed:</strong> {new Date(lab.dateCompleted).toLocaleDateString()}</p>
                      )}
                      {lab.results && (
                        <div className="results">
                          <strong>Results:</strong>
                          <p>{lab.results}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No lab results found</p>
            )}
          </div>
        )}

        {activeTab === 'immunizations' && (
          <div className="immunizations-section">
            <div className="info-card">
              <h3>Immunization Records</h3>
              {patientData.immunizations?.immunizations?.length > 0 ? (
                <div className="immunizations-list">
                  {patientData.immunizations.immunizations.map((imm, idx) => (
                    <div key={idx} className="immunization-item">
                      <strong>{imm.vaccineName}</strong>
                      <p>Date: {new Date(imm.dateAdministered).toLocaleDateString()}</p>
                      <p>Dose: {imm.doseNumber}</p>
                      {imm.facility && <p>Facility: {imm.facility.name}</p>}
                      {imm.batchNumber && <p>Batch: {imm.batchNumber}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No immunization records</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-section">
            {patientData.appointments?.length > 0 ? (
              <div className="appointments-list">
                {patientData.appointments.map((appt) => (
                  <div key={appt.id} className="appointment-card info-card">
                    <div className="appointment-header">
                      <div>
                        <h4>{appt.department}</h4>
                        <p>{new Date(appt.date).toLocaleDateString()} at {appt.time}</p>
                      </div>
                      <span className={`status-badge ${appt.status?.toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="appointment-body">
                      <p><strong>Doctor:</strong> Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</p>
                      {appt.reason && <p><strong>Reason:</strong> {appt.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No appointments found</p>
            )}
          </div>
        )}

        {activeTab === 'consents' && (
          <div className="consents-section">
            <div className="info-card">
              <h3>Who Has Access to Your Records</h3>
              <p className="info-text">
                You can see and control which facilities have access to your medical records.
              </p>
              {patientData.consents?.length > 0 ? (
                <div className="consents-list">
                  {patientData.consents.map((consent) => (
                    <div key={consent.id} className="consent-card">
                      <div className="consent-header">
                        <div>
                          <h4>{consent.facility?.name}</h4>
                          <p className="facility-id">{consent.facility?.facilityId}</p>
                        </div>
                        <span className={`status-badge ${consent.status?.toLowerCase()}`}>
                          {consent.status}
                        </span>
                      </div>
                      <div className="consent-body">
                        <p><strong>Type:</strong> {consent.consentType}</p>
                        <p><strong>Purpose:</strong> {consent.purpose}</p>
                        <p><strong>Valid Until:</strong> {new Date(consent.validUntil).toLocaleDateString()}</p>
                        {consent.status === 'Active' && (
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRevokeConsent(consent.id)}
                            disabled={loading}
                          >
                            Revoke Access
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No active consents</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="audit-section">
            <div className="info-card">
              <h3>Who Accessed Your Records</h3>
              <p className="info-text">
                Complete log of everyone who viewed or modified your medical information.
              </p>
              {patientData.accessLog?.length > 0 ? (
                <div className="audit-list">
                  {patientData.accessLog.map((log, idx) => (
                    <div key={idx} className="audit-item">
                      <div className="audit-header">
                        <span className="timestamp">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className={`action-badge ${log.accessResult?.toLowerCase()}`}>
                          {log.actionType}
                        </span>
                      </div>
                      <div className="audit-body">
                        <p><strong>Provider:</strong> Dr. {log.accessedBy?.firstName} {log.accessedBy?.lastName}</p>
                        <p><strong>Facility:</strong> {log.facility?.name}</p>
                        <p><strong>Resource:</strong> {log.resourceType}</p>
                        {log.wasEmergencyAccess && (
                          <span className="emergency-badge">⚠️ Emergency Access</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No access records found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;
