import rateLimit from "express-rate-limit";

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next) => {
    console.warn("🚨 Admin login rate limit hit:", req.ip);

    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Try again in 15 minutes.",
    });
  },
});