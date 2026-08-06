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

r.get("/", async (_, res) => res.json(await Building.find().sort({ name: 1 })));
r.get("/:id", async (req, res) => {
  const b = await Building.findOne({ id: req.params.id });
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json(b);
});

r.post("/", auth, requireAdmin, async (req, res) => {
  try { res.json(await Building.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

r.put("/:id", auth, requireAdmin, async (req, res) => {
  const b = await Building.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json(b);
});

r.delete("/:id", auth, requireAdmin, async (req, res) => {
  await Building.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

r.post("/:id/image", auth, requireAdmin, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const b = await Building.findOneAndUpdate({ id: req.params.id }, { image: url }, { new: true });
  res.json({ url, building: b });
});

export default r;
