import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/* =============================
   HELPER: IDENTIFY USER
============================= */
const getKey = (req: any) => {
  if (req.user?.id) {
    return `user:${req.user.id}`; // 🔥 strongest protection
  }

  return ipKeyGenerator(req); // ✅ IPv6-safe fallback
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
});

/* =============================
   AUTH LIMIT (STRICT)
============================= */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  // 🔥 FIXED (was req.ip)
  keyGenerator: (req) => ipKeyGenerator(req),

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
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: getKey,
});

/* =============================
   CONVERT LIMIT (FINANCIAL)
============================= */
export const convertLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: getKey,
});

/* =============================
   WITHDRAW LIMIT (CRITICAL)
============================= */
export const withdrawLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: getKey,
});

/* =============================
   ADS LIMIT
============================= */
export const adsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: getKey,
});

/* =============================
   SURVEY LIMIT
============================= */
export const surveysLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: getKey,
});

/* =============================
   REFERRAL LIMIT
============================= */
export const referralsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: getKey,
});

/* =============================
   CALL LIMIT
============================= */
export const callLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: getKey,
});