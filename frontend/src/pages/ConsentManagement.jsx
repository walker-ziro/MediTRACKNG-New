import { useState, useEffect } from 'react';
import { consentAPI, patientAPI, facilityAPI } from '../utils/api';
import '../styles/ConsentManagement.css';

const ConsentManagement = () => {
  const [consents, setConsents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newConsent, setNewConsent] = useState({
    patientHealthId: '',
    facilityId: '',
    consentType: 'Full Access',
    purpose: '',
    validUntil: '',
    grantedBy: 'Patient',
    scope: {
      demographics: true,
      medicalHistory: false,
      medications: false,
      allergies: false,
      labResults: false,
      radiologyImages: false,
      clinicalNotes: false,
      immunizations: false,
      vitalSigns: false
    }
  });

  useEffect(() => {
    fetchPatients();
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchConsents(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      setPatients(response.data || []);
      if (response.data?.length > 0) {
        setSelectedPatient(response.data[0].healthId);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchConsents = async (healthId) => {
    try {
      setLoading(true);
      const response = await consentAPI.getByPatient(healthId);
      setConsents(response.data || []);
    } catch (error) {
      console.error('Error fetching consents:', error);
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await consentAPI.create(newConsent);
      alert('Consent created successfully!');
      setShowModal(false);
      fetchConsents(selectedPatient);
      resetForm();
    } catch (error) {
      console.error('Error creating consent:', error);
      alert(error.response?.data?.message || 'Failed to create consent');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (consentId) => {
    if (!window.confirm('Are you sure you want to revoke this consent?')) return;
    
    try {
      setLoading(true);
      const reason = prompt('Please provide a reason for revocation:');
      if (!reason) return;
      
      await consentAPI.revoke(consentId, { reason });
      alert('Consent revoked successfully!');
      fetchConsents(selectedPatient);
    } catch (error) {
      console.error('Error revoking consent:', error);
      alert('Failed to revoke consent');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAccess = async () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    const facilityId = prompt('Enter Facility ID:');
    if (!facilityId) return;

    const justification = prompt('Enter emergency justification (minimum 10 characters):');
    if (!justification || justification.length < 10) {
      alert('Justification must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);
      await consentAPI.emergencyAccess({
        patientHealthId: selectedPatient,
        facilityId,
        justification
      });
      alert('Emergency access granted (24 hours). This will be audited.');
      fetchConsents(selectedPatient);
    } catch (error) {
      console.error('Error granting emergency access:', error);
      alert(error.response?.data?.message || 'Failed to grant emergency access');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewConsent({
      patientHealthId: selectedPatient,
      facilityId: '',
      consentType: 'Full Access',
      purpose: '',
      validUntil: '',
      grantedBy: 'Patient',
      scope: {
        demographics: true,
        medicalHistory: false,
        medications: false,
        allergies: false,
        labResults: false,
        radiologyImages: false,
        clinicalNotes: false,
        immunizations: false,
        vitalSigns: false
      }
    });
  };

  const filteredConsents = consents.filter(consent => {
    if (filter === 'active') return consent.status === 'Active';
    if (filter === 'expired') return consent.status === 'Expired';
    if (filter === 'revoked') return consent.status === 'Revoked';
    return true;
  }).filter(consent => {
    if (!searchTerm) return true;
    const facility = consent.facility?.name?.toLowerCase() || '';
    const type = consent.consentType?.toLowerCase() || '';
    return facility.includes(searchTerm.toLowerCase()) || type.includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'badge-success',
      'Expired': 'badge-warning',
      'Revoked': 'badge-danger'
    };
    return colors[status] || 'badge-secondary';
  };

  const getConsentTypeBadge = (type) => {
    const colors = {
      'Full Access': 'badge-primary',
      'Emergency Only': 'badge-danger',
      'Restricted': 'badge-warning',
      'View Only': 'badge-info',
      'Specific Encounter': 'badge-secondary'
    };
    return colors[type] || 'badge-secondary';
  };

  return (
    <div className="consent-management">
      <div className="page-header">
        <h1>Consent Management</h1>
        <p>Manage patient consent for data access across facilities</p>
      </div>

      {/* Patient Selection */}
      <div className="patient-selector card">
        <div className="card-header">
          <h3>Select Patient</h3>
        </div>
        <div className="card-body">
          <select 
            value={selectedPatient} 
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="form-select"
          >
            <option value="">-- Select Patient --</option>
            {patients.map(patient => (
              <option key={patient.healthId} value={patient.healthId}>
                {patient.healthId} - {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({consents.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({consents.filter(c => c.status === 'Active').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Expired ({consents.filter(c => c.status === 'Expired').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'revoked' ? 'active' : ''}`}
            onClick={() => setFilter('revoked')}
          >
            Revoked ({consents.filter(c => c.status === 'Revoked').length})
          </button>
        </div>

        <div className="action-buttons">
          <input
            type="text"
            placeholder="Search by facility or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            className="btn btn-warning"
            onClick={handleEmergencyAccess}
            disabled={!selectedPatient}
          >
            🚨 Emergency Access
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setNewConsent({ ...newConsent, patientHealthId: selectedPatient });
              setShowModal(true);
            }}
            disabled={!selectedPatient}
          >
            + Grant Consent
          </button>
        </div>
      </div>

      {/* Consents Table */}
      {loading ? (
        <div className="loading">Loading consents...</div>
      ) : filteredConsents.length === 0 ? (
        <div className="empty-state card">
          <p>No consents found for this patient</p>
          {selectedPatient && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Grant First Consent
            </button>
          )}
        </div>
      ) : (
        <div className="consents-grid">
          {filteredConsents.map(consent => (
            <div key={consent._id} className="consent-card card">
              <div className="card-header">
                <div className="facility-info">
                  <h4>{consent.facility?.name || 'Unknown Facility'}</h4>
                  <span className="facility-id">{consent.facility?.facilityId}</span>
                </div>
                <span className={`badge ${getStatusBadge(consent.status)}`}>
                  {consent.status}
                </span>
              </div>
              
              <div className="card-body">
                <div className="consent-detail">
                  <span className="label">Type:</span>
                  <span className={`badge ${getConsentTypeBadge(consent.consentType)}`}>
                    {consent.consentType}
                  </span>
                </div>
                
                <div className="consent-detail">
                  <span className="label">Purpose:</span>
                  <span>{consent.purpose}</span>
                </div>
                
                <div className="consent-detail">
                  <span className="label">Provider:</span>
                  <span>{consent.provider?.firstName} {consent.provider?.lastName}</span>
                </div>
                
                <div className="consent-detail">
                  <span className="label">Valid Until:</span>
                  <span>{new Date(consent.validUntil).toLocaleDateString()}</span>
                </div>
                
                <div className="consent-detail">
                  <span className="label">Granted By:</span>
                  <span>{consent.grantedBy}</span>
                </div>

                {consent.scope && (
                  <div className="scope-section">
                    <span className="label">Permissions:</span>
                    <div className="scope-badges">
                      {Object.entries(consent.scope).filter(([_, value]) => value).map(([key]) => (
                        <span key={key} className="scope-badge">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {consent.isEmergencyOverride && (
                  <div className="emergency-notice">
                    ⚠️ Emergency Override - Will be audited
                  </div>
                )}
              </div>

              <div className="card-footer">
                {consent.status === 'Active' && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRevokeConsent(consent._id)}
                  >
                    Revoke
                  </button>
                )}
                {consent.status === 'Revoked' && consent.revokedReason && (
                  <div className="revoke-reason">
                    <strong>Reason:</strong> {consent.revokedReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Consent Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Grant Consent</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateConsent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient</label>
                  <input 
                    type="text" 
                    value={selectedPatient} 
                    disabled 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Facility *</label>
                  <select
                    value={newConsent.facilityId}
                    onChange={(e) => setNewConsent({ ...newConsent, facilityId: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Facility --</option>
                    {facilities.map(facility => (
                      <option key={facility.facilityId} value={facility.facilityId}>
                        {facility.name} ({facility.facilityId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Consent Type *</label>
                  <select
                    value={newConsent.consentType}
                    onChange={(e) => setNewConsent({ ...newConsent, consentType: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="Full Access">Full Access</option>
                    <option value="Emergency Only">Emergency Only</option>
                    <option value="Restricted">Restricted</option>
                    <option value="View Only">View Only</option>
                    <option value="Specific Encounter">Specific Encounter</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Purpose *</label>
                  <textarea
                    value={newConsent.purpose}
                    onChange={(e) => setNewConsent({ ...newConsent, purpose: e.target.value })}
                    className="form-input"
                    rows="3"
                    required
                    placeholder="e.g., Primary care provider, Specialist referral, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Valid Until *</label>
                  <input
                    type="date"
                    value={newConsent.validUntil}
                    onChange={(e) => setNewConsent({ ...newConsent, validUntil: e.target.value })}
                    className="form-input"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Granted By *</label>
                  <select
                    value={newConsent.grantedBy}
                    onChange={(e) => setNewConsent({ ...newConsent, grantedBy: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="Patient">Patient</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Court Order">Court Order</option>
                    <option value="Emergency Protocol">Emergency Protocol</option>
                  </select>
                </div>

                {newConsent.consentType === 'Restricted' && (
                  <div className="form-group">
                    <label>Select Permissions</label>
                    <div className="checkbox-grid">
                      {Object.keys(newConsent.scope).map(key => (
                        <label key={key} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={newConsent.scope[key]}
                            onChange={(e) => setNewConsent({
                              ...newConsent,
                              scope: { ...newConsent.scope, [key]: e.target.checked }
                            })}
                          />
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Grant Consent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentManagement;
