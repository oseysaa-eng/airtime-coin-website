import rateLimit from "express-rate-limit";

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 🔥 only 5 attempts
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },

  handler: (req, res) => {
    console.warn("🚨 Admin login rate limit hit:", req.ip);

    res.status(429).json({
      success: false,
      message: "Too many login attempts",
    });
  },
});