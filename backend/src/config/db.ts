import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("❌ MONGO_URI is missing");
    }

    // 🔥 IMPORTANT: disable buffering (no more 10s hang)
    mongoose.set("bufferCommands", false);

    await mongoose.connect(uri);

    console.log("✅ MongoDB connected");

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);

    // 🔥 CRITICAL: stop server completely
    throw err;
  }
};

export default connectDB;