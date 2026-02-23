import { NextFunction, Response } from "express";
import { verifyDevice } from "../services/deviceTrustService";

export default async function deviceTrust(
  req: any,
  res: Response,
  next: NextFunction
) {
  const fingerprint = req.body.fingerprint;

  if (!fingerprint) {
    return res.status(400).json({
      message: "Device fingerprint required",
    });
  }

  const result = await verifyDevice({
    userId: req.user.id,
    fingerprint,
    deviceName: req.headers["x-device-name"],
    platform: req.headers["x-platform"],
    ip: req.ip,
  });

  if (!result.allowed) {
    return res.status(403).json({
      message: "Unrecognized device",
      code: result.reason,
    });
  }

  next();
}