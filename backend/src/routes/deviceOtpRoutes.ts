import express from "express";
import auth from "../middleware/authMiddleware";
import { verifyDeviceOTP } from "../services/deviceOtpService";
import { bindDevice } from "../services/deviceTrustService";

const router = express.Router();

/**
 * POST /api/device/verify-otp
 */
router.post("/verify-otp", auth, async (req: any, res) => {
  const { fingerprint, otp } = req.body;

  if (!fingerprint || !otp) {
    return res.status(400).json({
      message: "Fingerprint and OTP required",
    });
  }

  const valid = await verifyDeviceOTP({
    userId: req.user.id,
    fingerprint,
    otp,
  });

  if (!valid) {
    return res.status(400).json({
      message: "Invalid or expired OTP",
    });
  }

  const device = await bindDevice({
    userId: req.user.id,
    fingerprint,
    deviceName: req.headers["user-agent"],
    platform: req.headers["x-platform"],
    ip: req.ip,
  });

  res.json({
    success: true,
    trusted: true,
    trustScore: device.trustScore,
  });
});

export default router;