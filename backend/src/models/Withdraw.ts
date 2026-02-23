import mongoose from "mongoose";

const WithdrawSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  method: { type: String, enum: ["MoMo", "Crypto"], required: true },
  network: { type: String },
  wallet: { type: String, required: true },
  status: { type: String, default: "pending" },
});

export default mongoose.model("Withdraw", WithdrawSchema);
