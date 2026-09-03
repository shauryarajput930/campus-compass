# Campus Compass

Interactive campus navigation for PSIT. Find buildings, classrooms, labs and facilities, view campus locations, save favourites and get turn-by-turn guidance.

## Project Structure

- `frontend/` - React and TanStack Router web application
- `backend-reference/` - Standalone Express and MongoDB REST API

The backend is kept as reference code and runs as a separate service from the frontend.

## Technology Stack

### Frontend

- React 19
- TanStack Router and TanStack Start
- Vite
- Tailwind CSS v4
- Framer Motion
- Axios
- Google Maps
- Lucide icons

### Backend

- Node.js and Express
- MongoDB and Mongoose
- JWT authentication
- Multer image uploads
- CORS, dotenv and bcryptjs

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB, only when using the backend API

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The development server is normally available at the URL printed in the terminal.

Useful commands:

```bash
npm run build
npm run preview
npm run lint
```

### Frontend Environment Variables

Create `frontend/.env` when connecting to a backend or Google Maps:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_BROWSER_KEY=your_google_maps_browser_key
```

`VITE_API_URL` is optional. When it is not set, the frontend uses local mock data backed by localStorage.

## Run the Backend

```bash
cd backend-reference
npm install
npm run dev
```

The API runs at `http://localhost:5000` by default. Copy `.env.example` to `.env` and set the database and authentication values before starting it:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
```

Use `npm start` to run the backend without nodemon.

## API Overview

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` - requires a Bearer token

### Buildings

- `GET /api/buildings`
- `GET /api/buildings/:id`
- `POST /api/buildings` - admin only
- `PUT /api/buildings/:id` - admin only
- `DELETE /api/buildings/:id` - admin only
- `POST /api/buildings/:id/image` - admin only, multipart upload

### Search

- `GET /api/search?q=...`

## Main Features

- Campus map and building discovery
- Search for campus locations
- Building detail pages with photos and information
- Navigation and route insights
- QR code scanning
- User registration, login and password reset flows
- Favourites and recent routes
- Admin dashboard for building management
- Optional AI and voice-search integrations

## Deployment

### Frontend

Build the frontend with `npm run build`, then deploy the generated application using Vercel, Netlify or another compatible host.

### Backend

Deploy `backend-reference/` as a separate Render or Railway service:

- Root directory: `backend-reference/`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET` and `CLIENT_ORIGIN`

After deployment, set the deployed API URL as the frontend `VITE_API_URL` value.

## Demo Credentials

When the frontend is running without `VITE_API_URL`:

- User: any email and password
- Admin: any email starting with `admin`, such as `admin@psit.ac.in`, and any password
