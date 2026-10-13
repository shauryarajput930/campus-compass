import { Router } from "express";
import SiteSettings from "../models/SiteSettings.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const r = Router();

const DEFAULT_SETTINGS = {
  homeBackground: "",
  contactEmail: "support@campuscompass.in",
  contactPhone: "+91 1800 123 4567",
  instagram: "https://instagram.com/psitkanpur",
  linkedin: "https://linkedin.com/school/psit-kanpur",
  twitter: "https://x.com/psitkanpur",
};

r.get("/", async (_, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: "main" });
    if (!settings) {
      settings = await SiteSettings.create({ ...DEFAULT_SETTINGS, key: "main" });
    }
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.put("/", auth, requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, key: "main" };
    delete payload._id;
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;