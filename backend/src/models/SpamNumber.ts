// models/SpamNumber.js
import mongoose from "mongoose";

const spamSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },

  reports: { type: Number, default: 1 },

  reportedBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  lastReportedAt: { type: Date, default: Date.now },
});

export default mongoose.model("SpamNumber", spamSchema);


