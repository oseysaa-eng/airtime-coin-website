import DeviceOTP from "../models/DeviceOTP";
import UserDevice from "../models/UserDevice";
import DeviceBinding from "../models/DeviceBinding";
import UserTrust from "../models/UserTrust";
import { generateOTP, otpExpiry } from "../utils/otp";
import { runAntiFarmingChecks } from "./antiFarmingEngine";

const MAX_DEVICES = 5;
const OTP_COOLDOWN_MS = 60 * 1000; // 1 minute

export async function verifyDevice({
  userId,
  fingerprint,
  deviceName,
  platform,
  ip,
}: any) {

  /* ================= NORMALIZE ================= */
  deviceName = deviceName || "Unknown Device";
  platform = platform || "unknown";
  ip = ip || "0.0.0.0";

  /* ================= TRUST ================= */
  const trust =
    (await UserTrust.findOne({ userId })) ||
    (await UserTrust.create({ userId }));

  let device = await UserDevice.findOne({
    userId,
    fingerprint,
  });

  /* =================================================
     🔁 EXISTING DEVICE
  ================================================= */
  if (device) {
    if (device.blocked) {
      return { allowed: false, reason: "BLOCKED_DEVICE" };
    }

    device.lastSeenAt = new Date();
    device.loginCount = (device.loginCount || 0) + 1;

    await device.save();

    return { allowed: true, isNew: false };
  }

  /* =================================================
     🚫 DEVICE LIMIT CHECK
  ================================================= */
  const totalDevices = await UserDevice.countDocuments({ userId });

  if (totalDevices >= MAX_DEVICES) {
    return {
      allowed: false,
      reason: "DEVICE_LIMIT_REACHED",
    };
  }

  /* =================================================
     🆕 CREATE NEW DEVICE
  ================================================= */
  device = await UserDevice.create({
    userId,
    fingerprint,
    deviceName,
    platform,
    ip,

    trusted: false,
    riskScore: 20,

    loginCount: 1,
    lastSeenAt: new Date(),
  });

  /* =================================================
     🔗 DEVICE BINDING
  ================================================= */
  await DeviceBinding.create({
    userId,
    deviceId: device._id,
    lastIp: ip,
  });

  /* =================================================
     📉 TRUST REDUCTION (CONTROLLED)
  ================================================= */
  const penalty = totalDevices >= 2 ? 5 : 2;

  trust.score = Math.max(0, trust.score - penalty);
  await trust.save();

  /* =================================================
     🧠 FRAUD CHECK
  ================================================= */
  await runAntiFarmingChecks({
    userId,
    deviceId: device._id,
    ip,
  });

  /* =================================================
     🔐 OTP LOGIC (SAFE)
  ================================================= */
  if (totalDevices >= 2) {
    const existingOTP = await DeviceOTP.findOne({
      userId,
      fingerprint,
      expiresAt: { $gt: new Date() },
    });

    if (existingOTP) {
      return {
        allowed: false,
        reason: "OTP_REQUIRED",
      };
    }

    const otp = generateOTP();

    await DeviceOTP.create({
      userId,
      fingerprint,
      otp,
      expiresAt: otpExpiry(),
      createdAt: new Date(),
    });

    return {
      allowed: false,
      reason: "OTP_REQUIRED",
    };
  }

  /* =================================================
     ✅ FIRST / LOW RISK DEVICE
  ================================================= */
  return {
    allowed: true,
    isNew: true,
  };
}