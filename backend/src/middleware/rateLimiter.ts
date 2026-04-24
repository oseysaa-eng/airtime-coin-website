import rateLimit from "express-rate-limit";

/* =============================
   HELPER: IDENTIFY USER
============================= */
const getKey = (req: any) => {
  return req.user?.id || req.ip; // 🔥 user-based if logged in
};

/* =============================
   GLOBAL LIMIT (ALL ROUTES)
============================= */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many requests. Slow down.",
    });
  },
});

/* =============================
   AUTH LIMIT (STRICT)
============================= */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 🔥 stricter

  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many login attempts. Try later.",
    });
  },
});

/* =============================
   EARN LIMIT (ANTI-BOT CORE)
============================= */
export const earnLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10, // 🔥 reduce from 30 → 10

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many earning requests. Slow down.",
    });
  },
});

/* =============================
   CONVERT LIMIT (FINANCIAL)
============================= */
export const convertLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many conversions. Try again shortly.",
    });
  },
});

/* =============================
   WITHDRAW LIMIT (CRITICAL)
============================= */
export const withdrawLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many withdrawal attempts.",
    });
  },
});

/* =============================
   ADS LIMIT (STRICT)
============================= */
export const adsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Ad request limit reached.",
    });
  },
});

/* =============================
   SURVEY LIMIT
============================= */
export const surveysLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Survey request limit reached.",
    });
  },
});

/* =============================
   REFERRAL LIMIT (ANTI-SPAM)
============================= */
export const referralsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many referral actions.",
    });
  },
});

/* =============================
   CALL LIMIT (HIGH RISK)
============================= */
export const callLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,

  keyGenerator: getKey,

  handler: (_req, res) => {
    res.status(429).json({
      message: "Call earning limit reached.",
    });
  },
});