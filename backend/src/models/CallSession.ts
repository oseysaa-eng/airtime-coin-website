import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema(
  {
    /* ================= CORE ================= */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true, // 🔥 faster lookup
    },

    phoneNumber: {
      type: String,
      default: "",
      index: true,
    },

    /* ================= CALL DATA ================= */

    durationSeconds: {
      type: Number,
      default: 0,
    },

    creditedMinutes: {
      type: Number,
      default: 0,
    },

    /* ================= STATUS ================= */

    status: {
      type: String,
      enum: [
        "pending",     // created
        "processing",  // 🔒 locked (anti-duplicate)
        "completed",   // finished + credited
        "valid",       // optional legacy
        "rejected",    // too short / no reward
        "blocked",     // fraud blocked
        "fraud",       // legacy
      ],
      default: "pending",
      index: true,
    },

    /* ================= FRAUD ================= */

    flagged: {
      type: Boolean,
      default: false,
    },

    riskScore: {
      type: Number,
      default: 0,
      index: true,
    },

    trustScore: {
      type: Number,
      default: 1,
    },

    /* ================= TIME ================= */

    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    /* ================= META ================= */

    source: {
      type: String,
      default: "mobile",
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

// 🔥 compound indexes for analytics + speed
callSessionSchema.index({ userId: 1, createdAt: -1 });
callSessionSchema.index({ userId: 1, status: 1 });
callSessionSchema.index({ phoneNumber: 1, createdAt: -1 });

export default mongoose.models.CallSession ||
  mongoose.model("CallSession", callSessionSchema);