import crypto from "crypto";

type DeviceFingerprintInput = {
  deviceId?: string;
  platform?: string;
  osVersion?: string;
  model?: string;
  appVersion?: string;
};

export const generateFingerprint = (
  data: DeviceFingerprintInput
) => {

  const raw = [
    data.deviceId,
    data.model,
    data.osVersion,
    data.platform,
    data.appVersion
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");

};