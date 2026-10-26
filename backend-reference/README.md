# 🛠️ Campus Compass — Backend Reference API

RESTful API backend for **Campus Compass**, powering campus building directories, search, user management, feedback reporting, and personalized favorites for **PSIT Kanpur**.

Built with **Node.js (ES Modules)**, **Express.js**, and **MongoDB (Mongoose)**.

**⚡ Live Backend API**: [https://campus-compass-2x8k.onrender.com](https://campus-compass-2x8k.onrender.com)  
**🚀 Live Frontend App**: [https://campus-compass-lovat.vercel.app/](https://campus-compass-lovat.vercel.app/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Lifecycle & Auto-Seeding](#-database-lifecycle--auto-seeding)
- [Authentication Middleware Architecture](#-authentication-middleware-architecture)
- [REST API Reference](#-rest-api-reference)
  - [Authentication (`/api/auth`)](#1-authentication-apiauth)
  - [Buildings (`/api/buildings`)](#2-buildings-apibuildings)
  - [Search (`/api/search`)](#3-search-apisearch)
  - [Feedback Reports (`/api/reports`)](#4-feedback-reports-apireports)
  - [Favorites (`/api/favorites`)](#5-favorites-apifavorites)
  - [Site Settings (`/api/settings`)](#6-site-settings-apisettings)
  - [Admin Management (`/api/admin`)](#7-admin-management-apiadmin)
- [Static Asset Uploads](#-static-asset-uploads)
- [Deployment (Render)](#-deployment-render)

---

## 🧭 Overview

The backend reference server exposes a secure, high-performance API for Campus Compass. It features:
- **Dual Authentication**: Native support for **Clerk** session tokens alongside standard **JWT** tokens.
- **Automated MongoDB Sync**: Automatically provisions or syncs verified Clerk users into the local MongoDB database.
- **Admin Role Guards**: Granular permission checks for building modifications and user administrative workflows.
- **Zero-Config First Run**: Automatically seeds the complete PSIT campus landmark dataset if the MongoDB collection is empty.
- **Dynamic CORS Pipeline**: Supports wildcard localhost development origins and production Netlify domains.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | [Node.js](https://nodejs.org/) (ES Modules, `type: module`) |
| **Web Framework** | [Express 4.19](https://expressjs.com/) |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) with [Mongoose 8.5](https://mongoosejs.com/) |
| **Authentication** | [@clerk/backend 3.17](https://clerk.com/) & [jsonwebtoken 9.0](https://www.npmjs.com/package/jsonwebtoken) |
| **Password Hashing** | [bcryptjs 2.4](https://www.npmjs.com/package/bcryptjs) |
| **File Uploads** | [Multer 1.4](https://www.npmjs.com/package/multer) |
| **CORS** | [cors 2.8](https://www.npmjs.com/package/cors) |
| **Dev Server** | [Nodemon 3.1](https://nodemon.io/) |

---

## 📁 Project Directory Structure

```text
backend-reference/
├── server.js              # Server entrypoint, CORS configuration, and route mounts
├── uploads/               # Persistent disk storage for uploaded building images
├── src/
│   ├── config/
│   │   └── db.js          # MongoDB connection handler & automatic initial seeder
│   ├── middleware/
│   │   └── auth.js        # Hybrid Clerk/JWT token verifier & requireAdmin guard
│   ├── models/            # Mongoose Schema definitions
│   │   ├── Building.js    # Buildings, rooms, coordinates, and facilities
│   │   ├── Favorite.js    # User-building saved favorite relationships
│   │   ├── Report.js      # Student issue reports & triage states
│   │   ├── SiteSettings.js# Global site settings (contact info, hero image)
│   │   └── User.js        # User accounts, hashed passwords, roles
│   └── routes/            # Express modular routers
│       ├── admin.js       # User directory, password reset, analytics
│       ├── auth.js        # Registration, login, Google OAuth, password reset
│       ├── buildings.js   # Building CRUD operations and image uploads
│       ├── favorites.js   # User bookmarking and pin toggle
│       ├── reports.js     # Issue reporting and administrative triage
│       ├── search.js      # Case-insensitive campus directory search
│       └── settings.js    # Read/write site configuration
├── .env.example
├── package.json
└── package-lock.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or free cloud [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection URI

### Installation

1. Navigate to the `backend-reference` directory:
   ```bash
   cd backend-reference
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` file:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```

4. Configure your `.env` variables (see below).

5. Launch the development server with hot-reload:
   ```bash
   npm run dev
   ```

   The API server will listen at:
   ```text
   http://localhost:5000
   ```

6. For production execution:
   ```bash
   npm start
   ```

---

## 🔐 Environment Variables

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `5000` | Port on which the Express server listens. |
| `MONGO_URI` / `MONGODB_URI` | **Yes** | `mongodb+srv://...` | MongoDB connection connection string (TLS). |
| `JWT_SECRET` | **Yes** | `your-secret-key` | Secret key used for signing and verifying fallback JWT tokens. |
| `CLERK_SECRET_KEY` | Optional | `sk_test_...` | Clerk Secret Key for verifying Bearer tokens and retrieving user claims. |
| `CLIENT_ORIGIN` | Optional | `http://localhost:3000` | Comma-separated list of allowed frontend origins for CORS. |
| `ADMIN_EMAIL` | Optional | `admin@psit.ac.in` | Explicit email address granted admin privileges automatically. |
| `APP_URL` | Optional | `http://localhost:3000` | Frontend application URL for password reset links. |

---

## 📦 Database Lifecycle & Auto-Seeding

When the server initializes (`src/config/db.js`), it executes:
```javascript
const count = await Building.countDocuments();
if (count === 0) {
  await Building.insertMany(DEFAULT_INITIAL_BUILDINGS);
}
```
If your MongoDB database is newly created, it is automatically populated with the verified PSIT campus landmarks:
1. **Main Gate (Entrance)** (`main-gate`)
2. **Administrative Block** (`admin-block`)
3. **Computer Science & Engineering Block** (`cse-block`)
4. **Central Knowledge Library** (`central-library`)
5. **Central Food Court & Dining** (`central-food-court`)
6. **Boys Hostel Complex (Raman & Kalam Block)** (`boys-hostel-complex`)
7. **Girls Hostel Complex (Gargi Block)** (`girls-hostel-complex`)
8. **Sports Complex & Athletic Stadium** (`sports-complex`)
9. **Campus Medical Center & Infirmary** (`medical-center`)

---

## 🛡️ Authentication Middleware Architecture

The middleware in `src/middleware/auth.js` provides a dual-layer authentication strategy:

```
Incoming Request (Authorization: Bearer <token>)
                      │
                      ▼
          Is CLERK_SECRET_KEY set?
            ├── Yes ──► Verify token via @clerk/backend (30s clockSkew)
            │           ├── Valid: Extract claims (sub, email, role)
            │           │          Sync user into MongoDB User collection
            │           │          Set req.user = { id: mongoId, clerkId, email, role }
            │           └── Invalid: Fallback to JWT_SECRET check
            └── No  ──► Verify token via jsonwebtoken (JWT_SECRET)
                        Set req.user = decodedToken
```

### Role Authorization (`requireAdmin`)
Guards administrative endpoints (`POST /api/buildings`, `DELETE /api/buildings/:id`, `PATCH /api/reports/:id`, etc.). Requires:
- `req.user.role === 'admin'`, or
- Email matching `ADMIN_EMAIL`, or
- Email ending with `@admin.psit.ac.in` / starting with `admin`.

---

## 🔌 REST API Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | None | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | None | Authenticate with email and password |
| `POST` | `/api/auth/google` | None | Authenticate using Google Identity credential token |
| `GET` | `/api/auth/me` | User | Retrieve current user profile from token |
| `POST` | `/api/auth/forgot-password` | None | Request password reset email |
| `POST` | `/api/auth/reset-password` | None | Reset password with token (`token`, `password`) |

### 2. Buildings (`/api/buildings`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/buildings` | None | Fetch all buildings sorted alphabetically by name |
| `GET` | `/api/buildings/:id` | None | Fetch building details by string identifier (e.g. `cse-block`) |
| `POST` | `/api/buildings` | Admin | Create or upsert a building document |
| `PUT` | `/api/buildings/:id` | Admin | Update building details |
| `DELETE` | `/api/buildings/:id` | Admin | Delete a building by ID |
| `POST` | `/api/buildings/:id/image` | Admin | Upload a photo for a building (multipart `image` field) |

#### Building Object Schema:
```json
{
  "id": "cse-block",
  "name": "Computer Science & Engineering Block",
  "code": "CSE-02",
  "department": "Computer Science & Engineering",
  "category": "academic",
  "lat": 26.4502,
  "lng": 80.1932,
  "floors": 4,
  "openingTime": "08:30 AM - 06:00 PM",
  "facilities": ["High-speed Wi-Fi", "Air Conditioned Labs", "Smart Classrooms"],
  "image": "https://...",
  "rooms": [
    { "number": "CS-101", "type": "AI & ML Innovation Lab", "floor": 1 }
  ]
}
```

### 3. Search (`/api/search`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/search?q=query` | None | Case-insensitive regex search across building names, codes, departments, facilities, and room numbers (limit: 50) |

### 4. Feedback Reports (`/api/reports`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/reports` | User | Submit feedback report (`buildingId`, `message`, `category`) |
| `GET` | `/api/reports/my` | User | Retrieve current user's submitted reports |
| `GET` | `/api/reports` | Admin | Retrieve all reports across campus |
| `PATCH`| `/api/reports/:id` | Admin | Update report status (`pending`, `approved`, `rejected`, `resolved`) |

### 5. Favorites (`/api/favorites`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/favorites` | User | Get array of favorite building IDs for user |
| `POST` | `/api/favorites` | User | Toggle building favorite status (`buildingId`) |
| `DELETE`| `/api/favorites/:buildingId`| User | Remove building from favorites |

### 6. Site Settings (`/api/settings`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/settings` | None | Get site settings (contact email, phone, social URLs, hero image) |
| `PUT` | `/api/settings` | Admin | Update site settings |

### 7. Admin Management (`/api/admin`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/admin/users` | Admin | Retrieve user list (excluding password hashes) |
| `POST` | `/api/admin/users` | Admin | Create user account directly (`name`, `email`, `password`, `role`) |
| `PATCH`| `/api/admin/users/:id` | Admin | Update user details or active status |
| `DELETE`| `/api/admin/users/:id`| Admin | Delete user account (prevents self-deletion) |
| `POST` | `/api/admin/users/:id/reset-password` | Admin | Administrative password override |
| `GET` | `/api/admin/analytics` | Admin | Retrieve aggregate stats (total users, reports, top 5 favorites) |

---

## 🖼️ Static Asset Uploads

- Building photos uploaded via `POST /api/buildings/:id/image` are processed by Multer and stored in the local `uploads/` directory.
- The files are served publicly at:
  ```text
  http://localhost:5000/uploads/<filename>
  ```
- File uploads are validated with a 5MB maximum file size limit.

---

## 🌐 Deployment (Render)

The backend is configured for automated deployment to **Render** using `render.yaml`:

```yaml
services:
  - type: web
    name: campus-compass-api
    runtime: node
    rootDir: backend-reference
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: CLIENT_ORIGIN
        sync: false
```

### Steps:
1. Connect your repository to Render.
2. Select **Web Service** or create from **Blueprint** (`render.yaml`).
3. Set the Root Directory to `backend-reference`.
4. Provide your `MONGO_URI`, `CLIENT_ORIGIN` (`http://localhost:5173,https://campus-compass-lovat.vercel.app`), `APP_URL` (`https://campus-compass-lovat.vercel.app`), and optionally `CLERK_SECRET_KEY`.
5. Render will automatically execute health checks against `/` and deploy the service with HTTPS.
