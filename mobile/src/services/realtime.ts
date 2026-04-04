import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/* ================= CONNECT ================= */

export async function connectSocket(
  serverUrl = "https://atc-backend-cn4f.onrender.com"
) {
  if (socket && socket.connected) return socket;

  const token = await AsyncStorage.getItem("token");

  socket = io(serverUrl, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Connect error:", err.message);
  });

  return socket;
}

/* ================= JOIN ROOM ================= */

export async function joinUserRoom(userId: string) {
  if (!socket) await connectSocket();
  socket?.emit("join", userId);
}

/* ================= LISTEN ================= */

export function onMinutesCredit(cb: (payload: any) => void) {
  if (!socket) return;

  socket.off("MINUTES_CREDIT"); // prevent duplicates
  socket.on("MINUTES_CREDIT", cb);
}

/* ================= OFF ================= */

export function offMinutesCredit(cb?: any) {
  socket?.off("MINUTES_CREDIT", cb);
}

/* ================= DISCONNECT ================= */

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}