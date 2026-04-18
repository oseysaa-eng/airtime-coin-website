import rateLimit from "express-rate-limit";

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // higher for dashboard usage

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests",
  },
});