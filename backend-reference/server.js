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

// 1. CORS Configuration (placed BEFORE all body parsers and routes)
const allowedOrigins = [
  "https://psit-campus-compass.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/+$/, "");

    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".netlify.app") ||
      cleanOrigin.includes("localhost") ||
      cleanOrigin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Ensure CORS headers are attached on all responses (including 401/403 error responses and preflights)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const cleanOrigin = origin.trim().replace(/\/+$/, "");
    res.setHeader("Access-Control-Allow-Origin", cleanOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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

