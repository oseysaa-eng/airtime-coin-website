import DeviceOTP from "../models/DeviceOTP";
import UserDevice from "../models/UserDevice";
import { generateOTP } from "../utils/generateOTP";
import { sendEmail } from "../utils/sendEmail";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

/* =================================================
   📩 SEND OTP (SAFE + RATE LIMITED)
================================================= */
export async function sendDeviceOTP({
  userId,
  email,
  fingerprint,
}: {
  userId: string;
  email: string;
  fingerprint: string;
}) {
  /* 🔒 CHECK EXISTING OTP (COOLDOWN) */
  const existing = await DeviceOTP.findOne({
    userId,
    fingerprint,
    expiresAt: { $gt: new Date() },
  });

  if (existing) {
    const diff = Date.now() - new Date(existing.createdAt).getTime();

    if (diff < OTP_COOLDOWN_MS) {
      throw new Error("OTP already sent. Please wait.");
    }

    // reuse same OTP (optional strategy)
    await sendEmail(
      email,
      "ATC Device Verification Code",
      `Your verification code is: ${existing.otp}`
    );

    return { success: true, reused: true };
  }

  /* 🔐 GENERATE NEW OTP */
  const otp = generateOTP();

  await DeviceOTP.create({
    userId,
    fingerprint,
    otp,
    attempts: 0,
    verified: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });

  await sendEmail(
    email,
    "ATC Device Verification Code",
    `Your verification code is: ${otp}`
  );

  return { success: true };
}

/* =================================================
   ✅ VERIFY OTP (SECURE)
================================================= */
export async function verifyDeviceOTP({
  userId,
  fingerprint,
  otp,
}: {
  userId: string;
  fingerprint: string;
  otp: string;
}) {
  const record = await DeviceOTP.findOne({
    userId,
    fingerprint,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return { success: false, message: "OTP expired or not found" };
  }

  /* 🔒 ATTEMPT LIMIT */
  if ((record.attempts || 0) >= MAX_ATTEMPTS) {
    return { success: false, message: "Too many attempts" };
  }

  if (record.otp !== otp) {
    record.attempts = (record.attempts || 0) + 1;
    await record.save();

    return { success: false, message: "Invalid OTP" };
  }

  /* ✅ SUCCESS */
  record.verified = true;
  await record.save();

  /* 🔥 TRUST THE DEVICE */
  await UserDevice.findOneAndUpdate(
    { userId, fingerprint },
    {
      trusted: true,
      verifiedAt: new Date(),
    }
  );

  return { success: true };
}