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
      select: false, // 🔥 hide password
    },

    role: {
      type: String,
      enum: ["super_admin"],
      default: "super_admin",
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

    lastLoginAt: Date,
    lastLoginIP: String,
    lastUserAgent: String,
  },
  { timestamps: true }
);

/* 🔐 HASH PASSWORD */
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* 🔒 LOCK CHECK METHOD */
AdminSchema.methods.isLocked = function () {
  if (!this.lockUntil) return false;

  if (this.lockUntil < new Date()) {
    this.lockUntil = undefined;
    this.failedAttempts = 0;
    return false;
  }

  return true;
};


export default mongoose.model("Admin", AdminSchema);