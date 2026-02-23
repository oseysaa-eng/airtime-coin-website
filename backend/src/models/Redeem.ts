import mongoose, { Document, Schema } from 'mongoose';

export interface IRedeem extends Document {
  userId: string;
  amount: number;
  method: string; // e.g., "airtime", "data", "giftcard"
  redeemedAt: Date;
}

const RedeemSchema: Schema = new Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  redeemedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRedeem>('Redeem', RedeemSchema);
