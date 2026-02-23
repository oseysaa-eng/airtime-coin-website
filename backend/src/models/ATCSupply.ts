// src/models/ATCSupply.ts
import mongoose from "mongoose";

const ATCSupplySchema = new mongoose.Schema(
  {
    totalMinted: { type: Number, default: 0 },
    cap: { type: Number, default: 1_000_000 },
  },
  { timestamps: true }
);

export default mongoose.model("ATCSupply", ATCSupplySchema);
