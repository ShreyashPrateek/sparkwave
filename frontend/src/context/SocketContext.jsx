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
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found for socket connection");
        return;
      }
      
      const serverUrl = "http://localhost:2000";
      
      console.log("🔌 Connecting to:", serverUrl);
      console.log("Token:", token.substring(0, 20) + "...");
      
      const newSocket = io(serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to chat server");
        setSocket(newSocket);
        setConnectionStatus('connected');
      });
      
      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setConnectionStatus('error');
        setSocket(null);
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

      newSocket.on("newNotification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from server:", reason);
        setSocket(null);
        setConnectionStatus('disconnected');
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
    notifications,
    setNotifications,
    isConnected: !!socket && connectionStatus === 'connected',
    connectionStatus
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};