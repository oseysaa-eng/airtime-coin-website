import mongoose from "mongoose";

const InviteCodeSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true,
    unique: true,
  },

  active: {
    type: Boolean,
    default: true,
  },

  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  usedCount: {
    type: Number,
    default: 0,
  },

  maxUses: {
    type: Number,
    default: 1,
  },

}, {
  timestamps: true,
});

export default mongoose.model(
  "InviteCode",
  InviteCodeSchema
);