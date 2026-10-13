# 🌐 Campus Compass — Frontend Application

Modern, high-performance web application providing interactive GIS campus navigation, smart search, and facility discovery for **PSIT Kanpur**.

Built with **React 19**, **TanStack Start**, **Vite 8**, and **Leaflet**.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Operating Modes](#-operating-modes)
  - [Full API Mode](#1-full-api-mode)
  - [Autonomous Demo Mode](#2-autonomous-demo-mode)
- [Key Modules & Subsystems](#-key-modules--subsystems)
- [Available Scripts](#-available-scripts)
- [Deployment (Netlify)](#-deployment-netlify)

---

## ✨ Features

- **Interactive Campus GIS Map**: Leaflet-powered campus map enclosed in the PSIT Kanpur boundary geofence with color-coded building category markers.
- **Turn-by-Turn Walking Directions**: OSRM walking route planner calculating live distance, estimated duration, walking pace, and calories burned.
- **Real-Time Geolocation Tracking**: Live user positioning with animated Google Maps-style compass marker and GPS tracking.
- **Smart Search & AI Suggestions**: Instant fuzzy search across buildings, departments, rooms, and facilities, with Gemini-powered exploration suggestions.
- **QR Code Check-in**: Integrated camera QR scanner (`html5-qrcode`) for quick building location lookup.
- **Voice Search**: Browser Web Speech API integration for hands-free voice discovery.
- **Full Admin Portal**: In-depth admin dashboard (`/admin`) for adding/updating buildings, uploading photos, managing user accounts, and triaging feedback reports.
- **Favorites & Personalization**: Save preferred campus buildings and view recent navigation routes.
- **Theme & Motion**: Sleek dark/light theme switching with smooth Framer Motion animations.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TanStack Start](https://tanstack.com/start) (SSR & Server Functions) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (Strict File-Based Routing) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) with [Nitro](https://nitro.unjs.io/) |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI Primitives, `tw-animate-css` |
| **Mapping & GIS** | [Leaflet 1.9](https://leafletjs.com/), OpenStreetMap, OSRM Foot Routing Engine |
| **Authentication** | [Clerk React](https://clerk.com/) with LocalStorage and JWT fallback |
| **State / Data** | [TanStack Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/) |
| **AI SDK** | [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`) with Google Gemini 2.5 Flash |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons & UI** | [Lucide React](https://lucide.dev/), Sonner Toast Notifications |

---

## 📁 Project Directory Structure

```text
frontend/
├── public/                 # Static public assets (logos, fallback images)
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ui/             # Radix UI primitives (dialog, button, dropdown, etc.)
│   │   ├── building-card.tsx
│   │   ├── campus-map.tsx  # Interactive Leaflet map container & layers
│   │   ├── google-signin.tsx
│   │   ├── qr-code.tsx     # QR generator and camera scanner
│   │   ├── route-insights.tsx
│   │   └── site-chrome.tsx # Navbar, footer, and navigation chrome
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core utilities, API clients, and campus configs
│   │   ├── admin.ts        # Admin operations and metrics
│   │   ├── ai.functions.ts # TanStack Start server functions for Gemini AI
│   │   ├── api.ts          # Axios client with hybrid mock fallback
│   │   ├── auth-context.tsx# Unified Clerk + local JWT auth provider
│   │   ├── mock-data.ts    # Bundled PSIT buildings dataset for demo mode
│   │   ├── osrm-routing.ts # OSRM client with internal graph fallback
│   │   ├── psit-campus-config.ts # Coordinates, bounds, polygon, waypoints
│   │   ├── route-cache.ts  # Route caching utilities
│   │   └── theme-context.tsx
│   ├── routes/             # TanStack Router file-based route definitions
│   │   ├── __root.tsx      # Root application layout and providers
│   │   ├── index.tsx       # Landing page (/)
│   │   ├── map.tsx         # Fullscreen map view (/map)
│   │   ├── navigate.tsx    # Turn-by-turn navigator (/navigate)
│   │   ├── buildings.$id.tsx # Building details & room directory
│   │   ├── search.tsx      # Search view with voice and AI (/search)
│   │   ├── scan.tsx        # Camera QR scanner (/scan)
│   │   ├── favorites.tsx   # User saved locations (/favorites)
│   │   ├── dashboard.tsx   # Student activity dashboard (/dashboard)
│   │   ├── admin.index.tsx # Admin login portal (/admin)
│   │   ├── admin.dashboard.tsx # Comprehensive admin panel (/admin/dashboard)
│   │   └── ...             # Auth & informational pages
│   ├── routeTree.gen.ts    # Auto-generated TanStack route tree
│   ├── server.ts           # Nitro server entrypoint
│   ├── start.ts            # TanStack Start configuration
│   └── styles.css          # Tailwind CSS v4 design tokens and utilities
├── bunfig.toml
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20 LTS recommended)
- **npm** or **bun** / **pnpm**

### Installation

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```

4. Launch the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at:
   ```text
   http://localhost:3000
   ```

---

## 🔐 Environment Variables

Configure the following variables in `frontend/.env`:

| Variable | Type | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Optional | `http://localhost:5000` | Points to the Express backend. **Leave unset to run in offline Demo Mode**. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Optional | `pk_test_...` | Clerk authentication publishable key for user login and sessions. |
| `VITE_GOOGLE_MAPS_BROWSER_KEY`| Optional | `AIzaSy...` | Optional Google Maps API key for address geocoding / satellite fallback. |
| `VITE_GOOGLE_CLIENT_ID` | Optional | `your_google_client_id` | Client ID for Google Identity One-Tap / OAuth sign-in. |
| `VITE_MAPTILER_KEY` | Optional | `your_maptiler_key` | MapTiler vector/raster tile key for custom map styling. |
| `AI_API_KEY` | Optional | `AIzaSy...` | Server-side Google Gemini API key used by TanStack Start server functions. |

---

## 🎯 Operating Modes

### 1. Full API Mode
Set `VITE_API_URL` to point to the backend server:
```env
VITE_API_URL=http://localhost:5000
```
- Requests are dispatched via Axios to the Express REST API.
- Authentication headers (`Bearer <token>`) are automatically attached from active Clerk sessions or `localStorage`.
- All building mutations, photo uploads, reports, and favorite pins are persisted directly in **MongoDB Atlas**.

### 2. Autonomous Demo Mode
Leave `VITE_API_URL` blank or commented out in `.env`:
```env
# VITE_API_URL=
```
- The frontend operates **completely standalone** without running any backend or database.
- Initial campus buildings load from `src/lib/mock-data.ts`.
- Changes (new buildings, edits, report submissions) are persisted directly to browser `localStorage` (`cc_buildings`).
- **Smart Image Compression**: When uploading photos in Demo Mode, images are downsampled using HTML5 Canvas (`compressHomeBackgroundImage`) to prevent exceeding the 5MB browser LocalStorage quota.
- Demo admin access is unlocked by using any email beginning with `admin`, e.g. `admin@psit.ac.in`.

---

## 🗺️ Key Modules & Subsystems

### 1. Map & Navigation Subsystem (`src/lib/osrm-routing.ts`)
- Queries the free OSRM foot engine for walking directions between user GPS coordinates and target buildings.
- Includes an **automatic internal campus fallback**: If the OSRM service is unreachable or the user is navigating between unmapped indoor plazas, the router snaps to nearest nodes in `INTERNAL_CAMPUS_PATH_NODES` (`src/lib/psit-campus-config.ts`) to compute realistic walkway paths.

### 2. QR Code Scanning (`src/components/qr-code.tsx` & `/scan`)
- Uses `html5-qrcode` to access device cameras.
- Instantly detects campus QR codes formatted as URLs or building IDs (`/buildings/cse-block`) and routes the user directly to the building information sheet.

### 3. Voice-Assisted Search (`src/lib/voice-search.ts`)
- Utilizes the browser `webkitSpeechRecognition` / `SpeechRecognition` API.
- Converts speech directly to search queries with audio level visualizers and automatic language detection.

### 4. Admin Management Center (`src/routes/admin.dashboard.tsx`)
- Multi-tab management interface:
  - **Buildings**: Form editor, coordinate picker on interactive map, floor-by-floor room configuration, photo uploads.
  - **Reports & Feedback**: Status update workflow (`pending` ➔ `approved` / `rejected` ➔ `resolved`).
  - **Users**: User listing, role modification, password reset commands.
  - **Settings**: Hero background customization, campus contact emails, and social links.

---

## 💻 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with SSR and hot module replacement at `http://localhost:3000` |
| `npm run build` | Builds optimized production client bundle and Nitro server handlers |
| `npm run build:dev` | Compiles application in development mode for debugging SSR |
| `npm run preview` | Starts a local production preview server |
| `npm run lint` | Runs ESLint across all TypeScript and React files |
| `npm run format` | Runs Prettier to auto-format source files |

---

## 🌐 Deployment (Netlify)

The frontend is configured for deployment on **Netlify** via `netlify.toml`:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions-internal/server"
  status = 200
```

### Steps:
1. Link your GitHub repository in Netlify.
2. Set the base directory to `frontend`.
3. Add the following environment variable in the Netlify dashboard:
   - `VITE_API_URL`: Your production backend URL (e.g. `https://campus-compass-api.onrender.com`).
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your production Clerk key.
4. Deploy the site. Browser location services will work automatically because Netlify provides HTTPS by default.
