import { Server } from "socket.io";

const activeUsers = new Map<string, string>();

export function setupSocket(io: Server) {
  io.on("connection", socket => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("join", (userId: string) => {
      if (!userId) return;

      activeUsers.set(userId, socket.id);
      console.log("👤 User joined socket:", userId);
    });

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

/* =====================================
   PUSH EVENTS
===================================== */

export function pushWalletUpdate(
  io: Server,
  userId: string,
  payload: any
) {
  const socketId = activeUsers.get(userId);

  if (!socketId) return;

  io.to(socketId).emit("WALLET_UPDATE", payload);
}

export function pushMinutes(
  io: Server,
  userId: string,
  minutes: number,
  extra: any = {}
) {
  const socketId = activeUsers.get(userId);

  if (!socketId) return;

  io.to(socketId).emit("MINUTES_CREDIT", {
    minutes,
    ...extra,
  });
}