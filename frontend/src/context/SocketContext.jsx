import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("token");
      const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:2000", {
        auth: { token }
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setSocket(newSocket);
      });

      newSocket.on("userOnline", (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on("userOffline", (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setSocket(null);
      });

      return () => {
        newSocket.close();
        setSocket(null);
        setOnlineUsers(new Set());
      };
    }
  }, [isAuthenticated, user]);

  const value = {
    socket,
    onlineUsers,
    isConnected: !!socket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};