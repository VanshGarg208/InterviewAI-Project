import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Determine socket URL: use VITE_API_URL origin in production, otherwise proxy to same origin
    const RAW_API = (import.meta.env.VITE_API_URL as string) || "";
    // For sockets we need the origin (no /api). If RAW_API is empty we connect to '/'
    const SOCKET_URL = RAW_API ? (RAW_API.endsWith("/") ? RAW_API.slice(0, -1) : RAW_API) : "/";
    const connectOpts = {
      path: "/socket.io",
      withCredentials: true,
      autoConnect: true,
    } as const;

    const newSocket = io(SOCKET_URL, connectOpts);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      // Join a personal room automatically
      newSocket.emit("join_room", user._id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount or user change
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
