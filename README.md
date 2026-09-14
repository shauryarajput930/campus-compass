# Campus Compass

Campus Compass is a PSIT campus navigation web app. Discover buildings and facilities, search rooms and services, view live location on the map, save favourites, and get walking directions.

## Project Structure

- `frontend/` - React 19, TanStack Start and Vite application
- `backend-reference/` - standalone Express, MongoDB and JWT API

The frontend works in demo mode without a backend. Mock data, favourites, reports and site settings are stored locally in the browser when `VITE_API_URL` is not configured.

## Requirements

- Node.js 18 or newer
- npm
- MongoDB, only when running the backend API

Location permission is required before public frontend pages open. Use `localhost` or HTTPS because browser geolocation is restricted to secure contexts.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run preview
npm run lint
```

Optional `frontend/.env` values:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MAPTILER_KEY=your_maptiler_key
```

`VITE_API_URL` enables the Express API. Without it, the frontend uses local mock data. The map uses Leaflet with OpenStreetMap tiles by default and can use MapTiler when a key is supplied. Google sign-in is optional. The frontend dev server normally runs at `http://localhost:3000`.

## Backend Setup

```bash
cd backend-reference
npm install
copy .env.example .env
npm run dev
```

The API runs at `http://localhost:5000`. Set these values in `backend-reference/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
```

Use `npm start` to run without nodemon.

## Main Features

- Campus map with building markers, building details and live user location
- Google Maps-style user marker that updates while the user moves
- Search, route planning, OSRM walking directions and route insights
- QR code scanning and optional voice search
- Registration, login, password reset and Google sign-in
- Favourites and recent routes
- Team and about pages
- User feedback reports with login required
- Public dashboard showing the signed-in user's report history and status
- Admin building management, coordinate editing and home hero image settings
- Admin user management, role/status controls and password reset
- Admin analytics, feedback review and contact/social site settings
- Optional AI assistance

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/buildings`
- `GET /api/buildings/:id`
- `POST`, `PUT`, `DELETE /api/buildings/:id` (admin)
- `POST /api/buildings/:id/image` (admin)
- `GET /api/search?q=...`
- `POST /api/reports` (authenticated user)
- `GET /api/reports/my` (authenticated user)
- `GET /api/reports` (admin)
- `PATCH /api/reports/:id` (admin)
- `GET /api/settings`
- `PUT /api/settings` (admin)
- `GET /api/admin/users` (admin)
- `PATCH /api/admin/users/:id` (admin)
- `POST /api/admin/users/:id/reset-password` (admin)
- `GET /api/admin/analytics` (admin)

## Admin Portal

Open `/admin` to sign in and `/admin/dashboard` to manage the platform. The dashboard includes building CRUD, map coordinate editing, user roles and account status, password reset, analytics, feedback states, site contact/social settings and homepage background settings.

Feedback reports can only be submitted by signed-in users. Admins can review the reporter name, email, building, problem type, message, timestamp and state (`pending`, `approved`, `rejected` or `resolved`).

## Deployment

Build the frontend with `npm run build` and deploy it to Vercel, Netlify, or another compatible host. Deploy `backend-reference/` separately to Render or Railway with `npm install` as the build command and `npm start` as the start command. Set the deployed API URL as the frontend `VITE_API_URL` value. In production, serve the frontend over HTTPS so browser location permission works.

## Demo Credentials

Without `VITE_API_URL`, any email and password can be used for a demo user. An email beginning with `admin`, such as `admin@psit.ac.in`, opens the demo admin experience.
