import { useState, useEffect } from 'react';
import './EPrescription.css';

const API_URL = 'http://localhost:5000/api';

const EPrescription = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Form states
  const [formData, setFormData] = useState({
    patientHealthId: '',
    providerId: '',
    providerName: '',
    medications: [{
      drugName: '',
      genericName: '',
      brandName: '',
      dosage: { amount: '', unit: 'mg' },
      form: 'Tablet',
      frequency: 'Once Daily',
      route: 'Oral',
      duration: { value: '', unit: 'days' },
      quantity: '',
      refills: 0,
      instructions: ''
    }],
    diagnosis: '',
    notes: ''
  });

  const [interactionCheck, setInteractionCheck] = useState({ warnings: [], checked: false });

  // Fetch patient prescriptions
  const fetchPrescriptions = async (healthId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prescriptions/patient/${healthId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check drug interactions
  const checkInteractions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prescriptions/check-interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientHealthId: formData.patientHealthId,
          medications: formData.medications.map(m => m.drugName)
        })
      });
      
      const data = await response.json();
      
      if (data.interactions?.length > 0 || data.allergies?.length > 0 || data.contraindications?.length > 0) {
        const warnings = [
          ...data.interactions || [],
          ...data.allergies || [],
          ...data.contraindications || []
        ];
        setInteractionCheck({ warnings, checked: true });
        setMessage({ text: `⚠️ ${warnings.length} potential issue(s) found!`, type: 'warning' });
      } else {
        setInteractionCheck({ warnings: [], checked: true });
        setMessage({ text: '✓ No drug interactions detected', type: 'success' });
      }
    } catch (error) {
      setMessage({ text: 'Error checking interactions', type: 'error' });
    }
  };

  // Create prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    
    if (!interactionCheck.checked) {
      setMessage({ text: 'Please check drug interactions first', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: '✓ Prescription created successfully', type: 'success' });
        // Reset form
        setFormData({
          ...formData,
          medications: [{
            drugName: '',
            genericName: '',
            brandName: '',
            dosage: { amount: '', unit: 'mg' },
            form: 'Tablet',
            frequency: 'Once Daily',
            route: 'Oral',
            duration: { value: '', unit: 'days' },
            quantity: '',
            refills: 0,
            instructions: ''
          }],
          diagnosis: '',
          notes: ''
        });
        setInteractionCheck({ warnings: [], checked: false });
        setActiveTab('view');
        fetchPrescriptions(formData.patientHealthId);
      } else {
        setMessage({ text: data.message || 'Error creating prescription', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error creating prescription', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Add medication
  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, {
        drugName: '',
        genericName: '',
        brandName: '',
        dosage: { amount: '', unit: 'mg' },
        form: 'Tablet',
        frequency: 'Once Daily',
        route: 'Oral',
        duration: { value: '', unit: 'days' },
        quantity: '',
        refills: 0,
        instructions: ''
      }]
    });
    setInteractionCheck({ warnings: [], checked: false });
  };

  // Remove medication
  const removeMedication = (index) => {
    const newMeds = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMeds });
    setInteractionCheck({ warnings: [], checked: false });
  };

  // Update medication
  const updateMedication = (index, field, value) => {
    const newMeds = [...formData.medications];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newMeds[index][parent][child] = value;
    } else {
      newMeds[index][field] = value;
    }
    
    setFormData({ ...formData, medications: newMeds });
    setInteractionCheck({ warnings: [], checked: false });
  };

  // Send to pharmacy
  const sendToPharmacy = async (prescriptionId, pharmacyInfo) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prescriptions/${prescriptionId}/send-to-pharmacy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pharmacyInfo)
      });
      
      if (response.ok) {
        setMessage({ text: '✓ Prescription sent to pharmacy', type: 'success' });
        fetchPrescriptions(formData.patientHealthId);
      }
    } catch (error) {
      setMessage({ text: 'Error sending to pharmacy', type: 'error' });
    }
  };

  return (
    <div className="eprescription-container">
      <div className="eprescription-header">
        <h1>📋 E-Prescription System</h1>
        <p>Digital prescription management with drug interaction checking</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          Create Prescription
        </button>
        <button 
          className={activeTab === 'view' ? 'active' : ''}
          onClick={() => setActiveTab('view')}
        >
          View Prescriptions
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="prescription-form">
          <form onSubmit={handleCreatePrescription}>
            <div className="form-section">
              <h3>Patient & Provider Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient Health ID *</label>
                  <input
                    type="text"
                    value={formData.patientHealthId}
                    onChange={(e) => setFormData({ ...formData, patientHealthId: e.target.value })}
                    required
                    placeholder="HID-XXXXXXXX"
                  />
                </div>
                <div className="form-group">
                  <label>Provider ID *</label>
                  <input
                    type="text"
                    value={formData.providerId}
                    onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Provider Name *</label>
                  <input
                    type="text"
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Diagnosis</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g., Hypertension, Type 2 Diabetes"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Medications</h3>
                <button type="button" onClick={addMedication} className="btn-add">
                  + Add Medication
                </button>
              </div>

              {formData.medications.map((med, index) => (
                <div key={index} className="medication-card">
                  <div className="card-header">
                    <h4>Medication {index + 1}</h4>
                    {formData.medications.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeMedication(index)}
                        className="btn-remove"
                      >
                        × Remove
                      </button>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Drug Name *</label>
                      <input
                        type="text"
                        value={med.drugName}
                        onChange={(e) => updateMedication(index, 'drugName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Generic Name</label>
                      <input
                        type="text"
                        value={med.genericName}
                        onChange={(e) => updateMedication(index, 'genericName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Brand Name</label>
                      <input
                        type="text"
                        value={med.brandName}
                        onChange={(e) => updateMedication(index, 'brandName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Form *</label>
                      <select
                        value={med.form}
                        onChange={(e) => updateMedication(index, 'form', e.target.value)}
                        required
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Injection">Injection</option>
                        <option value="Cream">Cream</option>
                        <option value="Drops">Drops</option>
                        <option value="Inhaler">Inhaler</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Dosage Amount *</label>
                      <input
                        type="number"
                        value={med.dosage.amount}
                        onChange={(e) => updateMedication(index, 'dosage.amount', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Dosage Unit *</label>
                      <select
                        value={med.dosage.unit}
                        onChange={(e) => updateMedication(index, 'dosage.unit', e.target.value)}
                        required
                      >
                        <option value="mg">mg</option>
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="mcg">mcg</option>
                        <option value="IU">IU</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Frequency *</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        required
                      >
                        <option value="Once Daily">Once Daily</option>
                        <option value="Twice Daily">Twice Daily</option>
                        <option value="Three Times Daily">Three Times Daily</option>
                        <option value="Four Times Daily">Four Times Daily</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="As Needed">As Needed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Route *</label>
                      <select
                        value={med.route}
                        onChange={(e) => updateMedication(index, 'route', e.target.value)}
                        required
                      >
                        <option value="Oral">Oral</option>
                        <option value="IV">IV</option>
                        <option value="IM">IM</option>
                        <option value="SC">SC</option>
                        <option value="Topical">Topical</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Sublingual">Sublingual</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Duration *</label>
                      <input
                        type="number"
                        value={med.duration.value}
                        onChange={(e) => updateMedication(index, 'duration.value', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration Unit *</label>
                      <select
                        value={med.duration.unit}
                        onChange={(e) => updateMedication(index, 'duration.unit', e.target.value)}
                        required
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        value={med.quantity}
                        onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Refills</label>
                      <input
                        type="number"
                        value={med.refills}
                        onChange={(e) => updateMedication(index, 'refills', parseInt(e.target.value))}
                        min="0"
                        max="12"
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Instructions</label>
                    <textarea
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food, Avoid alcohol"
                      rows="2"
                    />
                  </div>
                </div>
              ))}
            </div>

            {interactionCheck.warnings.length > 0 && (
              <div className="warnings-section">
                <h3>⚠️ Warnings Detected</h3>
                {interactionCheck.warnings.map((warning, index) => (
                  <div key={index} className="warning-item">
                    {warning}
                  </div>
                ))}
              </div>
            )}

            <div className="form-section">
              <div className="form-group full-width">
                <label>Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={checkInteractions}
                className="btn-secondary"
                disabled={loading || !formData.patientHealthId}
              >
                Check Drug Interactions
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || !interactionCheck.checked}
              >
                {loading ? 'Creating...' : 'Create Prescription'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="prescriptions-view">
          <div className="search-section">
            <input
              type="text"
              placeholder="Enter Patient Health ID"
              value={formData.patientHealthId}
              onChange={(e) => setFormData({ ...formData, patientHealthId: e.target.value })}
            />
            <button 
              onClick={() => fetchPrescriptions(formData.patientHealthId)}
              disabled={loading || !formData.patientHealthId}
            >
              Search Prescriptions
            </button>
          </div>

          {loading && <div className="loading">Loading prescriptions...</div>}

          {prescriptions.length > 0 && (
            <div className="prescriptions-list">
              {prescriptions.map((prescription) => (
                <div key={prescription._id} className="prescription-card">
                  <div className="prescription-header">
                    <h3>{prescription.prescriptionId}</h3>
                    <span className={`status ${prescription.status.toLowerCase().replace(' ', '-')}`}>
                      {prescription.status}
                    </span>
                  </div>
                  <div className="prescription-info">
                    <p><strong>Patient:</strong> {prescription.patient.name}</p>
                    <p><strong>Provider:</strong> {prescription.provider.name}</p>
                    <p><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
                    <p><strong>Valid Until:</strong> {new Date(prescription.validUntil).toLocaleDateString()}</p>
                  </div>
                  <div className="medications-list">
                    <h4>Medications:</h4>
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="medication-item">
                        <p><strong>{med.drugName}</strong></p>
                        <p>{med.dosage.amount}{med.dosage.unit} - {med.frequency}</p>
                        <p>Duration: {med.duration.value} {med.duration.unit}</p>
                        {med.instructions && <p className="instructions">{med.instructions}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EPrescription;
