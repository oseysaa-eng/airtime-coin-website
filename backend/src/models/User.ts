import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  userId: string;
  email: string;
  password: string;

  name?: string;
  fullName?: string;
  profileImage: String,
  
  referralCode: string;
  referredBy?: string | null;

  balance: number;
  minutes: number;
  atc: number;
  rate: number;

  totalEarnings: number;
  totalMinutes: number;

  pushTokens: string[];

  earlyAdopter: boolean;

  pausedUntil?: Date;

  role: "user" | "admin";

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
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

    name: {
  type: String,
  required: true
},
  
    fullName: {
  type: String,
  required: true
},

profileImage: {
  type: String,
  default: null
},

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    referredBy: {
      type: String,
      default: null,
    },

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
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
mongoose.model<IUser>("User", UserSchema);