import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;

  name: string;
  fullName: string;
  profileImage?: string;

  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId | null;

  referralCount: number;
  referralEarnings: number;

  balance: number;
  minutes: number;
  atc: number;
  rate: number;

  totalEarnings: number;
  totalMinutes: number;

  // 🔥 CALL MINING
  totalCalls: number;
  lastCallAt?: Date;
  fraudScore: number;

  pushTokens: string[];

  notifications: {
    earnings: boolean;
    fraud: boolean;
    promo: boolean;
  };

  earlyAdopter: boolean;
  pausedUntil?: Date;

  role: "user" | "admin";

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    /* ================= BASIC ================= */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    name: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    /* ================= REFERRAL ================= */

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    referralCount: {
      type: Number,
      default: 0,
    },

    referralEarnings: {
      type: Number,
      default: 0,
    },

    /* ================= WALLET ================= */

    balance: {
      type: Number,
      default: 0,
    },

    minutes: {
      type: Number,
      default: 0,
    },

    atc: {
      type: Number,
      default: 0,
    },

    rate: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    totalMinutes: {
      type: Number,
      default: 0,
    },

    /* ================= CALL MINING ================= */

    totalCalls: {
      type: Number,
      default: 0,
    },

    lastCallAt: {
      type: Date,
      default: null,
    },

    fraudScore: {
      type: Number,
      default: 0,
      index: true,
    },

    /* ================= SYSTEM ================= */

    notifications: {
      earnings: { type: Boolean, default: true },
      fraud: { type: Boolean, default: true },
      promo: { type: Boolean, default: true },
    },

    pushTokens: {
      type: [String],
      default: [],
    },

    earlyAdopter: {
      type: Boolean,
      default: false,
    },

    pausedUntil: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

// Fast referral lookups
UserSchema.index({ referralCode: 1 });

// Fraud monitoring
UserSchema.index({ fraudScore: -1 });

// Growth analytics
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);