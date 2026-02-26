import { Server } from "socket.io";

let io: Server | null = null;

export function registerAdminEmitter(socketServer: Server) {
  io = socketServer;
}

export function emitAdminEvent(event: string, payload: any) {
  if (!io) return;

  io.to("admins").emit(event, payload);
}