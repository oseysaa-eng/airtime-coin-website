import mongoose from "mongoose";

const inviteCodeSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    usedAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("InviteCode", inviteCodeSchema);