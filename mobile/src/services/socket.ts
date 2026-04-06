import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { AppState } from "react-native";

const SOCKET_URL = "https://atc-backend-cn4f.onrender.com";

let socket: Socket | null = null;
let connectingPromise: Promise<Socket | null> | null = null;

/* =====================================
   CONNECT SOCKET (SINGLETON SAFE)
===================================== */
export const connectSocket = async (): Promise<Socket | null> => {
  try {
    // ✅ already connected
    if (socket?.connected) return socket;

    // ✅ already connecting (prevent duplicates)
    if (connectingPromise) return connectingPromise;

    connectingPromise = (async () => {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.log("⚠️ No token → skip socket");
        connectingPromise = null;
        return null;
      }

      console.log("🔌 Initializing socket...");

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
      });

      /* ================= EVENTS ================= */

      socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket?.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔴 Socket disconnected:", reason);
      });

      socket.on("connect_error", async (err) => {
        console.log("❌ Connect error:", err.message);

        if (err.message === "Unauthorized") {
          console.log("🔐 Token expired → logout");

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

      connectingPromise = null;
      return socket;
    })();

    return connectingPromise;

  } catch (err) {
    connectingPromise = null;
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
    console.log("🔌 Socket manually disconnected");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/* =====================================
   SAFE EVENT SUBSCRIBE
===================================== */
export const onSocketEvent = async (
  event: string,
  cb: (data: any) => void
) => {
  const s = await getSocket();
  if (!s) return () => {};

  // ✅ prevent duplicate listeners
  s.off(event);
  s.on(event, cb);

  return () => {
    s.off(event, cb);
  };
};

/* =====================================
   APP STATE (AUTO RECONNECT)
===================================== */
let currentState = AppState.currentState;

AppState.addEventListener("change", async (nextState) => {
  if (currentState.match(/inactive|background/) && nextState === "active") {
    console.log("🔄 App resumed → reconnect socket");
    await connectSocket();
  }

  currentState = nextState;
});