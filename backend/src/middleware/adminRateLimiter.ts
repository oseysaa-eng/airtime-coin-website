import rateLimit from "express-rate-limit";

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,               // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});