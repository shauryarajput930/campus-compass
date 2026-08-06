# Campus Compass — Backend (Reference)

Standalone Express + MongoDB REST API for the Campus Compass frontend.

> This folder is **reference code**. It does NOT run inside the editor or a
> cloud build environment. Copy this folder out to your own machine or a
> Render/Railway service to run it.

## Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer for image uploads
- CORS, dotenv, bcryptjs

## Setup

```bash
cd backend-reference
npm install
cp .env.example .env   # fill in MONGO_URI & JWT_SECRET
npm run dev
```

Server runs on `http://localhost:5000`.

Then in the frontend, add to `.env`:
```
VITE_API_URL=http://localhost:5000
```
(or your deployed Render URL) and restart the dev server.

## API

### Auth
- `POST /api/auth/register` — { name, email, password }
- `POST /api/auth/login` — { email, password }
- `GET  /api/auth/me` — requires Bearer token

### Buildings (public GET, admin write)
- `GET    /api/buildings`
- `GET    /api/buildings/:id`
- `POST   /api/buildings` (admin)
- `PUT    /api/buildings/:id` (admin)
- `DELETE /api/buildings/:id` (admin)
- `POST   /api/buildings/:id/image` (admin, multipart) — uploads image

### Search
- `GET /api/search?q=...`

## Deploy to Render

1. Push this folder to a GitHub repo.
2. Create a new **Web Service** on Render, root = `backend-reference/`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN=https://your-frontend.example.com`
6. Copy the Render URL into your frontend `VITE_API_URL`.

## Folder structure

```
backend-reference/
├── server.js
├── package.json
├── .env.example
├── uploads/          (created at runtime)
├── src/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Building.js
│   │   ├── Room.js
│   │   └── Favorite.js
│   └── routes/
│       ├── auth.js
│       ├── buildings.js
│       └── search.js
```
