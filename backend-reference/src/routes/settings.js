import { Router } from "express";
import SiteSettings from "../models/SiteSettings.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.get("/", async (_, res) => res.json(await SiteSettings.findOne({ key: "main" }) || { contactEmail: "", contactPhone: "", instagram: "", linkedin: "", twitter: "" }));
r.put("/", auth, requireAdmin, async (req, res) => res.json(await SiteSettings.findOneAndUpdate({ key: "main" }, { ...req.body, key: "main" }, { upsert: true, new: true })));
export default r;