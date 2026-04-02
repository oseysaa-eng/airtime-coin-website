import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/* ============================================
   CONNECT ADMIN SOCKET (SAFE SINGLETON)
============================================ */
export const connectAdminSocket = () => {
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

  return socket;
};

/* ============================================
   GET EXISTING SOCKET
============================================ */
export const getAdminSocket = () => socket;

/* ============================================
   DISCONNECT (OPTIONAL)
============================================ */
export const disconnectAdminSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};