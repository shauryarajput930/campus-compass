import { Router } from "express";
import Report from "../models/Report.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const r = Router();

r.post("/", auth, async (req, res) => {
  try {
    const { buildingId, buildingName, category, message } = req.body;
    if (!buildingId || !message) {
      return res.status(400).json({ error: "buildingId and message are required" });
    }
    const report = await Report.create({
      userId: req.user.id,
      userName: req.user.name || req.body.userName || "",
      userEmail: req.user.email || req.body.userEmail || "",
      buildingId,
      buildingName: buildingName || "",
      category: category || "details",
      message: message.trim(),
      status: "pending",
    });
    res.status(201).json(report);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

r.get("/my", auth, async (req, res) => {
  try {
    const reports = await Report.find({
      $or: [
        { userId: req.user.id },
        { userEmail: req.user.email },
      ],
    }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.get("/", auth, requireAdmin, async (_, res) => {
  try {
    res.json(await Report.find().sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.patch("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const validStatuses = ["pending", "approved", "rejected", "resolved"];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;