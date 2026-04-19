import rateLimit from "express-rate-limit";

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  /* 🔥 REMOVE keyGenerator completely */

  handler: (req, res) => {
    console.warn("🚨 Admin rate limit hit:", req.ip);

    res.status(429).json({
      success: false,
      message: "Too many requests. Please slow down.",
    });
  },
});