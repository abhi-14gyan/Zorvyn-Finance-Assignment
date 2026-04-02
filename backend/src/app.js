require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const helmet = require("helmet");
const { ApiError } = require("./utils/apiError.js");

const app = express();

// Load passport config (Google strategy)
require("./config/passport");

// ── Middlewares ──
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
        : ["http://localhost:3000"];
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());
app.use(helmet());

// ── Route Imports ──
const userRouter = require("./routes/user.routes.js");
const authRouter = require("./routes/auth.routes.js");
const accRouter = require("./routes/account.routes.js");
const dashboardRoutes = require("./routes/dashboard.routes");
const budgetRoutes = require("./routes/budget.routes.js");
const tranRoutes = require("./routes/transaction.routes.js");

// ── Route Declarations ──
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/account", accRouter);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/transaction', tranRoutes);

// ── Health Check ──
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 Catch-All ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (Assignment Requirement #5) ──
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = { app };
