import admin from "firebase-admin";
import fs from "fs";
import path from "path";
const fetch = require("node-fetch");

/* ================= FIREBASE INIT ================= */

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!admin.apps.length) {
  try {
    if (base64) {
      const tmpPath = path.join(process.cwd(), "tmp-firebase-sa.json");

      fs.writeFileSync(
        tmpPath,
        Buffer.from(base64, "base64").toString("utf8"),
        "utf8"
      );

      admin.initializeApp({
        credential: admin.credential.cert(require(tmpPath)),
      });

    } else {
      const saPath = path.join(process.cwd(), "config", "firebase-service-account.json");

      if (fs.existsSync(saPath)) {
        admin.initializeApp({
          credential: admin.credential.cert(require(saPath)),
        });
      } else {
        console.warn("⚠️ Firebase not configured");
      }
    }
  } catch (err) {
    console.error("🔥 Firebase init error:", err);
  }
}

/* ================= HELPERS ================= */

const isExpoToken = (token: string) =>
  token?.startsWith("ExponentPushToken");

/* ================= MAIN FUNCTION ================= */

export const sendPushToTokens = async (tokens: string[], payload: any) => {
  if (!tokens || !tokens.length) return;

  const expoTokens = tokens.filter(isExpoToken);
  const fcmTokens = tokens.filter(t => !isExpoToken(t));

  /* ================= EXPO PUSH ================= */
  if (expoTokens.length) {
    try {
      const messages = expoTokens.map(token => ({
        to: token,
        sound: "default",
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data || {},
      }));

      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const result = await res.json();
      console.log("📲 Expo push response:", result);

    } catch (err) {
      console.error("❌ Expo push error:", err);
    }
  }

  /* ================= FIREBASE PUSH ================= */
  if (fcmTokens.length && admin.apps.length) {
    try {
      await admin.messaging().sendToDevice(fcmTokens, payload);
      console.log("🔥 FCM push sent:", fcmTokens.length);

    } catch (err) {
      console.error("❌ FCM push error:", err);
    }
  }
};