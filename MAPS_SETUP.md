# Free Map Setup - OpenStreetMap with Leaflet

The Nearby Health Centers feature now uses **completely free mapping** with no API keys required!

## What's Being Used:

### 🗺️ **Leaflet.js** - Open-source JavaScript library for interactive maps
- **Cost**: 100% FREE
- **No API key needed**
- **No usage limits**

### 🌍 **OpenStreetMap (OSM)** - Free, editable map of the world
- **Cost**: 100% FREE
- **Data**: Community-driven map data
- **No registration required**

### 📍 **Overpass API** - Query engine for OpenStreetMap data
- **Cost**: 100% FREE
- **Usage**: Find hospitals, clinics, health centers
- **No API key needed**

## Features Included:

✅ **User Location Detection** - Automatically detects user's current location
✅ **Nearby Search** - Finds hospitals and health centers within 5km radius using OSM data
✅ **Interactive Map** - Leaflet maps with custom styling for dark/light mode
✅ **Facility Details** - Shows name, address, facility type, distance, and phone numbers
✅ **Get Directions** - Direct link to Google Maps for turn-by-turn directions
✅ **Sorted by Distance** - Facilities are sorted from nearest to farthest
✅ **Click to View** - Click on facility in list to highlight on map
✅ **Dark/Light Mode** - Different map tiles for each theme

## How It Works:

1. **Leaflet** is loaded from CDN (no installation needed)
2. **OpenStreetMap tiles** provide the map background
3. **Overpass API** queries OSM database for nearby healthcare facilities
4. All services are free and require no API keys!

## Map Tiles Used:

- **Light Mode**: OpenStreetMap standard tiles
- **Dark Mode**: CartoDB Dark Matter tiles (also free)

## Testing:

1. Make sure location services are enabled in your browser
2. Navigate to: `/patient/nearby-health-centers`
3. Allow location access when prompted
4. The map will load and show nearby healthcare facilities

## Troubleshooting:

**Map doesn't load:**
- Check browser console for errors
- Ensure internet connection is stable
- Try refreshing the page

**No facilities found:**
- The area might not have many facilities in OpenStreetMap database
- Try a different location
- You can increase search radius by editing the code (default is 5km)

**Location not detected:**
- Make sure location services are enabled in browser settings
- The app will fallback to Lagos, Nigeria if location can't be detected

## Advantages Over Google Maps:

✅ **No Cost** - Completely free, no credit card needed
✅ **No API Keys** - No registration or setup required
✅ **No Usage Limits** - Unlimited map loads and searches
✅ **Privacy-Friendly** - Open-source and community-driven
✅ **Works Immediately** - No configuration needed

## Data Source:

Healthcare facility data comes from **OpenStreetMap**, a collaborative project to create a free editable map of the world. Data is contributed by volunteers worldwide and is kept up-to-date by the community.
