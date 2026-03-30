import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerCallHandlers } from "./callEngine";

const activeUsers = new Map<string, string>();
let ioInstance: Server | null = null;

/* ============================================
   MAIN SOCKET SETUP
============================================ */
export function setupSocket(io: Server) {

  ioInstance = io;

  /* =========================
     AUTH MIDDLEWARE (FIXED)
  ========================= */
  io.use((socket: any, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token"));
      }

      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET!
      );

      socket.userId = decoded.id;
      socket.role = decoded.role;

      next();

    } catch (err) {
      console.log("❌ Socket auth failed");
      next(new Error("Unauthorized"));
    }
  });

  /* =========================
     CONNECTION HANDLER
  ========================= */
  io.on("connection", (socket: any) => {

    console.log("🟢 Socket connected:", socket.id);
    console.log("👤 User:", socket.userId);

    /* ================= ADMIN ================= */
    if (socket.role === "admin") {
      socket.join("admins");
      console.log("👑 Admin connected");
    }

    /* ================= USER JOIN ================= */
    socket.on("join", (userId: string) => {

      if (!userId) return;

      activeUsers.set(userId, socket.id);

      console.log("👤 User joined:", userId);

    });

    /* ================= CALL ENGINE (CRITICAL) ================= */
    registerCallHandlers(io, socket);

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {

      for (const [uid, sid] of activeUsers.entries()) {

        if (sid === socket.id) {
          activeUsers.delete(uid);
          console.log("🔴 User disconnected:", uid);
        }

      }

    });

  });

}

/* ============================================
   ADMIN EVENT EMITTER
============================================ */
export function emitAdminEvent(event: string, payload: any) {

  if (!ioInstance) return;

  ioInstance.to("admins").emit(event, payload);

}

/* ============================================
   USER EVENT EMITTER
============================================ */
export function pushWalletUpdate(
  userId: string,
  payload: any
) {
  if (!ioInstance) return;

  const socketId = activeUsers.get(userId);
  if (!socketId) return;

  ioInstance.to(socketId).emit("WALLET_UPDATE", payload);
}

export function pushMinutes(
  userId: string,
  minutes: number,
  extra: any = {}
) {
  if (!ioInstance) return;

  const socketId = activeUsers.get(userId);
  if (!socketId) return;

  ioInstance.to(socketId).emit("MINUTES_CREDIT", {
    minutes,
    ...extra,
  });
}