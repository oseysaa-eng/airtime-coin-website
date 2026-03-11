
import mongoose, { Schema, Document } from "mongoose";

export interface IEmissionState extends Document {
  phase: number;
  multiplier: number;
  rate: number;
  lastHalvingAt: Date;
}

const EmissionStateSchema = new Schema(
  {
    phase: { type: Number, default: 0 },
    multiplier: { type: Number, default: 1 },
    rate: { type: Number, default: 0.0025 },
    lastHalvingAt: { type: Date, default: Date.now },
    totalMinutesMined: {type: Number,default: 0},
    currentReward: {type: Number, default: 5},
  },
  { timestamps: true }
);

export default mongoose.model<IEmissionState>(
  "EmissionState",
  EmissionStateSchema
);