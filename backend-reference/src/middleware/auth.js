import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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

function isExactConfiguredAdmin(email) {
  if (!email) return false;
  const configuredAdmin = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : "";
  return configuredAdmin.length > 0 && email.toLowerCase().trim() === configuredAdmin;
}

export async function auth(req, res, next) {
  if (req.method === "OPTIONS") return next();

  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authentication token provided" });
  }
  const token = h.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: "Empty authentication token provided" });
  }

  // 1. Try Clerk verification if CLERK_SECRET_KEY is configured
  if (process.env.CLERK_SECRET_KEY) {
    try {
      const claims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        clockSkewInMs: 30000,
      });

      let userEmail = getEmailFromClaims(claims);
      let metadataRole = claims?.public_metadata?.role ?? claims?.publicMetadata?.role;

      if (!userEmail && clerkClient) {
        try {
          const clerkUser = await clerkClient.users.getUser(claims.sub);
          userEmail =
            clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
            clerkUser?.emailAddresses?.[0]?.emailAddress ||
            "";
          if (!metadataRole) {
            metadataRole = clerkUser?.publicMetadata?.role;
          }
        } catch (clerkFetchErr) {
          console.warn("[auth] Unable to fetch Clerk user details:", clerkFetchErr.message);
        }
      }

      const normalizedEmail = (userEmail || "").toLowerCase().trim();
      const isAdminByClaim =
        (typeof metadataRole === "string" && metadataRole.toLowerCase() === "admin") ||
        isExactConfiguredAdmin(normalizedEmail);

      // Persist / Sync user in MongoDB as source of truth
      let dbUser = null;
      if (normalizedEmail) {
        dbUser = await User.findOne({ email: normalizedEmail });
        if (!dbUser) {
          const randomPw = jwt.sign({ sub: claims.sub }, process.env.JWT_SECRET || "fallback_secret");
          dbUser = await User.create({
            name: normalizedEmail.split("@")[0],
            email: normalizedEmail,
            password: randomPw,
            role: isAdminByClaim ? "admin" : "user",
            active: true,
          });
        } else {
          // If metadata or env promotes to admin, reflect in DB
          if (isAdminByClaim && dbUser.role !== "admin") {
            dbUser.role = "admin";
            await dbUser.save();
          }
        }
      }

      if (!dbUser) {
        return res.status(401).json({ error: "User could not be synchronized with database" });
      }

      if (!dbUser.active) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      req.user = {
        id: dbUser._id.toString(),
        clerkId: claims.sub,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name,
      };
      return next();
    } catch {
      // If Clerk verification fails, fall through to JWT verification
    }
  }

  // 2. Standard JWT verification (Native database-backed auth)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    let dbUser = null;

    if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
      dbUser = await User.findById(decoded.id).select("-password");
    }
    if (!dbUser && decoded.email) {
      dbUser = await User.findOne({ email: decoded.email.toLowerCase().trim() }).select("-password");
    }

    if (!dbUser) {
      return res.status(401).json({ error: "User no longer exists in database" });
    }

    if (!dbUser.active) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    // Role comes strictly from the MongoDB User record
    req.user = {
      id: dbUser._id.toString(),
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name,
    };
    return next();
  } catch (jwtErr) {
    return res.status(401).json({ error: "Invalid or expired session token: " + jwtErr.message });
  }
}

export function requireAdmin(req, res, next) {
  if (req.method === "OPTIONS") return next();
  if (!req.user || req.user.role !== "admin") {
    console.warn(`[auth] Access Denied: User role '${req.user?.role}' is not admin. Request to ${req.method} ${req.originalUrl}`);
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
