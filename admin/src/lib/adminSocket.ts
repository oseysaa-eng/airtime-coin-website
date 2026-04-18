import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

/* ============================================
   CONNECT ADMIN SOCKET (FINAL SAFE VERSION)
============================================ */
export const connectAdminSocket = (
  tokenOverride?: string
): Socket | null => {
  const token =
    tokenOverride ||
    (typeof window !== "undefined"
      ? localStorage.getItem("adminToken")
      : null);

  if (!token) {
    console.warn("⚠️ No admin token found");
    return null;
  }

  /* 🔥 RECONNECT IF TOKEN CHANGED */
  if (socket && currentToken !== token) {
    console.log("🔄 Token changed — resetting socket");

    socket.disconnect();
    socket = null;
  }

  /* 🔥 CREATE SOCKET ONLY ONCE */
  if (!socket) {
    currentToken = token;

    socket = io(process.env.NEXT_PUBLIC_ADMIN_API_URL!, {
      transports: ["websocket"],
      auth: { token },

      reconnection: true,
      reconnectionAttempts: Infinity, // 🔥 keep trying
      reconnectionDelay: 2000,
    });

    /* ================= EVENTS ================= */

    socket.on("connect", () => {
      console.log("🟢 Admin socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Admin socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);

      /* 🔥 AUTH FAILURE HANDLING */
      if (
        err.message === "Unauthorized" ||
        err.message === "invalid token"
      ) {
        console.warn("🚨 Admin session expired");

        localStorage.removeItem("adminToken");

        // safer than window.location
        if (typeof window !== "undefined") {
          window.location.replace("/admin/login");
        }
      }
    });
  }

  return socket;
};

/* ============================================
   GET SOCKET
============================================ */
export const getAdminSocket = (): Socket | null => {
  return socket;
};

/* ============================================
   SAFE LISTENER (NO DUPLICATES GUARANTEED)
============================================ */
export const onAdminSocket = (
  event: string,
  callback: (...args: any[]) => void
) => {
  const s = connectAdminSocket();

  if (!s) {
    console.warn(`⚠️ Socket not ready for event: ${event}`);
    return () => {};
  }

  /* 🔥 REMOVE ALL LISTENERS FOR THIS EVENT FIRST */
  s.removeAllListeners(event);

  s.on(event, callback);

  return () => {
    s.off(event, callback);
  };
};

/* ============================================
   DISCONNECT
============================================ */
export const disconnectAdminSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting admin socket");

    socket.removeAllListeners(); // 🔥 important cleanup
    socket.disconnect();

    socket = null;
    currentToken = null;
  }
};