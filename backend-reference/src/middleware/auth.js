import jwt from "jsonwebtoken";
import { verifyToken } from "@clerk/backend";

export async function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  try {
    const token = h.slice(7);
    if (process.env.CLERK_SECRET_KEY) {
      const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      req.user = {
        id: claims.sub,
        role: claims.public_metadata?.role === "admin" ? "admin" : "user",
      };
    } else {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
    next();
  } catch { return res.status(401).json({ error: "Invalid token" }); }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}
