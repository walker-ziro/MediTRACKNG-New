import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { MapPin, Navigation, Phone, Clock, Star } from 'lucide-react';

const NearbyHealthCenters = () => {
  const { darkMode, t } = useSettings();
  const [userLocation, setUserLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Load Leaflet CSS first
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeafletJS = () => {
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          if (isMountedRef.current) {
            // Small delay to ensure CSS is applied
            setTimeout(getUserLocation, 200);
          }
        };
        document.head.appendChild(script);
      } else if (isMountedRef.current) {
        getUserLocation();
      }
    };

    loadLeafletJS();

    return () => {
      isMountedRef.current = false;
      // Clean up map on unmount
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
      }
    };
  }, []);

  // Add ResizeObserver to handle container size changes
  useEffect(() => {
    if (!mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          initializeMap(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Using default location (Lagos, Nigeria).');
          // Use default location (Lagos, Nigeria)
          const defaultLocation = { lat: 6.5244, lng: 3.3792 };
          setUserLocation(defaultLocation);
          initializeMap(defaultLocation);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      const defaultLocation = { lat: 6.5244, lng: 3.3792 };
      setUserLocation(defaultLocation);
      initializeMap(defaultLocation);
    }
  };

  const initializeMap = (location) => {
    if (!mapRef.current || !window.L || !isMountedRef.current) return;

    // Clear existing map if any
    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.remove();
      } catch (e) {
        console.error('Error removing old map:', e);
      }
      leafletMapRef.current = null;
    }

    // Clear existing markers
    markersRef.current = [];

    try {
      // Create map
      const map = window.L.map(mapRef.current, {
        center: [location.lat, location.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });

      // Store map reference immediately
      leafletMapRef.current = map;

      // Add tile layer - using OpenStreetMap (completely free)
      const tileUrl = darkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
      const tileLayer = window.L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3
      });
      
      tileLayer.addTo(map);

      // Wait for map to be fully ready before adding markers
      map.whenReady(() => {
        if (!isMountedRef.current || !leafletMapRef.current) {
          console.warn('Component unmounted before map ready');
          return;
        }

        // Force map to update its size
        map.invalidateSize();

        // Add user location marker (blue circle)
        const userIcon = window.L.divIcon({
          className: 'custom-user-marker',
          html: '<div style="background-color: #4F46E5; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        try {
          window.L.marker([location.lat, location.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('Your Location');
        } catch (e) {
          console.error('Error adding user marker:', e);
        }

        // Search for nearby hospitals using Overpass API (OpenStreetMap data - completely free)
        searchNearbyFacilities(location, map);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please refresh the page.');
      setLoading(false);
    }
  };

  const searchNearbyFacilities = async (location, map) => {
    const servers = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    let lastError = null;
    let success = false;

    for (const server of servers) {
      if (success) break;
      
      try {
        // Overpass API query for hospitals and clinics within 5km
        const radius = 5000; // 5km
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
            node["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
            way["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
            way["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
          );
          out center body;
        `;

        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(server, {
          method: 'POST',
          body: query,
          headers: {
            'Content-Type': 'text/plain'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON');
        }

        const data = await response.json();
        success = true;
        
        if (data.elements && data.elements.length > 0) {
          const facilitiesData = data.elements
            .filter(element => element.tags && element.tags.name)
            .map((element, index) => {
              const lat = element.lat || (element.center ? element.center.lat : null);
              const lon = element.lon || (element.center ? element.center.lon : null);
              
              if (!lat || !lon) return null;

              return {
                id: element.id,
                name: element.tags.name,
                address: element.tags['addr:street'] 
                  ? `${element.tags['addr:street']}, ${element.tags['addr:city'] || ''}`
                  : element.tags['addr:full'] || 'Address not available',
                location: { lat, lng: lon },
                type: element.tags.amenity,
                phone: element.tags.phone || 'N/A',
                website: element.tags.website,
                distance: calculateDistance(location.lat, location.lng, lat, lon)
              };
            })
            .filter(f => f !== null);

          // Sort by distance
          facilitiesData.sort((a, b) => a.distance - b.distance);
          setFacilities(facilitiesData);

          // Check if map still exists before adding markers
          if (!isMountedRef.current || !map || !leafletMapRef.current || !map.getContainer() || !map.getPanes()) {
            console.warn('Map no longer valid, skipping marker addition');
            setLoading(false);
            return;
          }

          // Add markers for facilities
          facilitiesData.forEach((facility, index) => {
            // Skip if component unmounted or map destroyed
            if (!isMountedRef.current || !leafletMapRef.current || !map.getContainer() || !map.getPanes()) {
              return;
            }

            try {
              const markerIcon = window.L.divIcon({
                className: 'custom-facility-marker',
                html: `<div style="background-color: #EF4444; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              });

              const marker = window.L.marker([facility.location.lat, facility.location.lng], { 
                icon: markerIcon 
              })
                .addTo(map)
                .bindPopup(`<b>${facility.name}</b><br>${facility.address}`);

              marker.on('click', () => {
                setSelectedFacility(facility);
                if (isMountedRef.current && leafletMapRef.current && map.getContainer()) {
                  map.setView([facility.location.lat, facility.location.lng], 15);
                }
              });

              markersRef.current.push(marker);
            } catch (error) {
              console.error(`Error adding marker for ${facility.name}:`, error);
            }
          });

          setLoading(false);
        } else {
          setError('No health facilities found nearby. Try a different location.');
          setLoading(false);
        }
      } catch (error) {
        console.warn(`Error fetching from ${server}:`, error);
        lastError = error;
        // Continue to next server
      }
    }

    if (!success) {
      console.error('All Overpass servers failed:', lastError);
      
      if (lastError.name === 'AbortError') {
        setError('Request timed out. The service might be busy. Please try again in a moment.');
      } else if (lastError.message.includes('JSON')) {
        setError('The mapping service is temporarily unavailable. Please try again later.');
      } else if (lastError.message.includes('504') || lastError.message.includes('Gateway')) {
        setError('The mapping service is temporarily overloaded. Please try again in a few moments.');
      } else {
        setError(`Failed to load nearby facilities: ${lastError.message}. Please try again.`);
      }
      
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return parseFloat(distance.toFixed(2));
  };

  const handleFacilityClick = (facility) => {
    setSelectedFacility(facility);
    if (isMountedRef.current && leafletMapRef.current && leafletMapRef.current.getContainer()) {
      try {
        leafletMapRef.current.setView([facility.location.lat, facility.location.lng], 15);
      } catch (e) {
        console.error('Error setting map view:', e);
      }
    }
  };

  const getDirections = (facility) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facility.location.lat},${facility.location.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Nearby Health Centers
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Find hospitals and health centers near you
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl shadow-lg overflow-hidden border relative z-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ height: '600px' }}>
              {loading && (
                <div className={`absolute inset-0 z-[1000] flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading map...</p>
                  </div>
                </div>
              )}
              <div 
                ref={mapRef} 
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </div>

          {/* Facilities List */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Found {facilities.length} facilities
                </h2>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
                {facilities.map((facility, index) => (
                  <div
                    key={facility.id}
                    onClick={() => handleFacilityClick(facility)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      darkMode 
                        ? 'border-gray-700 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${selectedFacility?.id === facility.id ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center`}>
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {facility.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              facility.type === 'hospital' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {facility.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex items-start gap-2 mb-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{facility.address}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className={`flex items-center gap-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Navigation className="w-4 h-4" />
                        <span>{facility.distance} km away</span>
                      </div>
                      {facility.phone && facility.phone !== 'N/A' && (
                        <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Phone className="w-3 h-3" />
                          <span>{facility.phone}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(facility);
                      }}
                      className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyHealthCenters;
