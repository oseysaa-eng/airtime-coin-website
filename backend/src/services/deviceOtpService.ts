import DeviceOTP from "../models/DeviceOTP";
import { generateOTP } from "../utils/generateOTP";
import { sendEmail } from "../utils/sendEmail";

export async function sendDeviceOTP({
  userId,
  email,
  fingerprint,
}: {
  userId: string;
  email: string;
  fingerprint: string;
}) {
  const otp = generateOTP();

  await DeviceOTP.deleteMany({ userId, fingerprint });

  await DeviceOTP.create({
    userId,
    fingerprint,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
  });

  await sendEmail(
    email,
    "ATC Device Verification Code",
    `Your verification code is: ${otp}`
  );
}

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
    otp,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return false;

  record.verified = true;
  await record.save();

  return true;
}