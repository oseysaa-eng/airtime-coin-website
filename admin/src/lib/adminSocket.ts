import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/* ============================================
   CONNECT ADMIN SOCKET (SAFE + TOKEN AWARE)
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

  /* 🔥 FORCE RECONNECT IF TOKEN CHANGED */
  if (socket) {
    const currentToken = socket.auth?.token;

    if (currentToken !== token) {
      console.log("🔄 Token changed — reconnecting socket");

      socket.disconnect();
      socket = null;
    }
  }

  /* 🔥 CREATE NEW SOCKET */
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_ADMIN_API_URL!, {
      transports: ["websocket"],
      auth: { token },

      reconnection: true,
      reconnectionAttempts: 5,
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

      /* 🔥 AUTO LOGOUT ON AUTH FAILURE */
      if (err.message === "Unauthorized") {
        console.warn("🚨 Admin session expired");

        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
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
   SAFE LISTENER HELPER (NO DUPLICATES)
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

  /* 🔥 REMOVE OLD FIRST (prevents duplicate listeners) */
  s.off(event, callback);
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
    socket.disconnect();
    socket = null;
  }
};