import DeviceOTP from "../models/DeviceOTP";
import UserDevice from "../models/UserDevice";
import UserTrust from "../models/UserTrust";
import { generateOTP, otpExpiry } from "../utils/otp";

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

  // ✅ existing device
  if (device) {
    if (device.blocked) {
      return { allowed: false, reason: "BLOCKED_DEVICE" };
    }

    device.lastSeen = new Date();
    device.loginCount += 1;
    await device.save();

    return { allowed: true, isNew: false };
  }

  // 🚨 new device
  const totalDevices = await UserDevice.countDocuments({
    userId,
  });

  await UserDevice.create({
    userId,
    fingerprint,
    deviceName,
    platform,
    ip,
    trusted: false,
    riskScore: 20,
  });

  trust.score = Math.max(0, trust.score - 10);
  await trust.save();

  // require OTP after 2 devices
  if (totalDevices >= 2) {
    const otp = generateOTP();

    await DeviceOTP.create({
      userId,
      fingerprint,
      otp,
      expiresAt: otpExpiry(),
    });

    console.log("DEVICE OTP:", otp);

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