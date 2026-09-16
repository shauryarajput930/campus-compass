import jwt from "jsonwebtoken";
import { verifyToken } from "@clerk/backend";

function getEmailFromClaims(claims) {
  const candidates = [
    claims?.email,
    claims?.email_address,
    claims?.primary_email,
    claims?.primaryEmail,
    claims?.emailAddress,
    claims?.email_addresses?.[0]?.email_address,
    claims?.emailAddresses?.[0]?.email_address,
  ];

  return candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0) || "";
}

function isAdminClaim(claims) {
  const metadataRole = claims?.public_metadata?.role ?? claims?.publicMetadata?.role;
  if (typeof metadataRole === "string" && metadataRole.toLowerCase() === "admin") return true;

  const email = getEmailFromClaims(claims)?.toLowerCase();
  if (!email) return false;

  return (
    email.startsWith("admin") ||
    email.includes("admin") ||
    email.endsWith("@admin.psit.ac.in")
  );
}

export async function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  try {
    const token = h.slice(7);
    if (process.env.CLERK_SECRET_KEY) {
      const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      req.user = {
        id: claims.sub,
        role: isAdminClaim(claims) ? "admin" : "user",
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
