import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Favorite from "../models/Favorite.js";
import Report from "../models/Report.js";
import Building from "../models/Building.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.use(auth, requireAdmin);

r.get("/users", async (_, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Name, email, password and a valid role ('user' | 'admin') are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ error: "Email is already in use" });
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role,
      active: true,
    });
    res.status(201).json(await User.findById(user._id).select("-password"));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.patch("/users/:id", async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id) && req.body.role && req.body.role !== "admin") {
      return res.status(400).json({ error: "You cannot revoke your own admin privileges" });
    }
    if (String(req.user.id) === String(req.params.id) && req.body.active === false) {
      return res.status(400).json({ error: "You cannot deactivate your own account" });
    }

    const payload = {};
    if (typeof req.body.role === "string" && ["user", "admin"].includes(req.body.role)) {
      payload.role = req.body.role;
    }
    if (typeof req.body.active === "boolean") {
      payload.active = req.body.active;
    }
    if (typeof req.body.name === "string" && req.body.name.trim()) {
      payload.name = req.body.name.trim();
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.delete("/users/:id", async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ error: "You cannot delete your own admin account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Clean up user favorites and reports
    await Favorite.deleteMany({ userId: req.params.id });
    await Report.deleteMany({ userId: req.params.id });

    res.json({ ok: true, deletedId: req.params.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.post("/users/:id/reset-password", async (req, res) => {
  try {
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.get("/analytics", async (_, res) => {
  try {
    const [totalUsers, activeUsers, reports, pendingReports, resolvedReports, buildingsCount, favorites] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ active: true }),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "resolved" }),
      Building.countDocuments(),
      Favorite.aggregate([
        { $group: { _id: "$buildingId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      reports,
      pendingReports,
      resolvedReports,
      buildingsCount,
      favorites: favorites.map((item) => ({ buildingId: item._id, count: item.count })),
      dailyUsage: [],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;