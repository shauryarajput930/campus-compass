import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Building from "./src/models/Building.js";
import User from "./src/models/User.js";
import SiteSettings from "./src/models/SiteSettings.js";
import { DEFAULT_INITIAL_BUILDINGS } from "./src/config/db.js";

async function pushMockDataToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB successfully.");

  // 1. Remove obsolete / non-canonical building IDs
  const legacyIds = [
    "cse-block",
    "central-library",
    "central-food-court",
    "boys-hostel-complex",
    "girls-hostel-complex",
    "sports-complex",
    "medical-center"
  ];
  const removeRes = await Building.deleteMany({ id: { $in: legacyIds } });
  if (removeRes.deletedCount > 0) {
    console.log(`Removed ${removeRes.deletedCount} legacy building records.`);
  }

  // 2. Upsert all 18 canonical campus buildings into MongoDB
  console.log(`Upserting ${DEFAULT_INITIAL_BUILDINGS.length} campus buildings into MongoDB...`);
  const buildingOps = DEFAULT_INITIAL_BUILDINGS.map((b) => ({
    updateOne: {
      filter: { id: b.id },
      update: { $set: b },
      upsert: true,
    },
  }));
  const bResult = await Building.bulkWrite(buildingOps);
  console.log(`Buildings synced! Matched: ${bResult.matchedCount}, Upserted: ${bResult.upsertedCount}, Modified: ${bResult.modifiedCount}`);

  // Verify total buildings in DB
  const allBuildings = await Building.find({}, { id: 1, name: 1, category: 1 }).lean();
  console.log(`Total buildings in MongoDB now: ${allBuildings.length}`);
  allBuildings.forEach((b, idx) => {
    console.log(`  ${idx + 1}. [${b.id}] ${b.name} (${b.category})`);
  });

  // 3. Upsert default Site Settings
  console.log("Upserting default site settings...");
  await SiteSettings.findOneAndUpdate(
    { key: "main" },
    {
      $set: {
        key: "main",
        contactEmail: "campuscompass@psit.ac.in",
        contactPhone: "+91 512 2696248",
        instagram: "https://instagram.com/psitkanpur",
        linkedin: "https://linkedin.com/school/psit-kanpur",
        twitter: "https://x.com/psitkanpur",
        homeBackground: "https://psitche.ac.in/assets/slider/building.jpg",
      },
    },
    { upsert: true, new: true }
  );
  console.log("Default site settings saved in MongoDB.");

  // 4. Ensure default Admin users exist in MongoDB
  const adminEmails = ["admin@psit.ac.in", "shauryarajput930@gmail.com"];
  const adminHash = await bcrypt.hash("adminpassword123", 10);
  for (const email of adminEmails) {
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({
        name: email.startsWith("admin") ? "Campus Admin" : "Shaurya Rajput (Admin)",
        email,
        password: adminHash,
        role: "admin",
        active: true,
      });
      console.log(`Created admin user in MongoDB: ${email}`);
    } else if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`Promoted user to admin in MongoDB: ${email}`);
    } else {
      console.log(`Admin user already exists in MongoDB: ${email}`);
    }
  }

  console.log("=== ALL MOCK DATA PUSHED TO MONGODB SUCCESSFULLY ===");
  await mongoose.disconnect();
}

pushMockDataToDatabase().catch((err) => {
  console.error("Failed to push mock data to MongoDB:", err);
  process.exit(1);
});
