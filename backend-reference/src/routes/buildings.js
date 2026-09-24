import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Building from "../models/Building.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const r = Router();

r.get("/", async (_, res) => {
  try {
    const list = await Building.find().sort({ name: 1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.get("/:id", async (req, res) => {
  try {
    const b = await Building.findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: "Building not found" });
    res.json(b);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.post("/", auth, requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    if (!payload.id || !payload.id.trim()) {
      payload.id = "b_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    }
    const validCategories = ["academic", "hostel", "sports", "food", "facility", "admin", "medical"];
    if (!payload.category || !validCategories.includes(String(payload.category).toLowerCase())) {
      payload.category = "academic";
    } else {
      payload.category = String(payload.category).toLowerCase();
    }
    const b = await Building.findOneAndUpdate(
      { id: payload.id },
      { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`[DB] Building created/upserted in MongoDB: ${b.id} (${b.name})`);
    res.status(201).json(b);
  } catch (e) {
    console.error(`[DB] Building creation failed:`, e.message);
    res.status(400).json({ error: e.message });
  }
});

r.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    const validCategories = ["academic", "hostel", "sports", "food", "facility", "admin", "medical"];
    if (payload.category) {
      if (!validCategories.includes(String(payload.category).toLowerCase())) {
        payload.category = "academic";
      } else {
        payload.category = String(payload.category).toLowerCase();
      }
    }
    const b = await Building.findOneAndUpdate(
      { id: req.params.id },
      { $set: { ...payload, id: req.params.id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`[DB] Building updated/upserted in MongoDB: ${b.id} (${b.name})`);
    res.json(b);
  } catch (e) {
    console.error(`[DB] Building update failed:`, e.message);
    res.status(400).json({ error: e.message });
  }
});

r.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const result = await Building.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Building not found" });
    }
    console.log(`[DB] Building deleted: ${req.params.id}`);
    res.json({ ok: true, deletedId: req.params.id });
  } catch (e) {
    console.error(`[DB] Building deletion failed:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

r.post("/:id/image", auth, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const b = await Building.findOneAndUpdate(
      { id: req.params.id },
      { image: url },
      { new: true, upsert: true }
    );
    res.json({ url, building: b });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
