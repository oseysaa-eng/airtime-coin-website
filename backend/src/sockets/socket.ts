import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { registerCallHandlers } from "./callHandlers";

let ioInstance: Server | null = null;

/* 🔥 Track active users (multi-device safe) */
const activeUsers = new Map<string, Set<string>>();

/* ============================================
   MAIN SOCKET SETUP
============================================ */
export function setupSocket(io: Server) {
  ioInstance = io;

  /* ================= AUTH ================= */
  io.use((socket: any, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        console.log("❌ No token provided");
        return next(new Error("Unauthorized"));
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not set");
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.id) {
        return next(new Error("Invalid token"));
      }

      socket.userId = decoded.id;
      socket.role = decoded.role || "user";

      next();

    } catch (err: any) {
      console.log("❌ Socket auth failed:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", (socket: any) => {
    const userId = socket.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log("🟢 Socket connected:", socket.id);
    console.log("👤 User:", userId);

    /* ================= JOIN ROOM ================= */
    socket.join(userId);

    /* ================= TRACK ACTIVE USERS ================= */
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }

    activeUsers.get(userId)!.add(socket.id);

    console.log("📊 Active devices:", activeUsers.get(userId)?.size);

    /* ================= MEMORY SAFETY ================= */
    if (activeUsers.size > 10000) {
      console.warn("⚠️ Active users overflow, clearing...");
      activeUsers.clear();
    }

    /* ================= ADMIN ================= */
    if (socket.role === "admin") {
      socket.join("admins");
      console.log("👑 Admin connected");
    }

    /* ================= CALL ENGINE ================= */
    try {
      registerCallHandlers(io, socket);
    } catch (err) {
      console.error("❌ Call handler error:", err);
    }

    /* ================= HEARTBEAT (ANTI-GHOST SOCKETS) ================= */
    socket.on("ping-check", () => {
      socket.emit("pong-check");
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);

      const userSockets = activeUsers.get(userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          activeUsers.delete(userId);
          console.log("👤 User fully offline:", userId);
        } else {
          console.log("📊 Remaining devices:", userSockets.size);
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
   USER EVENT EMITTERS
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