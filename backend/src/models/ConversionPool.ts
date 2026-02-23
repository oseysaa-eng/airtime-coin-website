import mongoose, { Document, Schema } from "mongoose";

export interface IConversionPool extends Document {
  source: "AIRTIME";
  balanceATC: number;
  rate: number;
  dailyLimitATC: number;
  spentTodayATC: number;
  lastReset?: Date;
  paused: boolean;
}

const ConversionPoolSchema = new Schema<IConversionPool>(
  {
    source: {
      type: String,
      enum: ["AIRTIME"],
      required: true,
      unique: true,
    },

    balanceATC: {
      type: Number,
      required: true,
      default: 0,
    },

    rate: {
      type: Number,
      required: true,
      default: 0.0025, // minutes → ATC rate
    },

    dailyLimitATC: {
      type: Number,
      default: 10000,
    },

    spentTodayATC: {
      type: Number,
      default: 0,
    },

    lastReset: {
      type: Date,
    },

    paused: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IConversionPool>(
  "ConversionPool",
  ConversionPoolSchema
);