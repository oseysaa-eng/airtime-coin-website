import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(serverUrl = "http://192.168.1.217:5000") {
  if (socket) return socket;
  socket = io(serverUrl, { transports: ["websocket"] });
  return socket;
}

export function joinUserRoom(userId: string) {
  if (!socket) connectSocket();
  socket?.emit("join", userId);
}

export function onMinutesCredit(cb: (payload: any) => void) {
  if (!socket) connectSocket();
  socket?.on("MINUTES_CREDIT", cb);
}

export function offMinutesCredit(cb?: any) {
  socket?.off("MINUTES_CREDIT", cb);
}
