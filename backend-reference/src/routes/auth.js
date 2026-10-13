import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const r = Router();

function signUserToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "7d" }
  );
}

function determineUserRole(email) {
  const normalized = (email || "").toLowerCase().trim();
  const rawAdmins = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "").toLowerCase();
  const configuredAdmins = rawAdmins
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  return configuredAdmins.includes(normalized) ? "admin" : "user";
}

r.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const role = determineUserRole(normalizedEmail);

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      role,
      active: true,
    });

    const token = signUserToken(user);
    res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (e) {
    console.error("[auth] Registration error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = (email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.active) {
      return res.status(403).json({ error: "Account is inactive. Please contact an administrator." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signUserToken(user);
    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (e) {
    console.error("[auth] Login error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

r.get("/me", auth, async (req, res) => {
  try {
    let u = null;
    if (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      u = await User.findById(req.user.id).select("-password");
    }
    if (!u && req.user?.email) {
      u = await User.findOne({ email: req.user.email.toLowerCase().trim() }).select("-password");
    }

    if (!u) {
      return res.status(404).json({ error: "User not found in database" });
    }

    if (!u.active) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    res.json({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt,
    });
  } catch (e) {
    console.error("[auth] /me error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---- Google sign-in (verifies the Google ID token and persists in MongoDB) ----
r.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Missing Google credential" });

    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!resp.ok) return res.status(401).json({ error: "Invalid Google token" });

    const payload = await resp.json();
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: "Google token audience mismatch" });
    }
    if (payload.email_verified !== "true" && payload.email_verified !== true) {
      return res.status(401).json({ error: "Google email not verified" });
    }

    const email = (payload.email || "").toLowerCase().trim();
    let user = await User.findOne({ email });
    if (!user) {
      const role = determineUserRole(email);
      const randomPw = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        password: randomPw,
        role,
        active: true,
      });
    }

    if (!user.active) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    const token = signUserToken(user);
    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (e) {
    console.error("[auth] Google auth error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---- Password reset ----
const resets = new Map(); // token -> { email, expires }

r.post("/forgot-password", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (user && user.active) {
      const token = crypto.randomBytes(32).toString("hex");
      resets.set(token, { email, expires: Date.now() + 1000 * 60 * 30 });
      const clientUrl = process.env.APP_URL || process.env.CLIENT_ORIGIN?.split(",")[0] || "http://localhost:5173";
      const link = `${clientUrl}/reset-password?token=${token}`;
      console.log(`[auth] Password reset link generated for ${email}: ${link}`);
    }
    // Always 200 so we never leak which emails exist
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ error: "Valid token and password (at least 6 characters) required" });
    }

    const entry = resets.get(token);
    if (!entry || entry.expires < Date.now()) {
      return res.status(400).json({ error: "Password reset link has expired or is invalid" });
    }

    resets.delete(token);
    const hash = await bcrypt.hash(password, 10);
    const updated = await User.findOneAndUpdate({ email: entry.email }, { password: hash });
    if (!updated) {
      return res.status(404).json({ error: "User account not found" });
    }

    res.json({ ok: true, message: "Password reset successful" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
