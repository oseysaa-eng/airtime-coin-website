import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const activeUsers = new Map<string, string>();

let ioInstance: Server | null = null;

/* ============================================
   MAIN SOCKET SETUP
============================================ */
export function setupSocket(io: Server) {

  ioInstance = io;

  io.on("connection", (socket) => {

    console.log("🟢 Socket connected:", socket.id);

    const token = socket.handshake.auth?.token;

    /* ================= ADMIN CONNECTION ================= */

    if (token) {
      try {

        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET!
        );

        if (decoded.role === "admin") {

          socket.join("admins");

          console.log("👑 Admin connected:", decoded.email);

        }

      } catch (err) {
        console.log("Invalid admin token");
      }
    }

    /* ================= USER JOIN ================= */

    socket.on("join", (userId: string) => {

      if (!userId) return;

      activeUsers.set(userId, socket.id);

      console.log("👤 User joined:", userId);

    });

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

  ioInstance.to(socketId).emit(
    "WALLET_UPDATE",
    payload
  );

}

export function pushMinutes(
  userId: string,
  minutes: number,
  extra: any = {}
) {

  if (!ioInstance) return;

  const socketId = activeUsers.get(userId);

  if (!socketId) return;

  ioInstance.to(socketId).emit(
    "MINUTES_CREDIT",
    {
      minutes,
      ...extra,
    }
  );

}