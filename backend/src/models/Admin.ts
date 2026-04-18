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

    /* 🔒 CONTROL */
    isActive: {
      type: Boolean,
      default: true,
    },

    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    /* 🔥 TOKEN CONTROL (important even for 1 admin) */
    tokenVersion: {
      type: Number,
      default: 0,
    },

    /* 🔍 TRACKING */
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


/* 🔐 HASH PASSWORD */
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Admin", AdminSchema);