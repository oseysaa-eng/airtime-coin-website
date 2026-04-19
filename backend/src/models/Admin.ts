import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"], // ✅ FIXED
      default: "superadmin", // 🔥 since you said only super admin for now
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Admin", AdminSchema);