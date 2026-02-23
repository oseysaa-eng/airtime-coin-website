// src/models/Conversion.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IConversion extends Document {
  userId: mongoose.Types.ObjectId;
  minutes: number;
  atc: number;
  fee: number;
  rate: number; // minutes per ATC
  status: "completed" | "failed";
  createdAt?: Date;
}

const ConversionSchema = new Schema<IConversion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    minutes: { type: Number, required: true },
    atc: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    rate: { type: Number, required: true },
    status: { type: String, enum: ["completed", "failed"], default: "completed" },
  },
  { timestamps: true }
);

export default mongoose.models.Conversion || mongoose.model<IConversion>("Conversion", ConversionSchema);
