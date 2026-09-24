import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import buildingRoutes from "./src/routes/buildings.js";
import searchRoutes from "./src/routes/search.js";
import adminRoutes from "./src/routes/admin.js";
import reportRoutes from "./src/routes/reports.js";
import settingsRoutes from "./src/routes/settings.js";
import favoriteRoutes from "./src/routes/favorites.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const rawOrigins = [
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : []),
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://psit-campus-compass.netlify.app",
  "https://campus-compass.netlify.app",
];

const allowedOrigins = rawOrigins
  .map((o) => (o ? o.trim().replace(/\/+$/, "") : ""))
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const cleanOrigin = origin?.trim().replace(/\/+$/, "");

  console.log(
    `[cors-debug] method=${req.method} origin=${cleanOrigin || "none"} url=${req.originalUrl || req.url}`
  );

  if (!origin || allowedOrigins.includes(cleanOrigin)) {
    if (cleanOrigin) {
      res.setHeader("Access-Control-Allow-Origin", cleanOrigin);
    }
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    console.log(
      `[cors-debug] preflight handled url=${req.originalUrl || req.url}`
    );
    return res.sendStatus(204);
  }

  next();
});
// 2. Body Parser & Static Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 3. API Routes
app.get("/", (_, res) => res.json({ ok: true, service: "campus-compass-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/favorites", favoriteRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  });
} else {
  connectDB();
}

export default app;

