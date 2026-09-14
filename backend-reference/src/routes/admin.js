import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Favorite from "../models/Favorite.js";
import Report from "../models/Report.js";
import Building from "../models/Building.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.use(auth, requireAdmin);

r.get("/users", async (_, res) => res.json(await User.find().select("-password").sort({ createdAt: -1 })));
r.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !["user", "admin"].includes(role)) return res.status(400).json({ error: "Name, email, password and a valid role are required" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    const normalizedEmail = email.toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ error: "Email in use" });
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 10), role });
    res.status(201).json(await User.findById(user._id).select("-password"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
r.patch("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
r.delete("/users/:id", async (req, res) => {
  if (String(req.user.id) === String(req.params.id)) return res.status(400).json({ error: "You cannot delete your own admin account" });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ ok: true });
});
r.post("/users/:id/reset-password", async (req, res) => {
  if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
  const password = await bcrypt.hash(req.body.password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, { password }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ ok: true });
});
r.get("/analytics", async (_, res) => {
  const [totalUsers, activeUsers, reports, favorites] = await Promise.all([
    User.countDocuments(), User.countDocuments({ active: true }), Report.countDocuments(),
    Favorite.aggregate([{ $group: { _id: "$buildingId", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
  ]);
  res.json({ totalUsers, activeUsers, reports, favorites: favorites.map((item) => ({ buildingId: item._id, count: item.count })), dailyUsage: [] });
});

export default r;