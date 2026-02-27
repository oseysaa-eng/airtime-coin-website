import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "../store/appStore";

const SOCKET_URL = "http://192.168.1.217:5000";

export const useAppSocket = () => {
  const setPinStatus = useAppStore(s => s.setPinStatus);
  const setKycStatus = useAppStore(s => s.setKycStatus);

  useEffect(() => {
    let socket:any;

    (async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"]
      });

      socket.on("connect", () => {
        console.log("✅ App socket connected");
      });

      socket.emit("join");

      // ✅ PIN real-time updates
      socket.on("pin:update", payload => {
        console.log("🔔 PIN Updated", payload);
        setPinStatus(payload.configured);
      });

      // ✅ KYC real-time updates
      socket.on("kyc:update", payload => {
        console.log("🔔 KYC Update:", payload);
        setKycStatus(payload.status);
      });

    })();

    return () => socket?.disconnect();
  }, []);
};
