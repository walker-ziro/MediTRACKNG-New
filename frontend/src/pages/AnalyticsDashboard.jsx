import { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    overview: null,
    demographics: null,
    diseases: null,
    immunizations: null,
    facilities: null,
    regional: null,
    systemUsage: null
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [overview, demographics, diseases, immunizations, facilities, regional, systemUsage] = await Promise.all([
        analyticsAPI.getOverview().catch(() => null),
        analyticsAPI.getDemographics().catch(() => null),
        analyticsAPI.getDiseaseSurveillance().catch(() => null),
        analyticsAPI.getImmunizationCoverage().catch(() => null),
        analyticsAPI.getFacilityPerformance().catch(() => null),
        analyticsAPI.getRegionalHealth().catch(() => null),
        analyticsAPI.getSystemUsage().catch(() => null)
      ]);

      setData({
        overview: overview?.data,
        demographics: demographics?.data,
        diseases: diseases?.data,
        immunizations: immunizations?.data,
        facilities: facilities?.data,
        regional: regional?.data,
        systemUsage: systemUsage?.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading national health analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="page-header">
        <h1>📊 National Health Analytics</h1>
        <p>Public health surveillance and system insights</p>
        <button className="btn btn-primary" onClick={fetchAllData}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          📈 Overview
        </button>
        <button className={activeTab === 'demographics' ? 'active' : ''} onClick={() => setActiveTab('demographics')}>
          👥 Demographics
        </button>
        <button className={activeTab === 'diseases' ? 'active' : ''} onClick={() => setActiveTab('diseases')}>
          🦠 Disease Surveillance
        </button>
        <button className={activeTab === 'immunizations' ? 'active' : ''} onClick={() => setActiveTab('immunizations')}>
          💉 Immunizations
        </button>
        <button className={activeTab === 'facilities' ? 'active' : ''} onClick={() => setActiveTab('facilities')}>
          🏥 Facilities
        </button>
        <button className={activeTab === 'regional' ? 'active' : ''} onClick={() => setActiveTab('regional')}>
          🗺️ Regional Health
        </button>
      </div>

      {/* Tab Content */}
      <div className="analytics-content">
        {activeTab === 'overview' && data.overview && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-content">
                  <h3>{data.overview.totalPatients?.toLocaleString()}</h3>
                  <p>Total Patients</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-content">
                  <h3>{data.overview.totalFacilities?.toLocaleString()}</h3>
                  <p>Registered Facilities</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>{data.overview.totalEncounters?.toLocaleString()}</h3>
                  <p>Total Encounters</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔐</div>
                <div className="stat-content">
                  <h3>{data.overview.biometricCoverage}</h3>
                  <p>Biometric Coverage</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card card">
                <h3>Facilities by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.overview.facilitiesByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card card">
                <h3>Top 10 States by Patient Count</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.overview.patientsByRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {data.systemUsage && (
              <div className="usage-card card">
                <h3>System Usage ({data.systemUsage.period})</h3>
                <div className="usage-grid">
                  <div className="usage-item">
                    <span className="usage-label">New Patients</span>
                    <span className="usage-value">{data.systemUsage.newPatients?.toLocaleString()}</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-label">New Encounters</span>
                    <span className="usage-value">{data.systemUsage.newEncounters?.toLocaleString()}</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-label">Active Facilities</span>
                    <span className="usage-value">{data.systemUsage.activeFacilities?.toLocaleString()}</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-label">Biometric Verifications</span>
                    <span className="usage-value">{data.systemUsage.newBiometricVerifications?.toLocaleString()}</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-label">Avg Encounters/Day</span>
                    <span className="usage-value">{data.systemUsage.averageEncountersPerDay}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'demographics' && data.demographics && (
          <div className="demographics-section">
            <div className="charts-grid">
              <div className="chart-card card">
                <h3>Population by Gender</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.demographics.byGender}
                      dataKey="count"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.demographics.byGender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card card">
                <h3>Population by Age Group</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.demographics.byAgeGroup}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card card">
                <h3>Blood Group Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.demographics.byBloodGroup}
                      dataKey="count"
                      nameKey="bloodGroup"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.demographics.byBloodGroup.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card card">
                <h3>Genotype Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.demographics.byGenotype}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="genotype" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diseases' && data.diseases && (
          <div className="diseases-section">
            <div className="chart-card card">
              <h3>Top 20 Diseases</h3>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={data.diseases.diseases} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="disease" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cases" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="diseases-table card">
              <h3>Disease Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Disease</th>
                    <th>Total Cases</th>
                    <th>Affected States</th>
                  </tr>
                </thead>
                <tbody>
                  {data.diseases.diseases.map((disease, idx) => (
                    <tr key={idx}>
                      <td>{disease.disease}</td>
                      <td>{disease.cases.toLocaleString()}</td>
                      <td>{disease.affectedStates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'immunizations' && data.immunizations && (
          <div className="immunizations-section">
            <div className="chart-card card">
              <h3>Immunization Coverage</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.immunizations.vaccines}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vaccine" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalDoses" fill="#10b981" name="Total Doses" />
                  <Bar dataKey="coverage" fill="#3b82f6" name="Coverage %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="immunizations-table card">
              <h3>Vaccine Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Total Doses</th>
                    <th>Coverage %</th>
                    <th>States Covered</th>
                    <th>Facilities</th>
                  </tr>
                </thead>
                <tbody>
                  {data.immunizations.vaccines.map((vaccine, idx) => (
                    <tr key={idx}>
                      <td>{vaccine.vaccine}</td>
                      <td>{vaccine.totalDoses.toLocaleString()}</td>
                      <td>{vaccine.coverage}%</td>
                      <td>{vaccine.statesCovered}</td>
                      <td>{vaccine.facilitiesAdministered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && data.facilities && (
          <div className="facilities-section">
            <div className="stats-row">
              <div className="stat-box">
                <h4>Total Facilities</h4>
                <p>{data.facilities.totalFacilities}</p>
              </div>
              <div className="stat-box">
                <h4>Average Patients</h4>
                <p>{data.facilities.averagePatients}</p>
              </div>
              <div className="stat-box">
                <h4>Average Providers</h4>
                <p>{data.facilities.averageProviders}</p>
              </div>
            </div>

            <div className="facilities-table card">
              <h3>Top 50 Facilities</h3>
              <table>
                <thead>
                  <tr>
                    <th>Facility Name</th>
                    <th>Facility ID</th>
                    <th>Type</th>
                    <th>State</th>
                    <th>Patients</th>
                    <th>Providers</th>
                    <th>Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {data.facilities.facilities.map((facility, idx) => (
                    <tr key={idx}>
                      <td>{facility.name}</td>
                      <td>{facility.facilityId}</td>
                      <td>{facility.type}</td>
                      <td>{facility.state}</td>
                      <td>{facility.totalPatients.toLocaleString()}</td>
                      <td>{facility.totalProviders}</td>
                      <td>
                        <span className={`tier-badge ${facility.subscriptionTier?.toLowerCase()}`}>
                          {facility.subscriptionTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'regional' && data.regional && (
          <div className="regional-section">
            <div className="chart-card card">
              <h3>Regional Health Indicators</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.regional.regions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPatients" fill="#3b82f6" name="Total Patients" />
                  <Bar dataKey="chronicDiseases" fill="#ef4444" name="Chronic Diseases" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="regional-table card">
              <h3>State Health Metrics</h3>
              <table>
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Total Patients</th>
                    <th>Chronic Diseases</th>
                    <th>Disease Rate</th>
                    <th>Biometric Coverage</th>
                    <th>NIN Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regional.regions.map((region, idx) => (
                    <tr key={idx}>
                      <td>{region.state}</td>
                      <td>{region.totalPatients.toLocaleString()}</td>
                      <td>{region.chronicDiseases.toLocaleString()}</td>
                      <td>{region.chronicDiseaseRate}%</td>
                      <td>{region.biometricCoverage}%</td>
                      <td>{region.ninCoverage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
