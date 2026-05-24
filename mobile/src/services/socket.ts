import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { AppState } from "react-native";

const SOCKET_URL = "https://atc-backend-cn4f.onrender.com";

let socket: Socket | null = null;
let connecting = false;

/* ================= CONNECT ================= */



export const connectSocket = async (
  token?: string
) => {

  if (socket?.connected) {
    return socket;
  }

  if (connecting) {
    return socket;
  }

  connecting = true;

  try {

    const authToken =
      token ||
      await AsyncStorage.getItem("userToken");

    if (!authToken) {
      console.log("⚠️ No token");
      return null;
    }

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    console.log("🔌 Initializing socket...");

    socket = io(SOCKET_URL, {
      auth: {
        token: authToken,
      },

      transports: ["websocket"],

      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,

      timeout: 20000,

      forceNew: true,
    });

    socket.on("connect", () => {
      console.log(
        "🟢 Socket connected:",
        socket?.id
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "🔴 Socket disconnected:",
        reason
      );
    });

    socket.on("connect_error", async (err) => {

      console.log(
        "❌ Connect error:",
        err.message
      );

      if (err.message === "Unauthorized") {

        await AsyncStorage.multiRemove([
          "userToken",
          "refreshToken",
          "userId",
        ]);

        disconnectSocket();
      }
    });

    socket.on("error", (err) => {
      console.log("❌ Socket error:", err);
    });

    return socket;

  } catch (err) {

    console.log(
      "❌ Socket init failed:",
      err
    );

    return null;

  } finally {
    connecting = false;
  }
};

/* ================= GET ================= */
export const getSocket = () => socket;

/* ================= DISCONNECT ================= */
export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Socket manually disconnected");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/* ================= SUBSCRIBE ================= */
export const onSocketEvent = (
  event: string,
  cb: (data: any) => void
) => {
  if (!socket) {
    console.warn("⚠️ Socket not ready for:", event);
    return () => {};
  }

  socket.off(event, cb);
  socket.on(event, cb);

  return () => socket?.off(event, cb);
};

/* ================= APP STATE ================= */
let currentState = AppState.currentState;

AppState.addEventListener("change", async (nextState) => {
  if (currentState.match(/inactive|background/) && nextState === "active") {
    console.log("🔄 App resumed → reconnect socket");
    await connectSocket();
  }

  currentState = nextState;
});