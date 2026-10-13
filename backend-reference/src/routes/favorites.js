import { Router } from "express";
import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import { auth } from "../middleware/auth.js";

const r = Router();

// GET all favorites for authenticated user from MongoDB
r.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await Favorite.find({ userId }).sort({ createdAt: -1 });
    res.json(list.map((f) => f.buildingId));
  } catch (e) {
    console.error("[favorites] GET error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST toggle/add favorite in MongoDB
r.post("/", auth, async (req, res) => {
  try {
    const { buildingId } = req.body;
    if (!buildingId || typeof buildingId !== "string") {
      return res.status(400).json({ error: "buildingId string is required" });
    }
    const cleanBuildingId = buildingId.trim();
    const userId = req.user.id;

    const existing = await Favorite.findOne({ userId, buildingId: cleanBuildingId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      const list = await Favorite.find({ userId }).sort({ createdAt: -1 });
      return res.json({ favorites: list.map((f) => f.buildingId), favorited: false });
    }

    await Favorite.create({ userId, buildingId: cleanBuildingId });
    const list = await Favorite.find({ userId }).sort({ createdAt: -1 });
    res.json({ favorites: list.map((f) => f.buildingId), favorited: true });
  } catch (e) {
    console.error("[favorites] POST error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// DELETE favorite from MongoDB
r.delete("/:buildingId", auth, async (req, res) => {
  try {
    const cleanBuildingId = req.params.buildingId?.trim();
    const userId = req.user.id;
    await Favorite.deleteOne({ userId, buildingId: cleanBuildingId });
    const list = await Favorite.find({ userId }).sort({ createdAt: -1 });
    res.json({ favorites: list.map((f) => f.buildingId) });
  } catch (e) {
    console.error("[favorites] DELETE error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default r;
