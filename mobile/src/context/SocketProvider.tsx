import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";

type SocketContextType = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const SocketProvider = ({ children }: any) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const s = await connectSocket();

      if (!s || !mounted) return;

      setSocket(s);

      s.on("connect", () => {
        console.log("🟢 Global socket connected:", s.id);
        setConnected(true);
      });

      s.on("disconnect", () => {
        console.log("🔴 Global socket disconnected");
        setConnected(false);
      });
    };

    init();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);