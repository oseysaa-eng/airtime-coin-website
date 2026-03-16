import DeviceOTP from "../models/DeviceOTP";
import UserDevice from "../models/UserDevice";
import DeviceBinding from "../models/DeviceBinding";
import UserTrust from "../models/UserTrust";
import { generateOTP, otpExpiry } from "../utils/otp";
import { runAntiFarmingChecks } from "./antiFarmingEngine";

export async function verifyDevice({
  userId,
  fingerprint,
  deviceName,
  platform,
  ip,
}: any) {

  const trust =
    (await UserTrust.findOne({ userId })) ||
    (await UserTrust.create({ userId }));

  let device = await UserDevice.findOne({
    userId,
    fingerprint,
  });

  /* ─────────────────────────
     EXISTING DEVICE
  ───────────────────────── */

  if (device) {

    if (device.blocked) {
      return { allowed: false, reason: "BLOCKED_DEVICE" };
    }

    device.lastSeenAt = new Date();
    device.loginCount = (device.loginCount || 0) + 1;

    await device.save();

    return { allowed: true, isNew: false };

  }

  /* ─────────────────────────
     NEW DEVICE DETECTED
  ───────────────────────── */

  const totalDevices = await UserDevice.countDocuments({
    userId,
  });

  device = await UserDevice.create({

    userId,
    fingerprint,
    deviceName,
    platform,
    ip,

    trusted: false,
    riskScore: 20,

    loginCount: 1,
    lastSeenAt: new Date()

  });

  /* ─────────────────────────
     CREATE DEVICE BINDING
  ───────────────────────── */

  await DeviceBinding.create({
    userId,
    deviceId: device._id,
    lastIp: ip
  });

  /* ─────────────────────────
     REDUCE TRUST SCORE
  ───────────────────────── */

  trust.score = Math.max(0, trust.score - 10);
  await trust.save();

  /* ─────────────────────────
     RUN FRAUD CHECKS
  ───────────────────────── */

  await runAntiFarmingChecks({
    userId,
    deviceId: device._id,
    ip
  });

  /* ─────────────────────────
     OTP VERIFICATION
  ───────────────────────── */

  if (totalDevices >= 2) {

    const otp = generateOTP();

    await DeviceOTP.create({
      userId,
      fingerprint,
      otp,
      expiresAt: otpExpiry(),
    });

    return {
      allowed: false,
      reason: "OTP_REQUIRED",
    };

  }

  return {
    allowed: true,
    isNew: true,
  };

}