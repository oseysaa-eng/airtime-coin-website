import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { AppState } from "react-native";

const SOCKET_URL = "https://atc-backend-cn4f.onrender.com";

let socket: Socket | null = null;
let isConnecting = false;

/* =====================================
   CONNECT SOCKET (SAFE + STABLE)
===================================== */
export const connectSocket = async (): Promise<Socket | null> => {
  try {
    if (socket?.connected) return socket;
    if (isConnecting) return socket;

    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      console.log("⚠️ No token → skip socket");
      return null;
    }

    isConnecting = true;

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity, // 🔥 keep trying
      reconnectionDelay: 2000,
    });

    /* =============================
       EVENTS
    ============================= */

    socket.on("connect", async () => {
      console.log("🟢 Socket connected:", socket?.id);

      const userId = await AsyncStorage.getItem("userId");

      if (userId) {
        socket?.emit("join", userId);
      }

      isConnecting = false; // ✅ FIXED (only here)
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    socket.on("connect_error", async (err) => {
      console.log("❌ Connect error:", err.message);

      isConnecting = false;

      /* 🔥 HANDLE UNAUTHORIZED */
      if (err.message === "Unauthorized") {
        console.log("🔐 Token invalid → forcing logout");

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
    isConnecting = false;
    console.log("❌ Socket init failed:", err);
    return null;
  }
};

/* =====================================
   GET SOCKET
===================================== */
export const getSocket = async (): Promise<Socket | null> => {
  if (!socket || !socket.connected) {
    return await connectSocket();
  }
  return socket;
};

/* =====================================
   DISCONNECT
===================================== */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/* =====================================
   SAFE EVENT LISTENER
===================================== */
export const onSocketEvent = async (
  event: string,
  cb: (data: any) => void
) => {
  const s = await getSocket();
  if (!s) return () => {};

  s.off(event, cb);
  s.on(event, cb);

  return () => {
    s.off(event, cb);
  };
};

/* =====================================
   APP STATE HANDLER (MODERN API)
===================================== */
let currentState = AppState.currentState;

const subscription = AppState.addEventListener("change", async (nextState) => {
  if (currentState.match(/inactive|background/) && nextState === "active") {
    console.log("🔄 App resumed → reconnect socket");
    await connectSocket();
  }

  currentState = nextState;
});