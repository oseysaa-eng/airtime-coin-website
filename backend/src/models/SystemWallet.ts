import mongoose, { Schema, Document } from "mongoose";

export interface ISystemWallet extends Document {
  totalProfitATC: number;
  totalConversions: number;
}

const schema = new Schema({
  totalProfitATC: { type: Number, default: 0 },
  totalConversions: { type: Number, default: 0 },
});

export default mongoose.model<ISystemWallet>(
  "SystemWallet",
  schema
);