"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

let socket: any;

export default function RealtimeProvider({ onUpdate }: any) {

  useEffect(() => {
    socket = io("https://atc-backend-cn4f.onrender.com", {
      auth: {
        token: localStorage.getItem("adminToken"),
      },
    });

    socket.on("connect", () => {
      console.log("🟢 Admin socket connected");
    });

    /* 🔥 LIVE ANALYTICS UPDATE */
    socket.on("ADMIN_ANALYTICS_UPDATE", (data: any) => {
      console.log("📡 Live analytics update", data);
      onUpdate(data);
    });

    /* 🚨 FRAUD ALERTS */
    socket.on("FRAUD_ALERT", (alert: any) => {
      console.log("🚨 Fraud alert", alert);
      onUpdate((prev: any) => ({
        ...prev,
        alerts: (prev.alerts || 0) + 1,
        warnings: [alert, ...(prev.warnings || [])],
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
}