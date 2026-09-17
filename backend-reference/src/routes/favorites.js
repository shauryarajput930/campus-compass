import { Router } from "express";
import Favorite from "../models/Favorite.js";
import { auth } from "../middleware/auth.js";

const r = Router();

// GET all favorites for authenticated user
r.get("/", auth, async (req, res) => {
  try {
    const list = await Favorite.find({ userId: req.user.id });
    res.json(list.map((f) => f.buildingId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST toggle/add favorite
r.post("/", auth, async (req, res) => {
  try {
    const { buildingId } = req.body;
    if (!buildingId) return res.status(400).json({ error: "buildingId required" });
    const existing = await Favorite.findOne({ userId: req.user.id, buildingId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      const list = await Favorite.find({ userId: req.user.id });
      return res.json({ favorites: list.map((f) => f.buildingId), favorited: false });
    }
    await Favorite.create({ userId: req.user.id, buildingId });
    const list = await Favorite.find({ userId: req.user.id });
    res.json({ favorites: list.map((f) => f.buildingId), favorited: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE favorite
r.delete("/:buildingId", auth, async (req, res) => {
  try {
    await Favorite.deleteOne({ userId: req.user.id, buildingId: req.params.buildingId });
    const list = await Favorite.find({ userId: req.user.id });
    res.json({ favorites: list.map((f) => f.buildingId) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
