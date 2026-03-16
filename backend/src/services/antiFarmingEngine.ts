import DeviceBinding from "../models/DeviceBinding";
import UserTrust from "../models/UserTrust";
import FraudEvent from "../models/FraudEvent";
import { emitAdminEvent } from "../sockets/socket";

export const runAntiFarmingChecks = async ({
  userId,
  deviceId,
  ip
}: {
  userId: any;
  deviceId: any;
  ip?: string;
}) => {

  /* ─────────────────────────
     MULTI ACCOUNT DEVICE
  ───────────────────────── */

  const deviceBindings = await DeviceBinding.find({ deviceId });

  if (deviceBindings.length > 3) {

    await FraudEvent.create({
      type: "MULTI_ACCOUNT_DEVICE",
      severity: "high",
      deviceId,
      message: `Device used by ${deviceBindings.length} accounts`
    });

    emitAdminEvent("fraud.event", {
      type: "MULTI_ACCOUNT_DEVICE"
    });

  }

  /* ─────────────────────────
     MANY DEVICES PER USER
  ───────────────────────── */

  const userDevices = await DeviceBinding.find({ userId });

  if (userDevices.length > 5) {

    await FraudEvent.create({
      type: "DEVICE_SWITCHING",
      severity: "medium",
      userId,
      message: "User logging from many devices"
    });

  }

  /* ─────────────────────────
     TRUST SCORE REDUCTION
  ───────────────────────── */

  const trust = await UserTrust.findOneAndUpdate(
    { userId },
    { $inc: { score: -5 } },
    { new: true, upsert: true }
  );

  if (trust.score < 40) {

    await FraudEvent.create({
      type: "TRUST_BLOCKED",
      severity: "critical",
      userId,
      message: "User trust score dropped below threshold"
    });

  }

};