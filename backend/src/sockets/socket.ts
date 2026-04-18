import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerCallHandlers } from "./callHandlers";

let ioInstance: Server | null = null;

const activeUsers = new Map<string, Set<string>>();

export function setupSocket(io: Server) {
  ioInstance = io;

  /* ================= AUTH ================= */
  io.use((socket: any, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      let decoded: any = null;

      // 🔒 Try admin token
      if (process.env.ADMIN_JWT_SECRET) {
        try {
          decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
          socket.role = "admin";
        } catch {}
      }

      // 🔒 Fallback to user token
      if (!decoded && process.env.JWT_SECRET) {
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.role = "user";
        } catch {}
      }

      if (
        !decoded?.id ||
        (typeof decoded.id !== "string" && typeof decoded.id !== "number")
      ) {
        return next(new Error("Invalid token payload"));
      }

      socket.userId = decoded.id.toString();

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", (socket: any) => {
    const userId = socket.userId;

    if (!userId) {
      socket.emit("error", "Unauthorized");
      return socket.disconnect(true);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("🟢 Socket connected:", socket.id);
      console.log("👤 User:", userId);
    }

    /* ================= ROOMS ================= */
    if (socket.role === "admin") {
      socket.join("admins");
      console.log("👑 Admin connected");
    } else {
      socket.join(userId);

      /* ================= TRACK USERS (ONLY USERS) ================= */
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
      }

      activeUsers.get(userId)!.add(socket.id);

      if (process.env.NODE_ENV !== "production") {
        console.log(
          "📊 Active devices:",
          activeUsers.get(userId)?.size
        );
      }
    }

    /* ================= MEMORY CONTROL ================= */
    if (activeUsers.size > 2000) {
      console.warn("⚠️ Active users overflow, trimming...");

      const iterator = activeUsers.keys();
      let count = 0;

      while (count < 500) {
        const key = iterator.next().value;
        if (!key) break;

        activeUsers.delete(key);
        count++;
      }
    }

    /* ================= CALL HANDLER ================= */
    try {
      registerCallHandlers(socket);
    } catch (err) {
      console.error("❌ Call handler error:", err);
    }

    /* ================= HEARTBEAT ================= */
    let lastPing = 0;

    socket.on("ping-check", () => {
      const now = Date.now();

      if (now - lastPing < 2000) return;

      lastPing = now;

      socket.emit("pong-check");
    });

    /* ================= ERROR HANDLER ================= */
    socket.on("error", (err: any) => {
      console.error("⚠️ Socket error:", err?.message);
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      if (process.env.NODE_ENV !== "production") {
        console.log("🔴 Disconnected:", socket.id);
      }

      if (socket.role !== "admin") {
        const userSockets = activeUsers.get(userId);

        if (userSockets) {
          userSockets.delete(socket.id);

          if (userSockets.size === 0) {
            activeUsers.delete(userId);
            console.log("👤 User offline:", userId);
          }
        }
      }
    });
  });
}

/* ================= EMITTERS ================= */

export function emitAdminEvent(event: string, payload: any) {
  if (!ioInstance) return;

  ioInstance.to("admins").emit(event, payload);
}

export function pushWalletUpdate(userId: string, payload: any) {
  if (!ioInstance) return;

  if (process.env.NODE_ENV !== "production") {
    console.log("📤 WALLET_UPDATE →", userId, payload);
  }

  ioInstance.to(userId.toString()).emit("WALLET_UPDATE", payload);
}

export function pushMinutes(
  userId: string,
  minutes: number,
  extra: any = {}
) {
  if (!ioInstance) return;

  if (process.env.NODE_ENV !== "production") {
    console.log("📤 MINUTES_CREDIT →", userId, minutes);
  }

  ioInstance.to(userId.toString()).emit("MINUTES_CREDIT", {
    minutes,
    ...extra,
  });
}