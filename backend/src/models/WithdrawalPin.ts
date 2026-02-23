import mongoose from "mongoose";

const WithdrawalPinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },

    pinHash: {
      type: String,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: Date,
  },
  { timestamps: true }
);

export default mongoose.model(
  "WithdrawalPin",
  WithdrawalPinSchema
);