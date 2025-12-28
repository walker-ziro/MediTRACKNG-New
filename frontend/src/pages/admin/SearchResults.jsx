import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useApi } from '../../hooks/useApi';

const AdminSearchResults = () => {
  const { darkMode } = useSettings();
  const { fetchData } = useApi();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({
    users: [],
    providers: [],
    facilities: []
  });
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      
      setSearching(true);
      try {
        // Fetch data in parallel
        const [usersData, providersData, facilitiesData] = await Promise.all([
          fetchData('/auth/users'),
          fetchData('/auth/providers'),
          fetchData('/facilities')
        ]);

        const lowerQuery = query.toLowerCase();

        // Process Users
        const filteredUsers = (usersData || [])
          .filter(u => {
            return (
              (u.name || '').toLowerCase().includes(lowerQuery) ||
              (u.email || '').toLowerCase().includes(lowerQuery) ||
              (u.role || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(u => ({
            id: u.id,
            title: u.name,
            subtitle: `${u.role} | ${u.email}`,
            date: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
            status: u.status,
            type: 'user',
            link: `/admin/users?search=${u.name}`
          }));

        // Process Providers
        const filteredProviders = (providersData || [])
          .filter(p => {
            const fullName = `${p.firstName} ${p.lastName}`;
            return (
              fullName.toLowerCase().includes(lowerQuery) ||
              (p.specialization || '').toLowerCase().includes(lowerQuery) ||
              (p.licenseNumber || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(p => ({
            id: p._id,
            title: `Dr. ${p.firstName} ${p.lastName}`,
            subtitle: `${p.specialization} | Lic: ${p.licenseNumber}`,
            date: 'N/A',
            status: p.status || 'Active',
            type: 'provider',
            link: `/admin/providers?search=${p.lastName}`
          }));

        // Process Facilities
        const filteredFacilities = (facilitiesData || [])
          .filter(f => {
            return (
              (f.name || '').toLowerCase().includes(lowerQuery) ||
              (f.type || '').toLowerCase().includes(lowerQuery) ||
              (f.address || '').toLowerCase().includes(lowerQuery)
            );
          })
          .map(f => ({
            id: f._id,
            title: f.name,
            subtitle: `${f.type} | ${f.address}`,
            date: 'N/A',
            status: f.status || 'Active',
            type: 'facility',
            link: `/admin/facilities?search=${f.name}`
          }));

        setResults({
          users: filteredUsers,
          providers: filteredProviders,
          facilities: filteredFacilities
        });

      } catch (error) {
        console.error('Admin search failed:', error);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [query]);

  const totalResults = results.users.length + results.providers.length + results.facilities.length;

  return (
    <div className={`p-4 md:p-8 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Search Results</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Found {totalResults} results for "{query}"
        </p>
      </div>

      {searching ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Users Section */}
          {results.users.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Users</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.users.map(item => (
                  <ResultCard key={item.id} item={item} darkMode={darkMode} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* Providers Section */}
          {results.providers.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Providers</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.providers.map(item => (
                  <ResultCard key={item.id} item={item} darkMode={darkMode} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* Facilities Section */}
          {results.facilities.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Facilities</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.facilities.map(item => (
                  <ResultCard key={item.id} item={item} darkMode={darkMode} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className={`text-center py-12 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No results found matching your query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultCard = ({ item, darkMode, navigate }) => (
  <div 
    onClick={() => navigate(item.link)}
    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
      darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        item.type === 'user' ? 'bg-blue-100 text-blue-800' :
        item.type === 'provider' ? 'bg-green-100 text-green-800' :
        'bg-purple-100 text-purple-800'
      }`}>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
      </span>
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.date}</span>
    </div>
    <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.subtitle}</p>
  </div>
);

export default AdminSearchResults;
