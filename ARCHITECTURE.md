# 🏛️ Campus Compass — System Architecture

**Campus Compass** is an enterprise-grade campus navigation, facility discovery, and administrative management platform engineered specifically for **Pranveer Singh Institute of Technology (PSIT), Kanpur**.

This document details the complete end-to-end software architecture, design patterns, subsystem boundaries, data models, and runtime deployment topologies powering Campus Compass.

---

## 📑 Table of Contents

1. [System Overview & High-Level Architecture](#1-system-overview--high-level-architecture)
2. [Architectural Principles & Quality Attributes](#2-architectural-principles--quality-attributes)
3. [Frontend Architecture](#3-frontend-architecture)
   - [Framework & Runtime](#31-framework--runtime)
   - [File-Based Routing Architecture](#32-file-based-routing-architecture)
   - [GIS Mapping & Canvas Engine](#33-gis-mapping--canvas-engine)
   - [Autonomous Fallback & Demo Mode Engine](#34-autonomous-fallback--demo-mode-engine)
   - [State Management & Data Layer](#35-state-management--data-layer)
4. [Backend Reference Architecture](#4-backend-reference-architecture)
   - [Express Server Pipeline](#41-express-server-pipeline)
   - [Hybrid Authentication Middleware](#42-hybrid-authentication-middleware)
   - [Modular Route Handlers](#43-modular-route-handlers)
   - [File Upload & Asset Storage](#44-file-upload--asset-storage)
5. [Data Tier & Schema Architecture](#5-data-tier--schema-architecture)
   - [MongoDB Data Models](#51-mongodb-data-models)
   - [Database Seeding & Lifecycle](#52-database-seeding--lifecycle)
6. [Navigation, Geolocation & Routing Engine](#6-navigation-geolocation--routing-engine)
   - [Campus Geofence & Boundary Polygon](#61-campus-geofence--boundary-polygon)
   - [OSRM Foot-Routing Engine](#62-osrm-foot-routing-engine)
   - [Internal Campus Path Graph Fallback](#63-internal-campus-path-graph-fallback)
   - [Haversine Distance & Bearing Calculation](#64-haversine-distance--bearing-calculation)
7. [Security & Access Control Matrix](#7-security--access-control-matrix)
8. [Deployment & Infrastructure Topology](#8-deployment--infrastructure-topology)

---

## 1. System Overview & High-Level Architecture

Campus Compass is architected as a decoupled, multi-tier full-stack system comprising:
- **Client Presentation & Edge Tier**: TanStack Start React 19 application hosted on Netlify, rendering static assets, server functions, and an interactive GIS interface.
- **Application Services Tier**: A Node.js and Express RESTful API server hosted on Render, handling identity synchronization, campus directory CRUD operations, user reports, and site configuration.
- **Persistence Tier**: A MongoDB Atlas replica set housing user records, building details, feedback reports, and favorite pins.
- **External Services**:
  - **Clerk Auth**: Primary identity provider handling passwordless authentication and user session management.
  - **OSRM (Open Source Routing Machine)**: Turn-by-turn foot routing engine.
  - **MapTiler / OpenStreetMap**: GIS tile imagery provider.
  - **Google Generative AI (Gemini Flash)**: Powering smart campus search recommendations and contextual exploration suggestions.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT CLIENT (BROWSER)                           |
|  - React 19 SPA / SSR Hydration        - Leaflet GIS & Geolocation Tracking       |
|  - TanStack Router & TanStack Query   - LocalStorage Hybrid Offline Cache         |
+------------------------------------------+----------------------------------------+
                                           |
                                  HTTPS / WSS Requests
                                           |
                    +----------------------+-----------------------+
                    |                                              |
                    v                                              v
+---------------------------------------+      +------------------------------------+
|         NETLIFY EDGE / SSR            |      |      RENDER BACKEND API (EXPRESS)  |
| - TanStack Start Server Functions     |      | - Express 4.19 Router              |
| - Gemini AI Gateway Proxy             |      | - Hybrid Clerk & JWT Auth Guard   |
| - Nitro / SSR Bundles                 |      | - Multer File Upload Engine        |
+---------------------------------------+      +-----------------+------------------+
                    |                                            |
                    |                                   Mongoose ODM (TLS)
                    |                                            |
                    v                                            v
+---------------------------------------+      +------------------------------------+
|          EXTERNAL SERVICES            |      |        MONGODB ATLAS (PERSISTENCE) |
| - Clerk Identity API                  |      | - Users (Admins & Students)        |
| - OSRM Routing Engine                 |      | - Buildings & Rooms               |
| - MapTiler / OpenStreetMap Tile CDN   |      | - Reports & Feedback               |
| - Google Gemini 2.5 Flash LLM         |      | - Favorites & Site Settings        |
+---------------------------------------+      +------------------------------------+
```

---

## 2. Architectural Principles & Quality Attributes

1. **Zero-Friction Offline/Demo Resilience**:
   The frontend can operate 100% autonomously without requiring an active backend or database connection (`VITE_API_URL` unset). All building directories, favoriting mechanisms, admin dashboards, and map routes run from typed local mock datasets and `localStorage` caching.
2. **Sub-Second Walking Navigation**:
   Campus navigation uses Open Source Routing Machine (OSRM) foot-routing with automatic sub-50ms fallback to an internal campus waypoint graph when external routing fails.
3. **Defense-in-Depth Authentication**:
   Supports Clerk bearer tokens, local JWT tokens, and Google ID tokens, resolving user identities seamlessly across both MongoDB and Clerk claims.
4. **Responsive Performance**:
   Combines React 19 Server Components, SSR through TanStack Start, client caching via TanStack Query, and code-split dynamic route imports for low-bandwidth mobile devices across campus.

---

## 3. Frontend Architecture

### 3.1 Framework & Runtime
The frontend application (`frontend/`) is built on **TanStack Start**, a full-stack React framework running on top of **Vite 8** and **Nitro**.

Key dependencies:
- **Core**: React 19, TypeScript 5.8, `@tanstack/react-start`, `@tanstack/react-router`
- **Styling**: Tailwind CSS v4, `tw-animate-css`, Radix UI accessible primitives
- **GIS / Mapping**: Leaflet 1.9, `@types/leaflet`
- **Animation**: Framer Motion
- **Icons**: Lucide React, React Icons
- **AI Integration**: Vercel `ai` SDK + `@ai-sdk/openai-compatible`

### 3.2 File-Based Routing Architecture
TanStack Router manages strict type-safe routes under `frontend/src/routes/`:

| Route Path | File Location | Description |
| :--- | :--- | :--- |
| `/` | `src/routes/index.tsx` | Landing page, interactive search hero, category shortcuts, featured facilities |
| `/map` | `src/routes/map.tsx` | Full-screen interactive Leaflet campus map with building pins and search |
| `/navigate` | `src/routes/navigate.tsx` | Turn-by-turn walking route planner, live GPS tracker, step instructions |
| `/buildings/$id` | `src/routes/buildings.$id.tsx` | Building deep-dive, room lists, floor plans, facilities, photo galleries |
| `/search` | `src/routes/search.tsx` | Search interface with filters, voice recognition, and AI suggestions |
| `/scan` | `src/routes/scan.tsx` | Camera QR code scanner for instant building/room check-in |
| `/favorites` | `src/routes/favorites.tsx` | User-saved campus locations and pinned quick-routes |
| `/dashboard` | `src/routes/dashboard.tsx` | User profile, recent activity, report tracking |
| `/admin` | `src/routes/admin.index.tsx` | Admin authentication portal with email OTP recovery |
| `/admin/dashboard` | `src/routes/admin.dashboard.tsx` | Admin control center: building editor, user manager, report triage |
| `/login` | `src/routes/login.tsx` | Student/Staff login (email + Google + Clerk) |
| `/register` | `src/routes/register.tsx` | New account registration |
| `/forgot-password` | `src/routes/forgot-password.tsx`| Password recovery request |
| `/reset-password` | `src/routes/reset-password.tsx` | Password reset execution |
| `/about` | `src/routes/about.tsx` | About PSIT, campus mission, platform overview |
| `/team` | `src/routes/team.tsx` | Project credits and developer information |
| `/contact` | `src/routes/contact.tsx` | Campus support and administrative directory |

### 3.3 GIS Mapping & Canvas Engine
Interactive geospatial rendering is implemented in `frontend/src/components/campus-map.tsx`:
- **Leaflet Map Container**: Renders tiles within the official PSIT geographic boundary polygon.
- **Custom Location Pin Layer**: SVG markers color-coded by building classification (`academic`, `hostel`, `sports`, `food`, `facility`, `admin`, `medical`).
- **Live User Geolocation Marker**: Blue pulsing compass marker driven by `navigator.geolocation.watchPosition` with high accuracy.
- **Interactive Route Polylines**: Smooth SVG paths rendered over walking corridors with dynamic route insights (walking duration, meters, calorie estimate).

### 3.4 Autonomous Fallback & Demo Mode Engine
In `frontend/src/lib/api.ts`:
- When `VITE_API_URL` is omitted, the API adapter switches to `useMock()` mode.
- Local mutations (`createBuilding`, `updateBuilding`, `deleteBuilding`) write to browser `localStorage` under `cc_buildings`.
- Image data URLs uploaded during demo mode are automatically downsampled and compressed via HTML5 Canvas before persisting to stay within browser storage limits.
- The `cc-buildings-changed` CustomEvent synchronizes multi-tab views in real-time.

### 3.5 State Management & Data Layer
- **TanStack Query (`@tanstack/react-query`)**: Handles caching, deduplication, and invalidation of campus directory data.
- **Auth Context (`auth-context.tsx`)**: Bridges Clerk user sessions and local JWT storage, providing reactive `user` and `role` state.
- **Theme & Motion Contexts**: Provide dark/light mode toggles and reduced-motion user preferences.

---

## 4. Backend Reference Architecture

The backend reference server (`backend-reference/`) is built using Node.js ES modules and Express.

### 4.1 Express Server Pipeline
The server pipeline in `server.js` follows a structured middleware sequence:

1. **Environment Configuration**: Loaded via `dotenv/config`.
2. **CORS Origin Resolution**: Validates against allowed origins (`http://localhost:5173`, `http://localhost:3000`, `https://psit-campus-compass.netlify.app`, etc.) with credentials and preflight handling.
3. **Payload Parsers**: JSON and URL-encoded body parsers with a 25MB threshold for base64 media.
4. **Static Assets**: Express static directory `/uploads` for campus images.
5. **Route Mounting**: Prefix-isolated routers under `/api/*`.
6. **Graceful Connection**: MongoDB connection via Mongoose with auto-seed logic before listening on `PORT`.

### 4.2 Hybrid Authentication Middleware
Located in `backend-reference/src/middleware/auth.js`:
- **Clerk Verification**: If `CLERK_SECRET_KEY` is present, incoming `Bearer` tokens are verified using `@clerk/backend`'s `verifyToken` with a 30-second clock skew tolerance.
- **Auto-Sync to MongoDB**: When a Clerk user is verified, the middleware locates or provisions the user in MongoDB, ensuring consistent MongoDB `_id` identifiers for relations like Reports and Favorites.
- **Fallback JWT Verification**: If the Clerk check is skipped or fails, standard `jsonwebtoken.verify` validates credentials against `JWT_SECRET`.
- **Role Verification (`requireAdmin`)**: Enforces `admin` role authorization, verifying email patterns or metadata claims before allowing mutating operations.

### 4.3 Modular Route Handlers
All routes reside in `backend-reference/src/routes/`:
- `auth.js`: User registration, login, Google credential parsing, password reset.
- `buildings.js`: Public read endpoints; admin `POST`, `PUT`, `DELETE`, and image uploads.
- `search.js`: Case-insensitive regex search spanning name, code, department, facilities, and rooms.
- `reports.js`: User feedback creation, personal report querying, and admin triage.
- `favorites.js`: Atomic toggle and retrieval of user-pinned buildings.
- `settings.js`: Dynamic site theme, contact details, and social links.
- `admin.js`: User directory moderation, password overrides, and aggregated analytics.

### 4.4 File Upload & Asset Storage
- Handled via `multer` in `src/routes/buildings.js`.
- Restricts files to 5MB, generating timestamp-prefixed filenames saved to disk and served publicly via `/uploads/:filename`.

---

## 5. Data Tier & Schema Architecture

### 5.1 MongoDB Data Models

```
 +--------------------------------------------------------------------------------+
 |                                  User                                          |
 +--------------------------------------------------------------------------------+
 | _id: ObjectId           name: String            email: String (unique, index)  |
 | password: String (hash) role: "user" | "admin"  active: Boolean                |
 | createdAt: Date         updatedAt: Date                                        |
 +--------------------------------------------------------------------------------+
                                       |
                                       | 1:N
                                       v
 +--------------------------------------------------------------------------------+
 |                                 Favorite                                       |
 +--------------------------------------------------------------------------------+
 | _id: ObjectId           userId: ObjectId (ref: User)                           |
 | buildingId: String      createdAt: Date                                        |
 | INDEX: { userId: 1, buildingId: 1 } (Unique compound)                         |
 +--------------------------------------------------------------------------------+
                                       |
                                       | 1:N
                                       v
 +--------------------------------------------------------------------------------+
 |                                  Report                                        |
 +--------------------------------------------------------------------------------+
 | _id: ObjectId           userId: ObjectId (ref: User)  userName: String         |
 | userEmail: String       buildingId: String            buildingName: String     |
 | category: "location" | "details" | "other"            message: String          |
 | status: "pending" | "approved" | "rejected" | "resolved"                       |
 | createdAt: Date         updatedAt: Date                                        |
 +--------------------------------------------------------------------------------+

 +--------------------------------------------------------------------------------+
 |                                 Building                                       |
 +--------------------------------------------------------------------------------+
 | _id: ObjectId           id: String (unique, index)    name: String (text)      |
 | code: String            icon: String                  department: String (text)|
 | programs: [String]      description: String (text)    openingTime: String      |
 | facilities: [String]    image: String                 gallery: [String]        |
 | category: "academic"|"hostel"|"sports"|"food"|"facility"|"admin"|"medical"     |
 | lat: Number             lng: Number                   floors: Number           |
 | rooms: [ { number: String, type: String, floor: Number } ]                     |
 | createdAt: Date         updatedAt: Date                                        |
 +--------------------------------------------------------------------------------+

 +--------------------------------------------------------------------------------+
 |                               SiteSettings                                     |
 +--------------------------------------------------------------------------------+
 | key: "main" (unique)    homeBackground: String        contactEmail: String     |
 | contactPhone: String    instagram: String             linkedin: String         |
 | twitter: String                                                                |
 +--------------------------------------------------------------------------------+
```

### 5.2 Database Seeding & Lifecycle
In `backend-reference/src/config/db.js`:
- On database connection, the server checks `Building.countDocuments()`.
- If zero buildings exist, it automatically inserts `DEFAULT_INITIAL_BUILDINGS` (8 verified campus landmarks: Main Gate, Admin Block, CSE Block, Central Library, Central Food Court, Boys Hostel, Girls Hostel, Sports Complex, and Medical Center).

---

## 6. Navigation, Geolocation & Routing Engine

### 6.1 Campus Geofence & Boundary Polygon
Defined in `frontend/src/lib/psit-campus-config.ts`:
- **Campus Center**: Latitude `26.450160568018063`, Longitude `80.19200298753422`, Default Zoom: 17.
- **Bounding Box**: SouthWest `[26.443, 80.184]`, NorthEast `[26.456, 80.200]`.
- **Geofence Polygon**: A 10-point polygon enclosing the PSIT campus boundary along the Kanpur-Agra Highway (NH 19).

### 6.2 OSRM Foot-Routing Engine
Implemented in `frontend/src/lib/osrm-routing.ts`:
1. Requests foot-routing polylines from the public OSRM foot engine:
   ```
   https://routing.openstreetmap.de/routed-foot/route/v1/foot/{startLng},{startLat};{endLng},{endLat}?overview=full&geometries=geojson&steps=true
   ```
2. Transforms GeoJSON coordinate pairs `[lng, lat]` into Leaflet-ready `[lat, lng]` polyline points.
3. Formats turn-by-turn maneuvers (e.g. "turn right", "continue straight") with individual step distances and durations.

### 6.3 Internal Campus Path Graph Fallback
If OSRM is unreachable, offline, or returns empty coordinates:
- The engine transitions seamlessly to `buildCampusFallbackRoute`.
- Resolves the origin and destination to the nearest waypoints in `INTERNAL_CAMPUS_PATH_NODES`.
- Constructs a plausible campus walkway trajectory connecting the entrance, academic spine, hostel quad, and dining complexes.

### 6.4 Haversine Distance & Bearing Calculation
- **Haversine Formula**: Calculates real great-circle distance in meters:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- **Compass Bearing**: Derives 8-point compass orientations (`north`, `north-east`, `east`, etc.) for real-time turn guidance.

---

## 7. Security & Access Control Matrix

| Resource | Operation | Anonymous Guest | Authenticated User | Campus Admin |
| :--- | :--- | :---: | :---: | :---: |
| `/api/buildings` | Read (List & Detail) | ✅ | ✅ | ✅ |
| `/api/search` | Read (Regex Search) | ✅ | ✅ | ✅ |
| `/api/settings` | Read | ✅ | ✅ | ✅ |
| `/api/favorites` | Read / Toggle | ❌ | ✅ | ✅ |
| `/api/reports` | Submit issue report | ❌ | ✅ | ✅ |
| `/api/reports/my` | View own reports | ❌ | ✅ | ✅ |
| `/api/reports` | View all reports / Update status | ❌ | ❌ | ✅ |
| `/api/buildings` | Create / Update / Delete | ❌ | ❌ | ✅ |
| `/api/buildings/:id/image` | Upload photo | ❌ | ❌ | ✅ |
| `/api/settings` | Update site config | ❌ | ❌ | ✅ |
| `/api/admin/users` | List / Edit / Delete users | ❌ | ❌ | ✅ |
| `/api/admin/analytics` | View platform metrics | ❌ | ❌ | ✅ |

---

## 8. Deployment & Infrastructure Topology

```
                         [ Git Repository (GitHub) ]
                                      |
                 +--------------------+--------------------+
                 |                                         |
                 v (Push Trigger)                          v (Push Trigger)
       [ Netlify CI / CD ]                        [ Render Blueprint ]
                 |                                         |
         npm run build                              npm install & start
                 |                                         |
                 v                                         v
       +--------------------+                    +--------------------+
       |   Netlify CDN /    |                    |  Render Node Svc   |
       |  Serverless Edge   |                    | (campus-compass-api)|
       +--------------------+                    +--------------------+
                 |                                         |
                 | HTTPS API Calls                         | Mongoose TLS
                 +---------------------------------------->|
                                                           v
                                                 +--------------------+
                                                 | MongoDB Atlas      |
                                                 | (Replica Set)      |
                                                 +--------------------+
```

- **Frontend Deployment (Netlify)**:
  - Configuration defined in `netlify.toml`.
  - SSR function built using Nitro to handle dynamic server routes and edge caching.
- **Backend Deployment (Render)**:
  - Infrastructure defined as code in `render.yaml`.
  - Automatic zero-downtime builds, health-check monitoring against `/`, and secure environment variable injection.
- **Database (MongoDB Atlas)**:
  - Cloud-hosted MongoDB cluster with automated backups, encryption at rest, and IP access rules.
