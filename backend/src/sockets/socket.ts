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
      console.log("❌ No token provided");
      return next(new Error("Unauthorized"));
    }

    let decoded: any = null;

    // 🔥 TRY ADMIN TOKEN FIRST
    try {
      decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
      socket.role = "admin";
      console.log("👑 Admin authenticated");
    } catch (err) {
      // 🔥 FALLBACK TO USER TOKEN
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
      socket.role = "user";
      console.log("👤 User authenticated");
    }

    if (!decoded?.id) {
      return next(new Error("Invalid token"));
    }

    socket.userId = decoded.id.toString();

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
      console.log("❌ No userId - disconnect");
      socket.emit("error", "Unauthorized");
      return socket.disconnect(true);
    }

    console.log("🟢 Socket connected:", socket.id);
    console.log("👤 User:", userId);

    socket.join(userId);

    /* ================= TRACK USERS ================= */
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }

    activeUsers.get(userId)!.add(socket.id);

    console.log("📊 Active devices:", activeUsers.get(userId)?.size);

    if (activeUsers.size > 10000) {
      console.warn("⚠️ Active users overflow, clearing...");
      activeUsers.clear();
    }

    /* ================= ADMIN ================= */
    if (socket.role === "admin") {
      socket.join("admins");
      console.log("👑 Admin connected");
    }

    /* ================= CALL HANDLER ================= */
    try {
      registerCallHandlers(socket);
    } catch (err) {
      console.error("❌ Call handler error:", err);
    }

    /* ================= HEARTBEAT ================= */
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
          console.log("👤 User offline:", userId);
        } else {
          console.log("📊 Remaining devices:", userSockets.size);
        }
      }
    });
  });
}

/* ================= EMITTERS ================= */

export function emitAdminEvent(event: string, payload: any) {
  if (!ioInstance) {
    console.warn("⚠️ IO not ready (admin emit skipped)");
    return;
  }

  ioInstance.to("admins").emit(event, payload);
}

export function pushWalletUpdate(userId: string, payload: any) {
  if (!ioInstance) {
    console.warn("⚠️ IO not ready (wallet update skipped)");
    return;
  }

  console.log("📤 WALLET_UPDATE →", userId, payload); // 🔥 DEBUG

  ioInstance.to(userId.toString()).emit("WALLET_UPDATE", payload);
}

export function pushMinutes(
  userId: string,
  minutes: number,
  extra: any = {}
) {
  if (!ioInstance) {
    console.warn("⚠️ IO not ready (minutes skipped)");
    return;
  }

  console.log("📤 MINUTES_CREDIT →", userId, minutes); // 🔥 DEBUG

  ioInstance.to(userId.toString()).emit("MINUTES_CREDIT", {
    minutes,
    ...extra,
  });
}