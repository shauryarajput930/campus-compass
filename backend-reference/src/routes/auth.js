import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const r = Router();

r.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email in use" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id, role: user.role, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user._id, name, email, role: user.role }, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.get("/me", auth, async (req, res) => {
  const u = await User.findById(req.user.id).select("-password");
  res.json(u);
});

// ---- Google sign-in (verifies the Google ID token) ----
r.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Missing credential" });
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!resp.ok) return res.status(401).json({ error: "Invalid Google token" });
    const payload = await resp.json();
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: "Token audience mismatch" });
    }
    if (payload.email_verified !== "true" && payload.email_verified !== true) {
      return res.status(401).json({ error: "Email not verified" });
    }
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      const randomPw = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
      user = await User.create({ name: payload.name || email.split("@")[0], email, password: randomPw });
    }
    const token = jwt.sign({ id: user._id, role: user.role, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user._id, name: user.name, email, role: user.role }, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---- Password reset (dev-friendly: logs the link; wire up your mailer) ----
const resets = new Map(); // token -> { email, expires }

r.post("/forgot-password", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase();
    if (!email) return res.status(400).json({ error: "Email required" });
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      resets.set(token, { email, expires: Date.now() + 1000 * 60 * 30 });
      const link = `${process.env.APP_URL || "http://localhost:8080"}/reset-password?token=${token}`;
      console.log("[password reset]", email, link); // TODO: send via email provider
    }
    // Always 200 so we never leak which emails exist
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) return res.status(400).json({ error: "Invalid token or password" });
    const entry = resets.get(token);
    if (!entry || entry.expires < Date.now()) return res.status(400).json({ error: "Reset link expired" });
    resets.delete(token);
    const hash = await bcrypt.hash(password, 10);
    await User.updateOne({ email: entry.email }, { password: hash });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default r;
