import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema(
  {
    /* ================= CORE ================= */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // 🔥 Use ONLY if session comes from mobile/external
    sessionId: {
      type: String,
      unique: true,
      sparse: true, // ✅ avoids index issues if null
      index: true,
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
        "active",
        "processing",
        "completed",
        "rejected",
        "blocked",
      ],
      default: "active",
      index: true,
    },

    rewarded: {
      type: Boolean,
      default: false,
      index: true, // 🔥 fast duplicate check
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
      default: 100,
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

    processedAt: {
      type: Date,
      default: null,
    },

    /* ================= META ================= */

    source: {
      type: String,
      default: "mobile",
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

// Fast user history
callSessionSchema.index({ userId: 1, createdAt: -1 });

// Status filtering (important for reward engine)
callSessionSchema.index({ userId: 1, status: 1 });

// Fraud detection (future use)
callSessionSchema.index({ userId: 1, riskScore: -1 });

// Phone pattern detection
callSessionSchema.index({ phoneNumber: 1, createdAt: -1 });

/* ================= TTL CLEANUP (VERY IMPORTANT) ================= */

// 🔥 Auto-delete after 30 days
callSessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

export default mongoose.models.CallSession ||
  mongoose.model("CallSession", callSessionSchema);