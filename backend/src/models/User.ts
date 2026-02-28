// src/models/User.ts

import mongoose, { Document, Schema } from "mongoose";

/* =====================================================
   INTERFACE
===================================================== */

export interface IUser extends Document {

  /* Identity */
  userId: string;
  email: string;
  password: string;
  name?: string;
  fullName?: string;

  /* Wallet */
  minutes: number;
  atc: number;
  rate: number;
  totalMinutes: number;
  totalEarnings: number;

  /* Staking */
  staked: number;

  /* Referral */
  referral: {
    code: string;
    referredBy?: string | null;
    referredUsers: string[];
    referralEarnings: number;
  };

  /* Profile */
  profile: {
    avatar: string;
    phone: string;
    country: string;
  };

  /* Push */
  pushTokens: string[];

  /* Devices */
  devices: {
    fingerprint: string;
    firstSeen: Date;
    lastSeen: Date;
    trusted: boolean;
  }[];

  /* Security */
  role: "user" | "admin";
  trustScore: number;
  pausedUntil?: Date | null;
  withdrawalPin?: string;

  /* Beta */
  earlyAdopter: boolean;
  betaStatus: "approved" | "pending" | "rejected";

  /* KYC */
  kycStatus: "not_submitted" | "pending" | "approved" | "rejected";
  kycFiles: Record<string, any>;

  /* Stats */
  donorBadge: string;
  donationTotal: number;
  chartData: number[];

  createdAt: Date;
  updatedAt: Date;
}

/* =====================================================
   SCHEMA
===================================================== */

const UserSchema = new Schema<IUser>(
  {
    /* Identity */

    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

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

    name: String,
    fullName: String,

    /* Wallet */

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

    totalMinutes: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    staked: {
      type: Number,
      default: 0,
    },

    /* Referral */

    referral: {
      code: {
        type: String,
        unique: true,
        index: true,
      },

      referredBy: {
        type: String,
        default: null,
      },

      referredUsers: {
        type: [String],
        default: [],
      },

      referralEarnings: {
        type: Number,
        default: 0,
      },
    },

    /* Profile */

    profile: {
      avatar: { type: String, default: "" },
      phone: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    /* Push Tokens */

    pushTokens: {
      type: [String],
      default: [],
    },

    /* Devices */

    devices: [
      {
        fingerprint: String,
        firstSeen: Date,
        lastSeen: Date,
        trusted: Boolean,
      },
    ],

    /* Security */

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    trustScore: {
      type: Number,
      default: 50,
    },

    pausedUntil: {
      type: Date,
      default: null,
    },

    withdrawalPin: {
      type: String,
      select: false,
    },

    /* Beta */

    earlyAdopter: {
      type: Boolean,
      default: false,
    },

    betaStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },

    /* KYC */

    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
    },

    kycFiles: {
      type: Object,
      default: {},
    },

    /* Stats */

    donorBadge: {
      type: String,
      default: "none",
    },

    donationTotal: {
      type: Number,
      default: 0,
    },

    chartData: {
      type: [Number],
      default: [0, 0, 0, 0, 0, 0, 0],
    },
  },

  {
    timestamps: true,
  }
);

/* =====================================================
   EXPORT
===================================================== */

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);