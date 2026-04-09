import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("❌ MONGO_URI is missing");
    }

    console.log("🔌 Connecting to MongoDB...");

    // 🔥 Disable buffering (prevents hanging queries)
    mongoose.set("bufferCommands", false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // fail fast if DB unreachable
      socketTimeoutMS: 45000,        // keep connection stable
    });

    console.log("✅ MongoDB connected");

  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err?.message || err);

    // 🔥 HARD FAIL (prevents fake startup)
    process.exit(1);
  }
};

export default connectDB;
