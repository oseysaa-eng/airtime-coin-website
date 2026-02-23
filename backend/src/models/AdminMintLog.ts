import mongoose from "mongoose";

const AdminMintLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    amount: Number,
    reason: String,
    target: String, // e.g. "reward_pool", "promo", "manual"
  },
  { timestamps: true }
);

export default mongoose.model("AdminMintLog", AdminMintLogSchema);
