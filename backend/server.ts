import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import helmet from "helmet";
import { Server as IOServer } from "socket.io";

/* 🔥 LOAD FIREBASE */
import "./src/config/firebase";

/* CORE */
import connectDB from "./src/config/db";
import { trustRecoveryJob } from "./src/jobs/trustRecoveryJob";
import SystemSettings from "./src/models/SystemSettings";

/* SOCKET */
import { setupSocket } from "./src/sockets/socket";
import { setupSupportSocket } from "./src/sockets/supportSocket";
import { registerAdminEmitter } from "./src/utils/adminEmitter";

/* MIDDLEWARE */
import { apiLimiter } from "./src/middleware/rateLimiter";

/* ROUTES */
// ADMIN
import adminRoutes from "./src/routes/admin/adminRoutes";
import adminBetaRoutes from "./src/routes/admin/adminBetaRoutes";
import adminTreasuryRoutes from "./src/routes/admin/adminTreasuryRoutes";
import adminUtilityAnalyticsRoutes from "./src/routes/admin/adminUtilityAnalyticsRoutes";
import utilityPricingRoutes from "./src/routes/admin/utilityPricingRoutes";
import adminEmissionRoutes from "./src/routes/admin/adminEmissionRoutes";
import adminPriceRoutes from "./src/routes/admin/adminPriceRoutes";

// USER
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/userRoutes";
import walletRoutes from "./src/routes/walletRoutes";
import withdrawRoutes from "./src/routes/withdrawRoutes";
import convertRoutes from "./src/routes/convertRoutes";
import summaryRoutes from "./src/routes/summaryRoutes";
import earnRoutes from "./src/routes/earnRoutes";
import adsRoutes from "./src/routes/adsRoutes";
import surveysRoutes from "./src/routes/surveysRoutes";
import offerRoutes from "./src/routes/offerwallRoutes";
import callRoutes from "./src/routes/callRoutes";
import kycRoutes from "./src/routes/kycRoutes";
import referralRoutes from "./src/routes/referralRoutes";
import priceRoutes from "./src/routes/priceRoutes";
import utilityRoutes from "./src/routes/utilityRoutes";
import deviceRoutes from "./src/routes/deviceRoutes";
import rewardsRoutes from "./src/routes/rewardsRoutes";
import pinRoutes from "./src/routes/pinRoutes";
import badgeRoutes from "./src/routes/badgeRoutes";
import donationRoutes from "./src/routes/donationRoutes";
import stakeRoutes from "./src/routes/stakeRoutes";
import stakingRoutes from "./src/routes/stakingRoutes";
import emissionRoutes from "./src/routes/emissionRoutes";
import postbackRoutes from "./src/routes/postbackRoutes";
import profileRoutes from "./src/routes/profileRoutes";
import pushRoutes from "./src/routes/pushRoutes";

/* ================= INIT ================= */

const app = express();

/* TRUST PROXY */
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

/* ================= SECURITY ================= */

app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


/* ✅ CUSTOM SANITIZER (SAFE) */
app.use((req: any, _res, next) => {
  const sanitize = (obj: any) => {
    if (!obj) return;

    for (const key in obj) {
      if (key.includes("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.params);

  next();
});

/* ================= DEBUG ================= */
app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

/* ================= TIMEOUT ================= */
app.use((req, res, next) => {
  res.setTimeout(10000, () => {
    console.error("⏱️ Timeout:", req.originalUrl);
    res.status(503).json({ message: "Request timeout" });
  });
  next();
});

/* ================= CORS ================= */
const allowedOrigins = [
  "https://airtimecoin.africa",
  "https://www.airtimecoin.africa",
  "https://admin.airtimecoin.africa",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("⚠️ Unknown origin:", origin);
      return callback(null, true);
    },
    credentials: true,
  })
);

/* ================= RATE LIMIT ================= */
app.use("/api", apiLimiter);

/* ================= STATIC ================= */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ================= HEALTH ================= */
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    service: "ATC Backend",
    time: new Date(),
  });
});

/* ================= ROUTES ================= */

// ADMIN
app.use("/api/admin", adminRoutes);
app.use("/api/admin/beta", adminBetaRoutes);
app.use("/api/admin/treasury", adminTreasuryRoutes);
app.use("/api/admin/utility/analytics", adminUtilityAnalyticsRoutes);
app.use("/api/admin/utility/pricing", utilityPricingRoutes);
app.use("/api/admin/emission", adminEmissionRoutes);
app.use("/api/admin/price", adminPriceRoutes);

// USER
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/convert", convertRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/earn", earnRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/surveys", surveysRoutes);
app.use("/api/offerwall", offerRoutes);
app.use("/api/call", callRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/price", priceRoutes);
app.use("/api/utility", utilityRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/pin", pinRoutes);
app.use("/api/badge", badgeRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/stake", stakeRoutes);
app.use("/api/staking", stakingRoutes);
app.use("/api/emission", emissionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/push", pushRoutes);

app.use("/postback", postbackRoutes);

/* ================= ERROR ================= */
app.use((err: any, req: any, res: any, _next: any) => {
  console.error("❌ ERROR:", err?.message);
  res.status(500).json({ message: "Internal server error" });
});

/* ================= SERVER ================= */

const PORT = Number(process.env.PORT) || 5000;
const server = http.createServer(app);

/* ================= SOCKET ================= */

const io = new IOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});



setupSocket(io);
setupSupportSocket(io);
registerAdminEmitter(io);

/* ================= START ================= */

const startServer = async () => {
  try {
    console.log("ENV CHECK:", {
      mongo: process.env.MONGO_URI ? "OK" : "MISSING",
      jwt: process.env.JWT_SECRET ? "OK" : "MISSING",
      firebase: process.env.FIREBASE_PROJECT_ID ? "OK" : "MISSING",
    });

    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 ATC Backend running on port ${PORT}`);
    });

    setTimeout(async () => {
      try {
        const exists = await SystemSettings.findOne();
        if (!exists) {
          await SystemSettings.create({});
          console.log("✅ SystemSettings initialized");
        }
      } catch {
        console.log("⚠️ SystemSettings skipped");
      }
    }, 2000);

    setInterval(trustRecoveryJob, 24 * 60 * 60 * 1000);

  } catch (err) {
    console.error("❌ START FAILED:", err);
    process.exit(1);
  }
};

startServer();