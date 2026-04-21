import express from "express";
import auth from "../middleware/authMiddleware";
import { verifyDeviceOTP } from "../services/deviceOtpService";
import UserDevice from "../models/UserDevice";

const router = express.Router();

/**
 * POST /api/device/verify-otp
 */
router.post("/verify-otp", auth, async (req: any, res) => {
  try {
    const { fingerprint, otp } = req.body;

    if (!fingerprint || !otp) {
      return res.status(400).json({
        message: "Fingerprint and OTP required",
      });
    }

    /* ================= VERIFY OTP ================= */
    const result = await verifyDeviceOTP({
      userId: req.user.id,
      fingerprint,
      otp,
    });

    if (!result.success) {
      return res.status(400).json({
        message: result.message || "Invalid or expired OTP",
      });
    }

    /* ================= TRUST DEVICE ================= */
    const device = await UserDevice.findOneAndUpdate(
      {
        userId: req.user.id,
        fingerprint,
      },
      {
        trusted: true,
        verifiedAt: new Date(),
        lastSeenAt: new Date(),
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    console.log("✅ Device verified:", {
      userId: req.user.id,
      fingerprint,
      ip: req.ip,
    });

    return res.json({
      success: true,
      trusted: true,
      trustScore: device.trustScore,
    });

  } catch (err: any) {
    console.error("❌ VERIFY OTP ERROR:", err.message);

    return res.status(500).json({
      message: "Verification failed",
    });
  }
});

export default router;