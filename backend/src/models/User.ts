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

  referredUsers: mongoose.Types.ObjectId[];

  refreshToken?: string;

  balance: number;
  minutes: number;
  atc: number;
  rate: number;

  totalEarnings: number;
  totalMinutes: number;

  totalCalls: number;
  lastCallAt?: Date;
  fraudScore: number;

  pushTokens: string[];

  lastDevice?: string;
  lastIP?: string;
  lastUserAgent?: string;
  lastLoginAt?: Date;

  status: "active" | "suspended" | "banned";
  kycStatus: "not_submitted" | "pending" | "approved" | "rejected";

  hasPin: boolean;
  pinUpdatedAt?: Date;

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
    /* ================= SECURITY ================= */

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    lastDevice: { type: String, default: null },
    lastIP: { type: String, default: null },
    lastUserAgent: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
      index: true,
    },

    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
      index: true,
    },

    hasPin: { type: Boolean, default: false },
    pinUpdatedAt: { type: Date, default: null },

    /* ================= REFERRAL ================= */

    referredUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

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

    referralCount: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },

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

    name: { type: String, default: "" },
    fullName: { type: String, default: "" },

    profileImage: { type: String, default: null },

    /* ================= WALLET ================= */

    balance: { type: Number, default: 0, min: 0 },
    minutes: { type: Number, default: 0, min: 0 },
    atc: { type: Number, default: 0, min: 0 },
    rate: { type: Number, default: 0 },

    totalEarnings: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },

    /* ================= CALL MINING ================= */

    totalCalls: { type: Number, default: 0 },

    lastCallAt: { type: Date, default: null },

    fraudScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },

    /* ================= SYSTEM ================= */

    notifications: {
      type: {
        earnings: { type: Boolean, default: true },
        fraud: { type: Boolean, default: true },
        promo: { type: Boolean, default: true },
      },
      default: {
        earnings: true,
        fraud: true,
        promo: true,
      },
    },

    pushTokens: {
      type: [String],
      default: [],
    },

    earlyAdopter: { type: Boolean, default: false },

    pausedUntil: { type: Date, default: null },

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
UserSchema.index({ email: 1 });
UserSchema.index({ referralCode: 1 });
UserSchema.index({ fraudScore: -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ status: 1, kycStatus: 1 });
UserSchema.index({ pushTokens: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);




  