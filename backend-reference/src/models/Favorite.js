import mongoose from "mongoose";
const FavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  buildingId: { type: String, index: true },
}, { timestamps: true });
FavoriteSchema.index({ userId: 1, buildingId: 1 }, { unique: true });
export default mongoose.model("Favorite", FavoriteSchema);
