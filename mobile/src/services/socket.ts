import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.217:5000";

let socket: Socket | null = null;

/* =====================================
   CONNECT
===================================== */

export const connectSocket = async () => {
  if (socket) return socket;

  const token = await AsyncStorage.getItem("userToken");
  const userId = await AsyncStorage.getItem("userId");

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);

    // 🔐 VERY IMPORTANT
    if (userId) {
      socket?.emit("join", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return socket;
};

/* =====================================
   GET SOCKET
===================================== */

export const getSocket = () => socket;

/* =====================================
   DISCONNECT
===================================== */

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};