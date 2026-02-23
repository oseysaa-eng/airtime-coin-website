import crypto from "crypto";

export const generateFingerprint = (data: {
  deviceId?: string;
  platform?: string;
  osVersion?: string;
  model?: string;
}) => {
  const raw = `${data.deviceId}|${data.platform}|${data.osVersion}|${data.model}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
};
