import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI missing in environment variables");
    return;
  }
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(uri);
    console.log("Mongo connected");
  } catch (err) {
    console.error("Mongo connection error:", err.message);
  }
}

