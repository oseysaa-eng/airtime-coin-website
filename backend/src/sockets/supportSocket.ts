import { Server } from "socket.io";

const activeUsers = new Map<string, string>();

/* ======================================================
   SOCKET SETUP
====================================================== */

export function setupSupportSocket(io: Server) {
  io.on("connection", socket => {
    console.log("🔌 Socket connected", socket.id);

    socket.on("join", (userId: string) => {
      if (!userId) return;
      activeUsers.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
      for (const [uid, sid] of activeUsers.entries()) {
        if (sid === socket.id) activeUsers.delete(uid);
      }
    });
  });
}

/* ======================================================
   REAL-TIME WALLET SYNC
====================================================== */

export function pushWalletUpdate(
  io: Server,
  userId: string,
  wallet: {
    balance: number;
    atc: number;
    minutes: number;
  }
) {
  const sid = activeUsers.get(userId);
  if (!sid) return;

  io.to(sid).emit("WALLET_UPDATE", wallet);
}