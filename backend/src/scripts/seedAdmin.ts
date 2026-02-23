import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin";

dotenv.config();

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    if (!process.env.ADMIN_JWT_SECRET) {
      throw new Error("ADMIN_JWT_SECRET missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const email = "admin@airtimecoin.africa";
    const password = "Admin@12345"; // CHANGE AFTER LOGIN

    const exists = await Admin.findOne({ email });
    if (exists) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 12);

    await Admin.create({
      email,
      password: hashed,
      role: "superadmin",
    });

    console.log("✅ Admin seeded successfully");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedAdmin();