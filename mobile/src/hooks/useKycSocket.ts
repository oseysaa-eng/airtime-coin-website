import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import API from "../api/api";

let socket: Socket | null = null;

export const useKycSocket = () => {
  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      // Fetch user ID
      const profile = await API.get("/api/kyc").catch(() => null);
      const userId = profile?.data?.user?._id;

      if (!isMounted || !userId) return;

      // Prevent double creation
      if (socket) socket.disconnect();

      socket = io("http://192.168.1.217:5000", {
        transports: ["websocket"],
        auth: { token },
      });

      socket.on("connect", () => {
        console.log("Socket connected", socket.id);
        socket?.emit("join", userId);
      });

      socket.on("kyc:update", (payload) => {
        console.log("📡 REAL-TIME KYC UPDATE:", payload);

        // 🔥 Broadcast globally using an event emitter
        globalThis.dispatchEvent(
          new CustomEvent("kycStatusChanged", { detail: payload })
        );

        // Optionally store status
        AsyncStorage.setItem("kycStatus", payload.status);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    };

    initSocket();

    return () => {
      isMounted = false;
      socket?.disconnect();
      socket = null;
    };
  }, []);
};
