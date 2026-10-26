import { Router } from "express";
import { isDBConnected } from "../config/db.js";
import { successResponse } from "../utils/response.js";

const router = Router();

router.get("/health", (req, res) => {
  successResponse(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDBConnected() ? "connected" : "disconnected",
  });
});

router.get("/", (req, res) => {
  successResponse(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDBConnected() ? "connected" : "disconnected",
  });
});

export default router;

if (typeof module !== "undefined" && module.exports) {
  module.exports = router;
}
