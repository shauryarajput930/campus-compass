# Campus Compass

**Navigate Your Campus Smarter.**

Interactive campus navigation for PSIT — find any building, classroom, lab or facility in seconds, with real photos, live directions and turn-by-turn guidance.

## Stack

- **Frontend**: React 19 · TanStack Router · TanStack Start · Tailwind CSS v4 · Framer Motion · Axios · Google Maps · Lucide icons
- **Backend (reference)**: Node.js · Express · MongoDB · Mongoose · JWT · Multer — in `backend-reference/`

## Live behavior

- If `VITE_API_URL` is **unset**, the frontend runs on **local mock data** (localStorage-backed). Great for demos and design work.
- If `VITE_API_URL` is set to your Express server, the app calls that REST API instead.

## Frontend

```bash
# preview URL is served automatically in the editor
# for local dev:
npm install
npm run dev
```

Environment variables:

```
# optional — point to your Express+Mongo backend
VITE_API_URL=https://your-api.onrender.com
```

Google Maps is preconfigured via a generic connector; the browser key is read from `VITE_GOOGLE_MAPS_BROWSER_KEY`.

## Pages

1. Landing · 2. Login · 3. Register · 4. Dashboard · 5. Campus Map ·
6. Search · 7. Building Details · 8. Navigation · 9. Favourites ·
10. About · 11. Contact · 12. Admin Login · 13. Admin Dashboard · 14. 404

## Backend

See [`backend-reference/README.md`](./backend-reference/README.md) for the standalone Express + MongoDB API you deploy to Render.

## Deploy

- **Frontend**: Deploy using Vite, Netlify, Vercel, or any static host.
- **Backend**: Deploy `backend-reference/` to Render, set env vars, copy the URL into `VITE_API_URL`.

## Demo credentials

- User: any email/password
- Admin: any email starting with `admin` (e.g. `admin@psit.ac.in`) + any password
