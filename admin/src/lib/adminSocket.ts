import { io } from "socket.io-client";

let socket: any;

export function getAdminSocket() {

  if (socket) return socket;

  socket = io(
    process.env.NEXT_PUBLIC_ADMIN_API_URL!,
    {
      auth: {
        token: localStorage.getItem("adminToken"),
      },
      transports: ["websocket"],
    }
  );

  return socket;

}