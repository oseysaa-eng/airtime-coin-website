import crypto from "crypto";

export const verifyAdSignature = (
  raw: string,
  signature: string,
  secret: string
) => {
  const hash = crypto
    .createHash("sha256")
    .update(raw + secret)
    .digest("hex");

  return hash === signature;
};
