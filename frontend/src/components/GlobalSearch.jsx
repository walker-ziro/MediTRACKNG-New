import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  console.log('GlobalSearch render:', { isOpen });

  // Mock data for searching
  const mockData = {
    patients: [
      { id: 'MTN-12345678', name: 'Adewale Johnson', type: 'patient', age: 45, lastVisit: '2024-12-05' },
      { id: 'MTN-23456789', name: 'Fatima Bello', type: 'patient', age: 32, lastVisit: '2024-12-04' },
      { id: 'MTN-34567890', name: 'Chinedu Okafor', type: 'patient', age: 28, lastVisit: '2024-12-03' },
      { id: 'MTN-45678901', name: 'Aisha Mohammed', type: 'patient', age: 52, lastVisit: '2024-12-02' },
    ],
    doctors: [
      { id: 'DOC001', name: 'Dr. Adewale Johnson', type: 'doctor', specialty: 'Cardiology', status: 'On Duty' },
      { id: 'DOC002', name: 'Dr. Chinedu Okafor', type: 'doctor', specialty: 'Pediatrics', status: 'On Duty' },
      { id: 'DOC003', name: 'Dr. Ngozi Okonkwo', type: 'doctor', specialty: 'Obstetrics', status: 'Off Duty' },
    ],
    pages: [
      { id: 'dashboard', name: 'Dashboard', type: 'page', path: '/dashboard', icon: 'home' },
      { id: 'appointments', name: 'Appointments', type: 'page', path: '/appointments', icon: 'calendar' },
      { id: 'emergency', name: 'Emergency', type: 'page', path: '/emergency', icon: 'emergency' },
      { id: 'doctors', name: 'Doctors', type: 'page', path: '/doctors', icon: 'doctors' },
      { id: 'patients', name: 'Patients', type: 'page', path: '/patients', icon: 'patients' },
      { id: 'laboratory', name: 'Laboratory', type: 'page', path: '/laboratory', icon: 'lab' },
      { id: 'pharmacy', name: 'Pharmacy', type: 'page', path: '/pharmacy', icon: 'pharmacy' },
      { id: 'staffs', name: 'Staffs', type: 'page', path: '/staffs', icon: 'staff' },
      { id: 'bills', name: 'Bills & Payments', type: 'page', path: '/bills', icon: 'bills' },
      { id: 'accounts', name: 'Accounts', type: 'page', path: '/accounts', icon: 'accounts' },
      { id: 'settings', name: 'Settings', type: 'page', path: '/settings', icon: 'settings' },
    ],
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = [];

      // Search patients
      mockData.patients.forEach(patient => {
        if (patient.name.toLowerCase().includes(query) || patient.id.toLowerCase().includes(query)) {
          results.push(patient);
        }
      });

      // Search doctors
      mockData.doctors.forEach(doctor => {
        if (doctor.name.toLowerCase().includes(query) || doctor.specialty.toLowerCase().includes(query)) {
          results.push(doctor);
        }
      });

      // Search pages
      mockData.pages.forEach(page => {
        if (page.name.toLowerCase().includes(query)) {
          results.push(page);
        }
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (result) => {
    if (result.type === 'patient') {
      navigate(`/patient/${result.id}`);
    } else if (result.type === 'doctor') {
      navigate('/doctors');
    } else if (result.type === 'page') {
      navigate(result.path);
    }
    onClose();
    setSearchQuery('');
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'patient':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'doctor':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'page':
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      
      {/* Search Modal */}
      <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl z-50`}>
        {/* Search Input */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, doctors, pages..."
              className="w-full pl-12 pr-4 py-3 text-lg border-none focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              Searching...
            </div>
          ) : searchQuery && searchResults.length === 0 ? (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-1">Try searching with different keywords</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className={`p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium bg-gray-100 ${darkMode ? 'text-gray-400' : 'text-gray-600'} rounded`}>
                          {result.type}
                        </span>
                      </div>
                      {result.type === 'patient' && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {result.id} • Age {result.age} • Last visit: {result.lastVisit}
                        </p>
                      )}
                      {result.type === 'doctor' && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {result.specialty} • {result.status}
                        </p>
                      )}
                      {result.type === 'page' && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          Navigate to {result.name}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">Start searching</p>
              <p className="text-sm mt-1">Type to search for patients, doctors, or pages</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-b-xl`}>
          <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex gap-4">
              <span><kbd className={`px-2 py-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded`}>↑↓</kbd> Navigate</span>
              <span><kbd className={`px-2 py-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded`}>Enter</kbd> Select</span>
            </div>
            <span><kbd className={`px-2 py-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded`}>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalSearch;
