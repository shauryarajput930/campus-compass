import { Router } from "express";
import Report from "../models/Report.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.post("/", auth, async (req, res) => { try { res.status(201).json(await Report.create({ ...req.body, userId: req.user.id })); } catch (e) { res.status(400).json({ error: e.message }); } });
r.get("/my", auth, async (req, res) => res.json(await Report.find({ userId: req.user.id }).sort({ createdAt: -1 })));
r.get("/", auth, requireAdmin, async (_, res) => res.json(await Report.find().sort({ createdAt: -1 })));
r.patch("/:id", auth, requireAdmin, async (req, res) => { const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); if (!report) return res.status(404).json({ error: "Report not found" }); res.json(report); });
export default r;