# MediTRACKNG Frontend

The frontend client for the MediTRACKNG National Health Records System. Built with React, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Maps:** Leaflet.js + React Leaflet (OpenStreetMap)
- **Video:** Jitsi Meet React SDK

## 📂 Folder Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets (images, fonts)
│   ├── components/      # Reusable UI components
│   │   ├── Appointments.jsx
│   │   ├── DashboardStats.jsx
│   │   ├── Layout.jsx
│   │   └── ...
│   ├── context/         # React Contexts
│   │   ├── AuthContext.jsx     # Authentication state
│   │   └── SettingsContext.jsx # Theme/Language settings
│   ├── layouts/         # Page layouts
│   │   ├── AdminLayout.jsx
│   │   ├── PatientLayout.jsx
│   │   └── ProviderLayout.jsx
│   ├── pages/           # Application pages
│   │   ├── admin/       # Admin portal pages
│   │   ├── auth/        # Login/Register pages
│   │   ├── patient/     # Patient portal pages
│   │   └── provider/    # Provider portal pages
│   ├── utils/           # Helper functions
│   │   └── api.js       # Axios instance configuration
│   ├── App.jsx          # Main app component & routing
│   └── main.jsx         # Entry point
└── vite.config.js       # Vite configuration
```

## 🗺️ Nearby Health Centers Feature

The **Nearby Health Centers** page (`src/pages/patient/NearbyHealthCenters.jsx`) allows patients to find healthcare facilities near them.

- **Implementation:**
  - Uses **Leaflet.js** for map rendering.
  - Uses **OpenStreetMap** tiles (Standard & Dark Mode).
  - Uses **Overpass API** to query real-time data for hospitals and clinics.
  - **No API Keys** required (100% free solution).
  
- **Key Features:**
  - Automatic geolocation.
  - 5km radius search.
  - Interactive markers.
  - "Get Directions" integration with Google Maps.
  - Fallback to backup Overpass servers for reliability.

## 🚀 Getting Started

1. **Install Dependencies:**
   ```powershell
   npm install
   ```

2. **Start Development Server:**
   ```powershell
   npm run dev
   ```
   Access at `http://localhost:5173`

3. **Build for Production:**
   ```powershell
   npm run build
   ```

## 🎨 Theming

The application supports **Dark Mode** and **Light Mode**, managed via `SettingsContext`. Tailwind CSS classes are used to style components based on the active theme.

## 🔐 Authentication Flow

1. User logs in via `/login`.
2. `AuthContext` stores the JWT token in `localStorage`.
3. Axios interceptor (`src/utils/api.js`) attaches the token to every request.
4. Protected routes redirect unauthenticated users to login.
5. Role-based routing ensures users only access their authorized portal (Patient/Provider/Admin).
