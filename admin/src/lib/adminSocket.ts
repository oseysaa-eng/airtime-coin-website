import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/* ============================================
   CONNECT ADMIN SOCKET (SAFE SINGLETON)
============================================ */
export const connectAdminSocket = (): Socket | null => {
  if (socket && socket.connected) {
    return socket;
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken")
      : null;

  if (!token) {
    console.warn("⚠️ No admin token found");
    return null;
  }

  // 🔥 prevent duplicate instances
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_ADMIN_API_URL!, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("🟢 Admin socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Admin socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);
    });
  }

  return socket;
};

/* ============================================
   GET SOCKET (SAFE)
============================================ */
export const getAdminSocket = (): Socket | null => {
  return socket;
};

/* ============================================
   SAFE LISTENER HELPER (🔥 IMPORTANT)
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
    socket.disconnect();
    socket = null;
  }
};