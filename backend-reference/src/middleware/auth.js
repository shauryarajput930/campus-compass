import jwt from "jsonwebtoken";
import { verifyToken, createClerkClient } from "@clerk/backend";
import User from "../models/User.js";

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

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

function isAdminEmail(email) {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    normalized.startsWith("admin") ||
    normalized.includes("admin") ||
    normalized.endsWith("@admin.psit.ac.in")
  );
}

export async function auth(req, res, next) {
  if (req.method === "OPTIONS") return next();

  const h = req.headers.authorization;
  console.log(`[auth-debug] Endpoint: ${req.method} ${req.originalUrl} | AuthHeader: ${h ? "Present" : "Missing"}`);

  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });
  const token = h.slice(7);

  if (process.env.CLERK_SECRET_KEY) {
    try {
      const claims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        clockSkewInMs: 30000,
      });
      let userRole = "user";
      let userEmail = getEmailFromClaims(claims);

      const metadataRole = claims?.public_metadata?.role ?? claims?.publicMetadata?.role;
      if (typeof metadataRole === "string" && metadataRole.toLowerCase() === "admin") {
        userRole = "admin";
      } else if (isAdminEmail(userEmail)) {
        userRole = "admin";
      } else if (clerkClient) {
        try {
          const clerkUser = await clerkClient.users.getUser(claims.sub);
          const primaryEmail =
            clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
            clerkUser?.emailAddresses?.[0]?.emailAddress ||
            "";

          const clerkRole = clerkUser?.publicMetadata?.role;
          if (clerkRole === "admin" || isAdminEmail(primaryEmail)) {
            userRole = "admin";
          }
          userEmail = primaryEmail;
        } catch (clerkFetchErr) {
          console.warn("[auth-debug] Unable to fetch Clerk user details:", clerkFetchErr.message);
        }
      }

      if (userRole !== "admin" && userEmail) {
        const dbUser = await User.findOne({ email: userEmail.toLowerCase() });
        if (dbUser && dbUser.role === "admin") {
          userRole = "admin";
        }
      }

      console.log(
        `[auth-debug] Verification: Success | ClerkUserID: ${claims.sub} | Role: ${userRole} | Endpoint: ${req.method} ${req.originalUrl}`
      );

      req.user = {
        id: claims.sub,
        email: userEmail,
        role: userRole,
      };
      return next();
    } catch (clerkErr) {
      console.warn(`[auth-debug] Verification: Failed | Error: ${clerkErr.message} | Endpoint: ${req.method} ${req.originalUrl}`);
      if (process.env.JWT_SECRET) {
        try {
          req.user = jwt.verify(token, process.env.JWT_SECRET);
          return next();
        } catch { /* proceed to 401 */ }
      }
      return res.status(401).json({ error: "Invalid token: " + clerkErr.message });
    }
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    console.log(`[auth-debug] JWT Verification: Success | Role: ${req.user?.role} | Endpoint: ${req.method} ${req.originalUrl}`);
    return next();
  } catch (jwtErr) {
    console.warn(`[auth-debug] JWT Verification: Failed | Error: ${jwtErr.message} | Endpoint: ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.method === "OPTIONS") return next();
  if (req.user?.role !== "admin") {
    console.warn(`[auth-debug] Access Denied: User role '${req.user?.role}' is not admin | Endpoint: ${req.method} ${req.originalUrl}`);
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
