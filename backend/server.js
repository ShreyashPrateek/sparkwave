import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import authRoutes from "./src/routes/auth.js";
import authMiddleware from "./src/middleware/auth.js";
import connectDB from "./src/config/db.js";
import postRoutes from "./src/routes/post.js";
import profileRoutes from "./src/routes/profile.js";
import chatRoutes from "./src/routes/chat.js";
import Message from "./src/models/Message.js";
import User from "./src/models/User.js";

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173", // For local development
  "https://sparkwave-olive.vercel.app"
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  credentials: true, // required for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Routes
app.use("/api/auth", authRoutes);

// Post Routes
app.use("/api/posts", postRoutes);

// User Profile Routes
app.use("/api/users", profileRoutes);

// Chat Routes
app.use("/api/chat", chatRoutes);


// Test Protected Route
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated!", userId: req.user.id });
});

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Spark Wave API is running!",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    database: "connected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const mongoose = await import("mongoose");
    const dbState = mongoose.default.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };
    
    res.json({
      database: states[dbState],
      dbName: mongoose.default.connection.name,
      host: mongoose.default.connection.host
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to view all users
app.get("/api/test-users", async (req, res) => {
  try {
    const User = (await import("./src/models/User.js")).default;
    const users = await User.find({}).select("-password").limit(10);
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    credentials: true
  }
});

// Socket.io middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) throw new Error("No token provided");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) throw new Error("User not found");
    
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

// Store online users
const onlineUsers = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`👤 User ${socket.user.username} connected`);
  
  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);
  
  // Broadcast user online status
  socket.broadcast.emit("userOnline", socket.userId);
  
  // Join user to their own room
  socket.join(socket.userId);
  
  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    try {
      const { receiverId, text } = data;
      
      // Save message to database
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        text: text.trim()
      });
      
      await message.save();
      
      // Populate sender info
      await message.populate("sender", "username name avatar");
      await message.populate("receiver", "username name avatar");
      
      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
      
      // Send back to sender
      socket.emit("messageSent", message);
      
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });
  
  // Handle typing indicators
  socket.on("typing", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        userId: socket.userId,
        username: socket.user.username
      });
    }
  });
  
  socket.on("stopTyping", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", {
        userId: socket.userId
      });
    }
  });
  
  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`👤 User ${socket.user.username} disconnected`);
    onlineUsers.delete(socket.userId);
    socket.broadcast.emit("userOffline", socket.userId);
  });
});

// Start server
const PORT = process.env.PORT || 2000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 DB Test: http://localhost:${PORT}/api/test-db`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ") || "*"}`);
  console.log(`💬 Socket.io enabled for real-time chat\n`);
});