# 📊 Campus Compass — Architecture Diagrams

This document provides visual architectural diagrams, flowcharts, and sequence models illustrating the components, data pipelines, authentication lifecycles, and deployment topologies of **Campus Compass**.

---

## 📑 Diagram Index

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [End-to-End Component Interaction & Data Flow](#2-end-to-end-component-interaction--data-flow)
3. [Frontend Route & Component Hierarchy](#3-frontend-route--component-hierarchy)
4. [Hybrid Data Layer: Real API vs Demo Mode](#4-hybrid-data-layer-real-api-vs-demo-mode)
5. [Authentication & Authorization Sequence](#5-authentication--authorization-sequence)
6. [Navigation & Routing Subsystem Flowchart](#6-navigation--routing-subsystem-flowchart)
7. [Database Entity Relationship Diagram (ERD)](#7-database-entity-relationship-diagram-erd)
8. [DevOps & Cloud Deployment Infrastructure](#8-devops--cloud-deployment-infrastructure)

---

## 1. High-Level System Architecture

This diagram shows the high-level tier breakdown from the user's browser down to persistence and third-party SaaS providers.

```mermaid
graph TB
    subgraph Client ["Client Presentation Tier (Browser)"]
        UI["React 19 SPA / TanStack Start"]
        GIS["Leaflet Map Engine & GPS Watcher"]
        Cache["LocalStorage & Browser State Cache"]
        Scanner["Camera QR Code Scanner"]
    end

    subgraph Edge ["Edge & SSR Tier (Netlify)"]
        NetlifyEdge["Netlify Edge CDN"]
        ServerFns["TanStack Start Server Functions"]
        GeminiProxy["AI Gateway (Gemini 2.5 Flash)"]
    end

    subgraph Backend ["Application Services Tier (Render)"]
        Express["Express.js Server Engine"]
        AuthMid["Hybrid Auth Middleware (Clerk + JWT)"]
        Uploads["Multer File & Asset Handler"]
        APIRoutes["Modular REST Endpoints\n(/auth, /buildings, /reports, /admin, /favorites)"]
    end

    subgraph Persistence ["Data & Storage Tier"]
        Mongo[("MongoDB Atlas Database\n(Users, Buildings, Reports, Favorites)")]
        DiskStorage[("Local Disk /uploads\n(Building Photos)")]
    end

    subgraph External ["External SaaS Services"]
        Clerk["Clerk Identity Provider"]
        OSRM["OSRM Walking Routing API"]
        MapTiler["MapTiler / OpenStreetMap Tiles"]
        Gemini["Google Gemini AI API"]
    end

    %% Client to Edge & Backend
    UI -->|"HTTP / Asset Requests"| NetlifyEdge
    UI -->|"REST API Calls (Bearer Token)"| Express
    GIS -->|"Tile Fetch"| MapTiler
    GIS -->|"Routing Calculation"| OSRM
    ServerFns -->|"LLM Queries"| Gemini

    %% Edge
    NetlifyEdge --> ServerFns
    ServerFns --> GeminiProxy
    GeminiProxy --> Gemini

    %% Express Backend Pipeline
    Express --> AuthMid
    AuthMid --> APIRoutes
    AuthMid -.->|"Token Verification"| Clerk
    APIRoutes --> Uploads
    Uploads --> DiskStorage
    APIRoutes -->|"Mongoose Queries"| Mongo
    UI -.->|"Offline Fallback Reads/Writes"| Cache
```

---

## 2. End-to-End Component Interaction & Data Flow

This diagram illustrates how data flows between UI views, internal helper libraries, local storage, the backend API, and external routing services.

```mermaid
flowchart TD
    User([Campus User / Admin]) -->|Selects Route or Searches| View["Page View\n(Map / Navigate / Search / Buildings)"]

    View -->|Queries Data| Query["TanStack Query Cache"]

    Query -->|Cache Miss| API["API Client (src/lib/api.ts)"]

    API --> CheckMode{Is VITE_API_URL Configured?}

    %% Mock / Offline Flow
    CheckMode -->|No: Demo Mode| MockFlow["Local Mock Adapter"]
    MockFlow -->|Read / Write| LS[("Browser LocalStorage\n(cc_buildings, cc_user, cc_favorites)")]
    MockFlow -->|Canvas Downsample| Compression["Base64 Image Compressor"]
    MockFlow -->|Dispatch Event| EventBus["cc-buildings-changed Event"]
    EventBus --> View

    %% Real API Flow
    CheckMode -->|Yes: Real API| Interceptor["Axios Request Interceptor"]
    Interceptor -->|Inject Bearer Token| TokenSource["Clerk getToken() or cc_token"]
    Interceptor --> ExpressAPI["Express REST Server (:5000)"]
    ExpressAPI --> Mongoose["Mongoose Models"]
    Mongoose --> MongoDB[("MongoDB Atlas Database")]

    %% Navigation Flow
    View -->|Request Directions| NavEngine["OSRM Routing Engine (osrm-routing.ts)"]
    NavEngine --> TryOSRM{"Call OSRM Walking API"}
    TryOSRM -->|Success| OSRMResult["OSRM Turn-by-Turn Polyline"]
    TryOSRM -->|Network Timeout / Fail| CampusGraph["Internal Campus Waypoint Graph\n(psit-campus-config.ts)"]
    CampusGraph --> FallbackRoute["Interpolated Campus Route"]
    OSRMResult --> LeafletMap["Leaflet Polyline Layer & UI Insights"]
    FallbackRoute --> LeafletMap
```

---

## 3. Frontend Route & Component Hierarchy

This diagram details the nested component and layout structure across the TanStack Router tree.

```mermaid
graph TD
    Root["__root.tsx (Root Layout)"]
    
    subgraph Providers ["Context & State Providers"]
        QP["QueryClientProvider"]
        TP["ThemeProvider (Dark / Light)"]
        MP["MotionProvider (Animations)"]
        CP["ClerkProvider"]
        AP["AuthProvider (User & Role)"]
    end

    subgraph Chrome ["Global UI Chrome"]
        Nav["Navbar (Header & Nav Links)"]
        Foot["Footer (PSIT Contact & Social)"]
        Toaster["Sonner Toast Notifications"]
    end

    subgraph Pages ["Route Pages"]
        Home["/ (Landing & Feature Grid)"]
        MapPage["/map (Interactive Campus Map)"]
        NavPage["/navigate (Turn-by-Turn GPS Navigator)"]
        BuildingDetail["/buildings/:id (Floor Plans & Rooms)"]
        SearchPage["/search (Voice, Filter & AI Suggestions)"]
        ScanPage["/scan (Camera QR Code Scanner)"]
        FavPage["/favorites (Pinned Locations)"]
        DashPage["/dashboard (Student Activity & Reports)"]
        AdminLogin["/admin (Admin Portal Login)"]
        AdminDash["/admin/dashboard (Full Management Center)"]
        AuthPages["/login, /register, /forgot-password, /reset-password"]
    end

    subgraph ReusableComponents ["Key Components"]
        CMap["CampusMap (Leaflet Container)"]
        BCard["BuildingCard"]
        RInsights["RouteInsights"]
        QRComp["QRCode Display & Scanner"]
        GSign["GoogleSignIn Button"]
        PinIcon["LocationPinIcon (Category SVG)"]
    end

    Root --> Providers
    Providers --> Chrome
    Chrome --> Pages

    MapPage --> CMap
    NavPage --> CMap
    NavPage --> RInsights
    BuildingDetail --> QRComp
    BuildingDetail --> CMap
    SearchPage --> BCard
    Home --> BCard
    AdminDash --> CMap
    CMap --> PinIcon
```

---

## 4. Hybrid Data Layer: Real API vs Demo Mode

Campus Compass is engineered to run seamlessly with zero configuration (offline demo mode) or as a distributed cloud system.

```mermaid
stateDiagram-v2
    [*] --> InitializeApp
    InitializeApp --> CheckEnv: Read import.meta.env.VITE_API_URL

    state "Full Cloud Mode (VITE_API_URL is Set)" as CloudMode {
        [*] --> AxiosClient: Point to Render Backend
        AxiosClient --> ClerkAuth: Check Clerk Session / JWT
        ClerkAuth --> ExpressRoutes: Call /api/* Endpoints
        ExpressRoutes --> AtlasDB: Persist in MongoDB Atlas
        AtlasDB --> ExpressRoutes
        ExpressRoutes --> UIUpdate: Return JSON Payloads
    }

    state "Demo Mode (VITE_API_URL is Empty)" as DemoMode {
        [*] --> MockData: Load Seed Buildings (mock-data.ts)
        MockData --> StorageSync: Check LocalStorage (cc_buildings)
        StorageSync --> BrowserMutations: Apply Updates Locally
        BrowserMutations --> CanvasOptimizer: Downscale User Photos
        CanvasOptimizer --> LocalStorageSave: Commit to Storage Quota
        LocalStorageSave --> BroadcastChange: Dispatch CustomEvent
    }

    CheckEnv --> CloudMode: URL Available
    CheckEnv --> DemoMode: URL Unset / Offline
```

---

## 5. Authentication & Authorization Sequence

This sequence diagram depicts how authentication credentials flow and synchronize user accounts between Clerk, local JWT storage, and MongoDB.

```mermaid
sequenceDiagram
    autonumber
    actor User as Campus User / Admin
    participant Frontend as Frontend App (React 19)
    participant Clerk as Clerk Identity API
    participant Express as Express Backend (:5000)
    participant AuthMid as Auth Middleware (auth.js)
    participant MongoDB as MongoDB Atlas (User Collection)

    %% Flow 1: Login via Clerk
    Note over User,Clerk: Scenario A: Passwordless Clerk Login
    User->>Frontend: Clicks "Sign In" (Clerk Modal)
    Frontend->>Clerk: Submit Credentials / OAuth
    Clerk-->>Frontend: Return Session & Short-Lived JWT Token
    Frontend->>Frontend: Save Token in Memory & LocalStorage

    %% Flow 2: Authenticated Request to Backend
    Note over Frontend,MongoDB: API Request with Bearer Token
    Frontend->>Express: GET /api/reports/my (Header: Bearer <Token>)
    Express->>AuthMid: Execute auth(req, res, next)
    AuthMid->>Clerk: verifyToken(token, { secretKey, clockSkew })
    Clerk-->>AuthMid: Return Decoded Token Claims (sub, email, role)

    %% Flow 3: MongoDB Sync
    AuthMid->>MongoDB: User.findOne({ email: claims.email })
    alt User not found in MongoDB
        AuthMid->>MongoDB: User.create({ name, email, role, clerkId: claims.sub })
        MongoDB-->>AuthMid: Created User Document (Mongo _id)
    else User exists
        AuthMid->>MongoDB: Sync Role & Update Last Seen
        MongoDB-->>AuthMid: Existing User Document (Mongo _id)
    end

    AuthMid->>AuthMid: Attach req.user = { id: MongoID, email, role }
    AuthMid->>Express: next() -> Invoke Route Controller
    Express->>MongoDB: Query Reports by userId
    MongoDB-->>Express: Return User's Reports
    Express-->>Frontend: 200 OK + JSON Data
    Frontend-->>User: Render User Feedback & Status
```

---

## 6. Navigation & Routing Subsystem Flowchart

This flowchart demonstrates the turn-by-turn calculation and fallback logic executed during campus walking directions.

```mermaid
flowchart TD
    Start([User Initiates Walking Route]) --> CheckLoc{Is GPS Available?}

    CheckLoc -->|Yes| ReadGPS[Read navigator.geolocation Coordinates]
    CheckLoc -->|No| PickOrigin[User Selects Origin Building from List]

    ReadGPS --> CheckGeofence{Within PSIT Campus Geofence?}
    CheckGeofence -->|Outside Geofence| Warn[Display 'Outside Campus' Warning]
    Warn --> PickOrigin
    CheckGeofence -->|Inside Geofence| SetOrigin[Set Origin Lat/Lng]
    PickOrigin --> SetOrigin

    SetOrigin --> SelectDest[User Selects Destination Building]
    SelectDest --> FetchRoute[Call osrm-routing.ts]

    FetchRoute --> CallOSRM{Call OSRM Foot Server}

    CallOSRM -->|HTTP 200 & Coordinates Found| ParseOSRM[Extract GeoJSON Points & Step Instructions]
    ParseOSRM --> CalcDistance[Compute Distance & Duration]

    CallOSRM -->|Timeout / Rate-Limit / Error| FallbackGraph[Fallback to Campus Waypoint Graph]
    FallbackGraph --> SnapWaypoints[Snap Origin & Destination to Nearest Path Nodes]
    SnapWaypoints --> InterpolatePath[Generate Realistic Walkway Polyline]
    InterpolatePath --> HaversineCalc[Calculate Haversine Distance & Step Directions]

    CalcDistance --> RenderMap[Render Polyline on Leaflet Canvas Layer]
    HaversineCalc --> RenderMap

    RenderMap --> GenInsights[Calculate Walking Calories & Pace Insights]
    GenInsights --> LiveTrack{Enable Live GPS Follow?}

    LiveTrack -->|Yes| Watcher[watchPosition Updates User Marker Along Route]
    LiveTrack -->|No| Done([Route Rendered])
    Watcher --> Done
```

---

## 7. Database Entity Relationship Diagram (ERD)

This entity relationship diagram outlines the database entities, field types, relationships, and compound indexes.

```mermaid
erDiagram
    USER ||--o{ FAVORITE : "saves"
    USER ||--o{ REPORT : "submits"
    BUILDING ||--o{ REPORT : "referenced in"
    BUILDING ||--o{ ROOM : "contains"

    USER {
        ObjectId _id PK
        string name
        string email UK "Indexed, lowercase"
        string password "Bcrypt hash"
        string role "'user' | 'admin'"
        boolean active "Default: true"
        datetime createdAt
        datetime updatedAt
    }

    BUILDING {
        ObjectId _id PK
        string id UK "Text slug, indexed"
        string name "Text indexed"
        string code
        string icon
        string department "Text indexed"
        string_array programs
        string description "Text indexed"
        string openingTime
        string_array facilities
        string image
        string_array gallery
        string category "'academic'|'hostel'|'sports'|'food'|'facility'|'admin'|'medical'"
        float lat
        float lng
        int floors
        datetime createdAt
        datetime updatedAt
    }

    ROOM {
        string number
        string type
        int floor
    }

    FAVORITE {
        ObjectId _id PK
        ObjectId userId FK "Indexed, ref: User"
        string buildingId "Indexed, ref: Building.id"
        datetime createdAt
        datetime updatedAt
    }

    REPORT {
        ObjectId _id PK
        ObjectId userId FK "Indexed, ref: User"
        string userName
        string userEmail
        string buildingId "Indexed"
        string buildingName
        string category "'location' | 'details' | 'other'"
        string message
        string status "'pending' | 'approved' | 'rejected' | 'resolved'"
        datetime createdAt
        datetime updatedAt
    }

    SITESETTINGS {
        ObjectId _id PK
        string key UK "Default: 'main'"
        string homeBackground
        string contactEmail
        string contactPhone
        string instagram
        string linkedin
        string twitter
    }
```

---

## 8. DevOps & Cloud Deployment Infrastructure

This diagram presents the cloud hosting topology, deployment automation pipelines, and network ingress paths.

```mermaid
graph LR
    subgraph Repo ["Source Code & Version Control"]
        Git["GitHub Repository\n(shauryarajput930/campus-compass)"]
    end

    subgraph NetlifyCloud ["Frontend Hosting (Netlify)"]
        NetlifyWebhook["Netlify Deploy Hook"]
        NetlifyBuild["Vite & Nitro SSR Build\n(Node 20 Runtime)"]
        CDN["Netlify High-Performance Edge CDN"]
        ServerlessFn["Netlify Serverless Functions\n(/.netlify/functions-internal/server)"]
    end

    subgraph RenderCloud ["Backend Hosting (Render)"]
        RenderWebhook["Render Deploy Hook"]
        RenderBuild["Render Build Engine\n(npm install & start)"]
        NodeService["Express 4.19 Web Service\n(campus-compass-api)"]
    end

    subgraph AtlasCloud ["Database Cluster (MongoDB Atlas)"]
        Cluster["MongoDB Atlas 3-Node Replica Set\n(TLS Encrypted, Automated Backups)"]
    end

    %% Webhooks
    Git -->|"Git Push (frontend/)"| NetlifyWebhook
    Git -->|"Git Push (backend-reference/)"| RenderWebhook

    %% Netlify Pipeline
    NetlifyWebhook --> NetlifyBuild
    NetlifyBuild --> CDN
    NetlifyBuild --> ServerlessFn

    %% Render Pipeline
    RenderWebhook --> RenderBuild
    RenderBuild --> NodeService

    %% Traffic Flow
    UserClient([End User Browser]) -->|"HTTPS Requests"| CDN
    CDN -->|"SSR Routing"| ServerlessFn
    UserClient -->|"REST API Requests (/api/*)"| NodeService
    NodeService -->|"Mongoose TLS Connection"| Cluster
```
