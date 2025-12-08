import { useState, useEffect } from 'react';
import { facilityAPI } from '../utils/api';
import '../styles/FacilityRegistration.css';

const FacilityRegistration = () => {
  const [activeView, setActiveView] = useState('list');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterState, setFilterState] = useState('');
  
  const [formData, setFormData] = useState({
    facilityId: '',
    name: '',
    type: 'Hospital',
    ownership: 'Public',
    accreditation: '',
    region: '',
    state: '',
    lga: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    services: [],
    subscriptionTier: 'Basic'
  });

  const facilityTypes = [
    'Hospital',
    'Clinic',
    'Primary Health Center',
    'Diagnostic Center',
    'Pharmacy',
    'Laboratory',
    'Maternity Home',
    'Specialist Hospital',
    'Teaching Hospital',
    'Federal Medical Center',
    'State Hospital',
    'General Hospital'
  ];

  const ownershipTypes = ['Public', 'Private', 'Faith-Based', 'NGO', 'Military'];
  const subscriptionTiers = ['Basic', 'Standard', 'Premium', 'Enterprise'];

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
  ];

  const servicesList = [
    'General Consultation',
    'Emergency Services',
    'Surgery',
    'Obstetrics & Gynecology',
    'Pediatrics',
    'Internal Medicine',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Dental',
    'Ophthalmology',
    'Cardiology',
    'Orthopedics',
    'Mental Health',
    'Rehabilitation',
    'Outpatient Services',
    'Inpatient Services',
    'ICU',
    'Dialysis',
    'Physiotherapy'
  ];

  useEffect(() => {
    if (activeView === 'list') {
      fetchFacilities();
    }
  }, [activeView]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      alert('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.facilityId || !formData.name || !formData.state) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await facilityAPI.register(formData);
      alert('Facility registered successfully!');
      
      setFormData({
        facilityId: '',
        name: '',
        type: 'Hospital',
        ownership: 'Public',
        accreditation: '',
        region: '',
        state: '',
        lga: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        services: [],
        subscriptionTier: 'Basic'
      });
      
      setActiveView('list');
    } catch (error) {
      console.error('Error registering facility:', error);
      alert(error.response?.data?.message || 'Failed to register facility');
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          facility.facilityId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || facility.type === filterType;
    const matchesState = !filterState || facility.state === filterState;
    return matchesSearch && matchesType && matchesState;
  });

  return (
    <div className="facility-registration">
      <div className="page-header">
        <div>
          <h1>🏥 Facility Registration</h1>
          <p>Register and manage healthcare facilities nationwide</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('list')}
          >
            📋 View Facilities
          </button>
          <button 
            className={`btn ${activeView === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('register')}
          >
            ➕ Register New
          </button>
        </div>
      </div>

      {activeView === 'list' && (
        <div className="facilities-list">
          <div className="filters-bar card">
            <input
              type="text"
              placeholder="🔍 Search by name or facility ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
              <option value="">All States</option>
              {nigerianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={fetchFacilities}>
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading facilities...</p>
            </div>
          ) : (
            <>
              <div className="results-count">
                Found {filteredFacilities.length} facilities
              </div>
              
              <div className="facilities-table-container card">
                <table className="facilities-table">
                  <thead>
                    <tr>
                      <th>Facility ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Ownership</th>
                      <th>State</th>
                      <th>LGA</th>
                      <th>Subscription</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFacilities.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="empty-state">
                          No facilities found
                        </td>
                      </tr>
                    ) : (
                      filteredFacilities.map(facility => (
                        <tr key={facility.facilityId}>
                          <td>{facility.facilityId}</td>
                          <td>{facility.name}</td>
                          <td>{facility.type}</td>
                          <td>{facility.ownership}</td>
                          <td>{facility.state}</td>
                          <td>{facility.lga}</td>
                          <td>
                            <span className={`tier-badge ${facility.subscriptionTier?.toLowerCase()}`}>
                              {facility.subscriptionTier}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${facility.status?.toLowerCase()}`}>
                              {facility.status || 'Active'}
                            </span>
                          </td>
                          <td>
                            <button className="btn-icon" title="View Details">👁️</button>
                            <button className="btn-icon" title="Edit">✏️</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeView === 'register' && (
        <div className="registration-form card">
          <h2>Register New Facility</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Facility ID *</label>
                  <input
                    type="text"
                    name="facilityId"
                    value={formData.facilityId}
                    onChange={handleInputChange}
                    placeholder="e.g., FAC-ABC-001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Facility Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter facility name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Facility Type *</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} required>
                    {facilityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ownership *</label>
                  <select name="ownership" value={formData.ownership} onChange={handleInputChange} required>
                    {ownershipTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Accreditation Number</label>
                  <input
                    type="text"
                    name="accreditation"
                    value={formData.accreditation}
                    onChange={handleInputChange}
                    placeholder="Enter accreditation number"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Location Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>State *</label>
                  <select name="state" value={formData.state} onChange={handleInputChange} required>
                    <option value="">Select State</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>LGA *</label>
                  <input
                    type="text"
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    placeholder="Enter LGA"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Full Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Enter contact person name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., 08012345678"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Services Offered</h3>
              <div className="services-grid">
                {servicesList.map(service => (
                  <label key={service} className="service-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Subscription</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Subscription Tier *</label>
                  <select name="subscriptionTier" value={formData.subscriptionTier} onChange={handleInputChange} required>
                    {subscriptionTiers.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                  <small className="form-hint">Select appropriate subscription plan based on facility size and needs</small>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveView('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registering...' : '✓ Register Facility'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FacilityRegistration;
