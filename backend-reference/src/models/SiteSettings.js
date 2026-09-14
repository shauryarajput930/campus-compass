import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "main" },
  contactEmail: String,
  contactPhone: String,
  instagram: String,
  linkedin: String,
  twitter: String,
});

export default mongoose.model("SiteSettings", SiteSettingsSchema);