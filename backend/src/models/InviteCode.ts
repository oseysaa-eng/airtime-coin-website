import mongoose, { Schema } from "mongoose";

const InviteCodeSchema = new Schema({

  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },

  active: {
    type: Boolean,
    default: true,
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  usedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  usedAt: Date,

  revokedAt: Date,

}, {
  timestamps: true,
});

export default mongoose.model(
  "InviteCode",
  InviteCodeSchema
);