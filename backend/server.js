// ============================================================
// server.js — Express Application Entry Point
// ============================================================
// Bootstraps the entire backend:
//   1. Registers security middleware (helmet, rate limiting, sanitization)
//   2. Registers utility middleware (CORS, cookies, JSON parser)
//   3. Mounts route handlers under /api/*
//   4. Attaches global 404 and error handlers
//   5. Starts the HTTP server on PORT
//   6. Then connects to MongoDB in the background
//
// WHY start the server before DB connects?
//   If we wait for MongoDB before calling app.listen(), any DB
//   hiccup makes the process exit, nodemon restarts it, and the
//   Vite dev-server proxy gets a 502 (Bad Gateway) because nothing
//   is listening on port 4000. Starting the server first keeps the
//   port alive — DB errors surface as clean 500 API responses.

import express from "express";
import { config } from "dotenv";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Load .env variables before anything else
config();

// Route modules
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// ── Security Middleware ──────────────────────────────────────
// helmet sets a suite of secure HTTP headers (X-Frame-Options,
// Content-Security-Policy, X-XSS-Protection, etc.)
app.use(helmet());

// Rate limiter for auth routes — prevents brute-force attacks.
// 15 requests per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP. Please try again after 15 minutes." },
});

// ── CORS ─────────────────────────────────────────────────────
// Allow requests from the React frontend only.
// "credentials: true" is required for the browser to send HTTP-only cookies.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ── Utility Middleware ───────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: "10kb" })); // limit payload size

// ── API Routes ───────────────────────────────────────────────
// Auth routes have a stricter rate limiter applied
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ── Global Error Handler ─────────────────────────────────────
// Must have 4 parameters so Express recognises it as an error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation error", error: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format", error: err.message });
  }

  // MongoDB duplicate key error
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  if (errCode === 11000) {
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "Duplicate entry",
      error: `${field} "${value}" already exists`,
    });
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
  });
});

// ── Server Startup ───────────────────────────────────────────
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ── MongoDB Connection ───────────────────────────────────────
// Connects after the server is already listening.
// If the connection fails we log and keep the server alive.
const connectDB = async () => {
  if (!process.env.DB_URL) {
    console.error("❌ DB_URL is missing from .env — add it and restart the server.");
    return;
  }

  try {
    await connect(process.env.DB_URL);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("   → Check your DB_URL and MongoDB Atlas IP whitelist settings.");
  }
};

connectDB();
