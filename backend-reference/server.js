import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB, isDBConnected } from "./src/config/db.js";
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
    return res.sendStatus(204);
  }

  next();
});

// 2. Body Parser & Static Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 3. Health & Readiness Endpoints
app.get("/", (_, res) => res.json({ ok: true, service: "campus-compass-api", database: isDBConnected() ? "connected" : "disconnected" }));

app.get("/api/health", (_, res) => {
  const connected = isDBConnected();
  return res.status(connected ? 200 : 503).json({
    status: connected ? "healthy" : "unhealthy",
    database: connected ? "connected" : "disconnected",
    readyState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

// Guard: prevent processing requests if database is disconnected
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (!isDBConnected()) {
    return res.status(503).json({
      error: "Database unavailable: MongoDB is not connected. Please verify your database connection.",
    });
  }
  next();
});

// 4. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/favorites", favoriteRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`[API] Campus Compass API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("[API] Fatal startup error: Could not connect to MongoDB. Server halted:", err.message);
    process.exit(1);
  }
} else {
  connectDB().catch((err) => console.error("[API] MongoDB connection error:", err.message));
}

export default app;
