// src/services/pushService.ts
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (base64) {
  const tmpPath = path.join(process.cwd(), "tmp-firebase-sa.json");
  fs.writeFileSync(tmpPath, Buffer.from(base64, "base64").toString("utf8"), "utf8");
  admin.initializeApp({
    credential: admin.credential.cert(require(tmpPath)),
  });
} else {
  // fallback to local file (dev)
  const saPath = path.join(process.cwd(), "config", "firebase-service-account.json");
  if (fs.existsSync(saPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(require(saPath)),
    });
  } else {
    console.warn("Firebase service account not found — push notifications disabled");
  }
}

export const sendPushToToken = async (token: string, payload: admin.messaging.MessagingPayload) => {
  try {
    const resp = await admin.messaging().sendToDevice(token, payload);
    return resp;
  } catch (err) {
    console.error("sendPushToToken error", err);
    throw err;
  }
};

export const sendPushToTokens = async (tokens: string[], payload: admin.messaging.MessagingPayload) => {
  try {
    const resp = await admin.messaging().sendToDevice(tokens, payload);
    return resp;
  } catch (err) {
    console.error("sendPushToTokens error", err);
    throw err;
  }
};
