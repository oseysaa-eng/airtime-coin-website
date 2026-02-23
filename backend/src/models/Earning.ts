import mongoose, { Document, Schema } from 'mongoose';

export interface IEarning extends Document {
  userId: string;
  amount: number;
  source: string; // e.g., "watch_ad", "referral", etc.
  timestamp: Date;
}

const EarningSchema: Schema = new Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IEarning>('Earning', EarningSchema);
