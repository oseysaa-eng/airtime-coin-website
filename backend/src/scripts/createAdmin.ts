import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin";

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI!);

  const email = "admin@airtimecoin.africa";
  const password = "ChangeMe123!";

  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 12);

  await Admin.create({
    email,
    password: hash,
    role: "superadmin",
  });

  console.log("✅ Admin created");
  console.log("Email:", email);
  console.log("Password:", password);

  process.exit(0);
}

createAdmin();
