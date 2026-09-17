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

// 1. Unified CORS & OPTIONS Preflight Middleware (executes BEFORE express.json, auth, and routes)
const ALLOWED_ORIGIN = "https://psit-campus-compass.netlify.app";

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const clean = origin.trim().replace(/\/+$/, "");
  if (clean === ALLOWED_ORIGIN) return true;
  if (clean.endsWith(".netlify.app")) return true;
  if (clean.includes("localhost") || clean.includes("127.0.0.1")) return true;
  return false;
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const cleanOrigin = origin ? origin.trim().replace(/\/+$/, "") : "";

  console.log(`[cors-debug] method=${req.method} origin=${cleanOrigin || "none"} url=${req.originalUrl || req.url}`);

  if (cleanOrigin && isAllowedOrigin(cleanOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", cleanOrigin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    console.log(`[cors-debug] preflight handled method=OPTIONS url=${req.originalUrl || req.url}`);
    return res.sendStatus(204);
  }

  next();
});

// 2. Body Parser & Static Middleware
app.use(express.json({ limit: "5mb" }));
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

