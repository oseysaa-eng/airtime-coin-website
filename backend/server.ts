import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import path from "path";
import { Server as IOServer } from "socket.io";

import connectDB from "./src/config/db";
import { trustRecoveryJob } from "./src/jobs/trustRecoveryJob";
import SystemSettings from "./src/models/SystemSettings";
import { setupSocket } from "./src/sockets/socket";
import { setupSupportSocket } from "./src/sockets/supportSocket";

/* ───────────────────────── LOAD ENV ───────────────────────── */
dotenv.config();

/* ───────────────────────── INIT APP ───────────────────────── */
const app = express();

/* ───────────────────────── MIDDLEWARE ───────────────────────── */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ───────────────────────── DB ───────────────────────── */
connectDB();

/* ───────────────────────── ROUTES ───────────────────────── */
// Admin
import adminBetaRoutes from "./src/routes/admin/adminBetaRoutes";
import adminEmissionRoutes from "./src/routes/admin/adminEmissionRoutes";
import adminPriceRoutes from "./src/routes/admin/adminPriceRoutes";
import adminRoutes from "./src/routes/admin/adminRoutes";
import adminTreasuryRoutes from "./src/routes/admin/adminTreasuryRoutes";
import adminUtilityAnalyticsRoutes from "./src/routes/admin/adminUtilityAnalyticsRoutes";
import utilityPricingRoutes from "./src/routes/admin/utilityPricingRoutes";


// User
import adsRoutes from "./src/routes/adsRoutes";
import authRoutes from "./src/routes/authRoutes";
import badgeRoutes from "./src/routes/badgeRoutes";
import callRoutes from "./src/routes/callRoutes";
import convertRoutes from "./src/routes/convertRoutes";
import deviceRoutes from "./src/routes/deviceRoutes";
import donationRoutes from "./src/routes/donationRoutes";
import earnRoutes from "./src/routes/earnRoutes";
import emissionRoutes from "./src/routes/emissionRoutes";
import kycRoutes from "./src/routes/kycRoutes";
import offerRoutes from "./src/routes/offerwallRoutes";
import pinRoutes from "./src/routes/pinRoutes";
import postbackRoutes from "./src/routes/postbackRoutes";
import priceRoutes from "./src/routes/priceRoutes";
import referralRoutes from "./src/routes/referralRoutes";
import rewardsRoutes from "./src/routes/rewardsRoutes";
import stakeRoutes from "./src/routes/stakeRoutes";
import stakingRoutes from "./src/routes/stakingRoutes";
import summaryRoutes from "./src/routes/summaryRoutes";
import surveysRoutes from "./src/routes/surveysRoutes";
import userRoutes from "./src/routes/userRoutes";
import utilityRoutes from "./src/routes/utilityRoutes";
import walletRoutes from "./src/routes/walletRoutes";
import withdrawRoutes from "./src/routes/withdrawRoutes";

/* ───────────────────────── BASIC ───────────────────────── */
app.get("/", (_req, res) => {
  res.json({ message: "ATC backend online" });
});

/* ───────────────────────── REGISTER ROUTES ───────────────────────── */
// Admin
app.use("/api/admin", adminRoutes);
app.use("/api/admin/beta", adminBetaRoutes);
app.use("/api/admin/treasury", adminTreasuryRoutes);
app.use("/api/admin/utility/analytics", adminUtilityAnalyticsRoutes);
app.use("/api/admin/utility/pricing", utilityPricingRoutes);
app.use("/api/admin/emission", adminEmissionRoutes);
app.use("/api/admin/price", adminPriceRoutes);




// User
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
app.use("/postback", postbackRoutes);



/* ───────────────────────── GLOBAL ERROR HANDLER ───────────────────────── */
app.use((err: any, req: any, res: any, _next: any) => {
  console.error("❌ ERROR", {
    path: req.path,
    method: req.method,
    body: req.body,
    message: err?.message,
  });

  res.status(500).json({
    message: "Internal server error",
  });
});

/* ───────────────────────── SERVER + SOCKET ───────────────────────── */
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new IOServer(server, {
  cors: { origin: "*" },
});

app.set("io", io);

// Initialize sockets ONCE
setupSocket(io);
setupSupportSocket(io);


/* ───────────────────────── START SERVER ───────────────────────── */
server.listen(Number(PORT), "0.0.0.0", async () => {
  console.log(`🚀 Server listening on port ${PORT}`);

  // Ensure system settings exist
  const exists = await SystemSettings.findOne();
  if (!exists) {
    await SystemSettings.create({});
    console.log("✅ SystemSettings initialized");
  }

  if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

  // Trust recovery (daily)
  setInterval(trustRecoveryJob, 24 * 60 * 60 * 1000);
});
