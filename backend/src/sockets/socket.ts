import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerCallHandlers } from "./callEngine";

let ioInstance: Server | null = null;

/* ============================================
   MAIN SOCKET SETUP
============================================ */
export function setupSocket(io: Server) {
  ioInstance = io;

  /* =========================
     AUTH MIDDLEWARE (SINGLE)
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
      socket.role = decoded.role || "user";

      next();

    } catch (err: any) {
      console.log("❌ Socket auth failed:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  /* =========================
     CONNECTION HANDLER
  ========================= */
  io.on("connection", (socket: any) => {

    console.log("🟢 Socket connected:", socket.id);
    console.log("👤 User:", socket.userId);

    // ✅ Join personal room
    socket.join(socket.userId);

    /* ================= ADMIN ================= */
    if (socket.role === "admin") {
      socket.join("admins");
      console.log("👑 Admin connected");
    }

    /* ================= CALL ENGINE ================= */
    registerCallHandlers(io, socket);

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.userId);
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
   USER EVENT EMITTER (ROOM-BASED)
============================================ */
export function pushWalletUpdate(userId: string, payload: any) {
  if (!ioInstance) return;

  ioInstance.to(userId).emit("WALLET_UPDATE", payload);
}

export function pushMinutes(
  userId: string,
  minutes: number,
  extra: any = {}
) {
  if (!ioInstance) return;

  ioInstance.to(userId).emit("MINUTES_CREDIT", {
    minutes,
    ...extra,
  });
}