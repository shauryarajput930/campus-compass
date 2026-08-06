import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  number: String, type: String, floor: Number,
}, { _id: false });

const BuildingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: "text" },
  code: String,
  department: { type: String, index: "text" },
  description: { type: String, index: "text" },
  openingTime: String,
  facilities: [String],
  image: String,
  gallery: [String],
  category: { type: String, enum: ["academic","hostel","sports","food","facility","admin"], default: "academic" },
  lat: Number, lng: Number,
  floors: { type: Number, default: 1 },
  rooms: [RoomSchema],
}, { timestamps: true });

export default mongoose.model("Building", BuildingSchema);
