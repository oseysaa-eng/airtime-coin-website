import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { AppState } from "react-native";

const SOCKET_URL = "https://atc-backend-cn4f.onrender.com";

let socket: Socket | null = null;
let isConnecting = false;

/* =====================================
   CONNECT (SAFE + SINGLE INSTANCE)
===================================== */
export const connectSocket = async (): Promise<Socket | null> => {
  try {
    // ✅ prevent duplicate connections
    if (socket && socket.connected) return socket;
    if (isConnecting) return socket;

    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      console.log("⚠️ No token → skipping socket connection");
      return null;
    }

    isConnecting = true;

    // 🔥 cleanup old socket completely
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
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", async () => {
      console.log("✅ Socket connected:", socket?.id);

      const userId = await AsyncStorage.getItem("userId");

      if (userId) {
        socket?.emit("join", userId);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Connect error:", err.message);
    });

    socket.on("error", (err) => {
      console.log("❌ Socket error:", err);
    });

    isConnecting = false;

    return socket;

  } catch (err) {
    isConnecting = false;
    console.log("❌ Socket init failed:", err);
    return null;
  }
};

/* =====================================
   GET SOCKET (SAFE)
===================================== */
export const getSocket = async (): Promise<Socket | null> => {
  if (!socket || !socket.connected) {
    return await connectSocket();
  }
  return socket;
};

/* =====================================
   DISCONNECT (CLEAN)
===================================== */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/* =====================================
   SAFE EVENT LISTENER (NO DUPLICATES)
===================================== */
export const onSocketEvent = async (
  event: string,
  cb: (data: any) => void
) => {
  const s = await getSocket();
  if (!s) return () => {};

  // ✅ prevent duplicate listener
  s.off(event, cb);
  s.on(event, cb);

  return () => {
    s.off(event, cb);
  };
};

/* =====================================
   APP RESUME HANDLER (SAFE)
===================================== */
let currentState = AppState.currentState;

const handleAppStateChange = async (nextState: string) => {
  if (currentState.match(/inactive|background/) && nextState === "active") {
    console.log("🔄 App resumed → reconnect socket");
    await connectSocket();
  }

  currentState = nextState;
};

// ✅ prevent multiple listeners in dev reload
AppState.removeEventListener?.("change", handleAppStateChange as any);
AppState.addEventListener("change", handleAppStateChange);