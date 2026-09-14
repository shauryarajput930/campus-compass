import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  userName: String,
  userEmail: String,
  buildingId: { type: String, required: true, index: true },
  buildingName: String,
  category: { type: String, enum: ["location", "details", "other"], default: "details" },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "resolved"], default: "pending", index: true },
}, { timestamps: true });

export default mongoose.model("Report", ReportSchema);