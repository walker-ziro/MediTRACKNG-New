import { useState, useEffect } from 'react';
import { auditAPI, facilityAPI } from '../utils/api';
import '../styles/AuditLogViewer.css';

const AuditLogViewer = () => {
  const [suspiciousLogs, setSuspiciousLogs] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    reviewed: 'false',
    facilityId: '',
    startDate: '',
    endDate: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    reviewNotes: '',
    action: 'Approved'
  });

  useEffect(() => {
    fetchFacilities();
    fetchSuspiciousLogs();
  }, []);

  useEffect(() => {
    fetchSuspiciousLogs();
  }, [filter]);

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchSuspiciousLogs = async () => {
    try {
      setLoading(true);
      const response = await auditAPI.getSuspicious(filter);
      setSuspiciousLogs(response.data?.logs || []);
    } catch (error) {
      console.error('Error fetching suspicious logs:', error);
      setSuspiciousLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await auditAPI.reviewLog(selectedLog._id, reviewData);
      alert('Log reviewed successfully!');
      setShowReviewModal(false);
      setSelectedLog(null);
      setReviewData({ reviewNotes: '', action: 'Approved' });
      fetchSuspiciousLogs();
    } catch (error) {
      console.error('Error reviewing log:', error);
      alert('Failed to review log');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (log) => {
    if (log.wasEmergencyAccess && !log.consentId) return 'severity-high';
    if (log.accessResult === 'Denied') return 'severity-medium';
    return 'severity-low';
  };

  const stats = {
    total: suspiciousLogs.length,
    unreviewed: suspiciousLogs.filter(log => !log.reviewedBy).length,
    reviewed: suspiciousLogs.filter(log => log.reviewedBy).length,
    emergencyAccess: suspiciousLogs.filter(log => log.wasEmergencyAccess).length
  };

  return (
    <div className="audit-log-viewer">
      <div className="page-header">
        <h1>🔍 Audit Log Viewer</h1>
        <p>Monitor and review suspicious access activities</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Suspicious</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.unreviewed}</h3>
            <p>Needs Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.reviewed}</h3>
            <p>Reviewed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚑</div>
          <div className="stat-content">
            <h3>{stats.emergencyAccess}</h3>
            <p>Emergency Access</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card card">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Review Status</label>
            <select
              value={filter.reviewed}
              onChange={(e) => setFilter({ ...filter, reviewed: e.target.value })}
              className="form-select"
            >
              <option value="">All</option>
              <option value="false">Unreviewed</option>
              <option value="true">Reviewed</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Facility</label>
            <select
              value={filter.facilityId}
              onChange={(e) => setFilter({ ...filter, facilityId: e.target.value })}
              className="form-select"
            >
              <option value="">All Facilities</option>
              {facilities.map(facility => (
                <option key={facility.facilityId} value={facility.facilityId}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Start Date</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="filter-item">
            <label>End Date</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="loading">Loading suspicious activities...</div>
      ) : suspiciousLogs.length === 0 ? (
        <div className="empty-state card">
          <p>✅ No suspicious activities found</p>
        </div>
      ) : (
        <div className="logs-list">
          {suspiciousLogs.map(log => (
            <div key={log._id} className={`log-card card ${getSeverityColor(log)}`}>
              <div className="log-header">
                <div className="log-info">
                  <span className="timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {log.wasEmergencyAccess && (
                    <span className="badge badge-warning">🚨 Emergency Access</span>
                  )}
                  {!log.reviewedBy && (
                    <span className="badge badge-danger">⏳ Needs Review</span>
                  )}
                  {log.reviewedBy && (
                    <span className="badge badge-success">✅ Reviewed</span>
                  )}
                </div>
                <div className="log-actions">
                  {!log.reviewedBy && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedLog(log);
                        setShowReviewModal(true);
                      }}
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>

              <div className="log-body">
                <div className="log-details">
                  <div className="detail-row">
                    <span className="label">Patient:</span>
                    <span className="value">
                      {log.patient?.firstName} {log.patient?.lastName} ({log.patient?.healthId})
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Accessed By:</span>
                    <span className="value">
                      Dr. {log.accessedBy?.firstName} {log.accessedBy?.lastName} 
                      ({log.accessedBy?.providerId})
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Facility:</span>
                    <span className="value">
                      {log.facility?.name} ({log.facility?.facilityId})
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Action:</span>
                    <span className="value">{log.actionType}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Resource:</span>
                    <span className="value">{log.resourceType}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Result:</span>
                    <span className={`badge badge-${log.accessResult?.toLowerCase()}`}>
                      {log.accessResult}
                    </span>
                  </div>

                  {log.suspiciousReason && (
                    <div className="detail-row">
                      <span className="label">Suspicious Reason:</span>
                      <span className="value warning-text">{log.suspiciousReason}</span>
                    </div>
                  )}

                  {log.emergencyJustification && (
                    <div className="detail-row">
                      <span className="label">Emergency Justification:</span>
                      <span className="value">{log.emergencyJustification}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="label">IP Address:</span>
                    <span className="value">{log.ipAddress}</span>
                  </div>
                </div>

                {log.reviewedBy && (
                  <div className="review-section">
                    <h4>Review Details</h4>
                    <div className="detail-row">
                      <span className="label">Reviewed By:</span>
                      <span className="value">
                        {log.reviewedBy.firstName} {log.reviewedBy.lastName}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Reviewed At:</span>
                      <span className="value">
                        {new Date(log.reviewedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Action:</span>
                      <span className="value">{log.reviewAction}</span>
                    </div>
                    {log.reviewNotes && (
                      <div className="detail-row">
                        <span className="label">Notes:</span>
                        <span className="value">{log.reviewNotes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Suspicious Activity</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>×</button>
            </div>

            <form onSubmit={handleReview}>
              <div className="modal-body">
                <div className="review-summary">
                  <h4>Activity Summary</h4>
                  <p><strong>Patient:</strong> {selectedLog.patient?.firstName} {selectedLog.patient?.lastName}</p>
                  <p><strong>Provider:</strong> Dr. {selectedLog.accessedBy?.firstName} {selectedLog.accessedBy?.lastName}</p>
                  <p><strong>Facility:</strong> {selectedLog.facility?.name}</p>
                  <p><strong>Action:</strong> {selectedLog.actionType} - {selectedLog.resourceType}</p>
                  <p><strong>Reason:</strong> {selectedLog.suspiciousReason}</p>
                  {selectedLog.emergencyJustification && (
                    <p><strong>Emergency Justification:</strong> {selectedLog.emergencyJustification}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Review Action *</label>
                  <select
                    value={reviewData.action}
                    onChange={(e) => setReviewData({ ...reviewData, action: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="Approved">Approved - Legitimate access</option>
                    <option value="Flagged for Investigation">Flagged for Investigation</option>
                    <option value="Dismissed">Dismissed - False positive</option>
                    <option value="Escalated">Escalated to Management</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Review Notes *</label>
                  <textarea
                    value={reviewData.reviewNotes}
                    onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                    className="form-input"
                    rows="5"
                    required
                    placeholder="Provide detailed notes about your review..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
