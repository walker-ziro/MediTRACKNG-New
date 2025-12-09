import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI, encounterAPI } from '../utils/api';

const NewEncounterForm = () => {
  const { theme } = useSettings();
  const darkMode = theme && theme.toLowerCase() === 'dark';
  const { healthId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    clinicalNotes: '',
    dischargeSummary: '',
    labResults: []
  });

  const [newLabTest, setNewLabTest] = useState({
    name: '',
    status: 'Pending',
    link: ''
  });

  useEffect(() => {
    fetchPatient();
  }, [healthId]);

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getByHealthId(healthId);
      setPatient(response.data.patient);
    } catch (err) {
      setError('Failed to load patient information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLabTestChange = (e) => {
    setNewLabTest({
      ...newLabTest,
      [e.target.name]: e.target.value
    });
  };

  const addLabTest = () => {
    if (newLabTest.name.trim()) {
      setFormData({
        ...formData,
        labResults: [...formData.labResults, { ...newLabTest }]
      });
      setNewLabTest({ name: '', status: 'Pending', link: '' });
    }
  };

  const removeLabTest = (index) => {
    setFormData({
      ...formData,
      labResults: formData.labResults.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await encounterAPI.create({
        healthId,
        clinicalNotes: formData.clinicalNotes,
        labResults: formData.labResults,
        dischargeSummary: formData.dischargeSummary
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/patient/${healthId}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create encounter. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
            <p>Patient not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(`/patient/${healthId}`)}
            className="text-primary-600 hover:text-primary-700 font-medium mb-2"
          >
            ← Back to Patient Record
          </button>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Encounter</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info Card */}
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {patient.demographics.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {patient.demographics.name}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Health ID: <span className="font-semibold">{patient.healthId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-md mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Encounter created successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Encounter Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clinical Notes */}
          <div className="card">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              Clinical Notes
            </h3>
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleChange}
              className="input-field"
              rows="6"
              placeholder="Enter clinical observations, diagnosis, treatment plan, and any other relevant medical information..."
              required
            />
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Include patient complaints, examination findings, diagnosis, and treatment recommendations
            </p>
          </div>

          {/* Lab Results */}
          <div className="card">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </span>
              Lab Tests & Results
            </h3>

            {/* Current Lab Tests */}
            {formData.labResults.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.labResults.map((lab, index) => (
                  <div key={index} className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-3 rounded-md flex justify-between items-center`}>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lab.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Status: <span className="font-medium">{lab.status}</span>
                        {lab.link && ` | Link: ${lab.link}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLabTest(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Lab Test */}
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Add Lab Test</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="label text-xs">Test Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newLabTest.name}
                    onChange={handleLabTestChange}
                    className="input-field"
                    placeholder="e.g., Blood Test"
                  />
                </div>
                <div>
                  <label className="label text-xs">Status</label>
                  <select
                    name="status"
                    value={newLabTest.status}
                    onChange={handleLabTestChange}
                    className="input-field"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Report Link (Optional)</label>
                  <input
                    type="text"
                    name="link"
                    value={newLabTest.link}
                    onChange={handleLabTestChange}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addLabTest}
                className="btn-secondary text-sm"
              >
                + Add Lab Test
              </button>
            </div>
          </div>

          {/* Discharge Summary */}
          <div className="card">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              Discharge Summary
            </h3>
            <textarea
              name="dischargeSummary"
              value={formData.dischargeSummary}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Enter discharge instructions, follow-up recommendations, and prescribed medications..."
            />
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Include follow-up appointments, medications prescribed, and any special instructions
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || success}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving Encounter...' : 'Save Encounter'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/patient/${healthId}`)}
              className="btn-secondary flex-1"
              disabled={submitting || success}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewEncounterForm;
