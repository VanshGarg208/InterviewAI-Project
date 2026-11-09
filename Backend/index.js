import "./config/env.js"; // Load environment variables first

import express from "express";
import mongoose from "mongoose";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";
import errorHandler from "./middlewares/error.js";

const app = express();
const server = http.createServer(app);

// CORS configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "https://interviewai-backend-project-1.onrender.com";
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, origin);
      }
    },
    credentials: true,
  },
});

app.set("io", io);

// Socket.io JWT authentication & room authorization
io.use((socket, next) => {
  try {
    let token = socket.handshake.auth?.token;
    if (!token && socket.handshake.headers?.cookie) {
      const cookieStr = socket.handshake.headers.cookie;
      const match = cookieStr.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
      } catch (err) {
        // Invalid or expired token; socket remains unauthenticated
      }
    }
    next();
  } catch (err) {
    next();
  }
});

io.on("connection", (socket) => {
  console.log("New socket client connected:", socket.id, socket.userId ? `(User: ${socket.userId})` : "(Guest)");

  socket.on("join_room", (targetUserId) => {
    // Only allow joining own user room if authenticated
    if (socket.userId && socket.userId.toString() === targetUserId?.toString()) {
      socket.join(socket.userId);
      console.log(`User ${socket.userId} joined their personal room`);
      socket.emit("room_joined", { room: socket.userId, success: true });
    } else {
      console.warn(`Unauthorized join_room attempt for ${targetUserId} by socket ${socket.id}`);
      socket.emit("error", { message: "Unauthorized: cannot join room for another user." });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket client disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Root welcome route
app.get("/", (req, res) => {
  res.json({
    name: "InterviewAI API",
    version: "1.0.0",
    status: "running",
    healthCheck: "/api/health"
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

// Health check endpoint — reports actual DB connectivity state
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;
  const stateNames = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  const statusCode = isConnected ? 200 : 503;
  res.status(statusCode).json({
    status: isConnected ? "ok" : "degraded",
    ready: isConnected,
    message: isConnected
      ? "InterviewAI Backend API is fully operational"
      : "InterviewAI API is running but database is not connected",
    db: stateNames[dbState] || "unknown",
    dbReadyState: dbState,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 6000;

// Connect to MongoDB and start the HTTP server
connectDb().finally(() => {
  server.listen(PORT, () => {
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   MongoDB: ${isConnected ? "✅ Connected" : "⚠️  Database disconnected (routes will return 503 gracefully)"}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
  });
});
