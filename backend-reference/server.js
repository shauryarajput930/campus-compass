import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import buildingRoutes from "./src/routes/buildings.js";
import searchRoutes from "./src/routes/search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") ?? "*" }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_, res) => res.json({ ok: true, service: "campus-compass-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/search", searchRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  });
} else {
  connectDB();
}

export default app;

