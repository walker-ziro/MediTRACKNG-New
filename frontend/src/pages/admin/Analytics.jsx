import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const { theme, t, darkMode } = useSettings();
  const { fetchData } = useApi();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalPatients: 0,
    totalFacilities: 0,
    totalEncounters: 0,
    biometricCoverage: '0%',
    ninCoverage: '0%',
    facilitiesByType: [],
    patientsByRegion: []
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchData('/analytics/overview');
        if (data) {
          setOverview(data);
        }
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <p className="font-medium mb-1">{data.state}</p>
          <p className="text-sm">
            <span style={{ color: '#82ca9d' }}>Patients: </span>
            <span className="font-semibold">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Analytics</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time platform usage and performance metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Patients</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{overview.totalPatients}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Facilities</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{overview.totalFacilities}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Biometric Coverage</p>
          <p className="text-3xl font-bold text-green-500 mt-1">{overview.biometricCoverage}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>NIN Coverage</p>
          <p className="text-3xl font-bold text-blue-500 mt-1">{overview.ninCoverage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Facilities by Type Chart */}
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Facilities by Type</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview.facilitiesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {overview.facilitiesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patients by Region Chart */}
        <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Patients by Region (Top 10)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.patientsByRegion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis type="number" stroke={darkMode ? '#9ca3af' : '#4b5563'} allowDecimals={false} />
                <YAxis dataKey="state" type="category" width={100} stroke={darkMode ? '#9ca3af' : '#4b5563'} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
