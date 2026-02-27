import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { io } from "socket.io-client";

export const usePinSocket = (onPinUpdate: (payload: any) => void) => {
  useEffect(() => {
    let socket: any;
    (async () => {
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      if (!token || !userId) return;

      socket = io("http://192.168.1.217:5000", {
        auth: { token },
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        socket.emit("join", userId);
      });

      socket.on("pin:update", (payload: any) => onPinUpdate(payload));
      socket.on("withdraw:update", (payload: any) => {
        // optionally listen in screens
        console.log("withdraw update", payload);
      });
    })();

    return () => socket?.disconnect();
  }, []);
};
