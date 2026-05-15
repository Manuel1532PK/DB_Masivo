const express = require("express");
const analyticsRoutes = require("./routes/analyticsRoutes");
const path = require("path");
require("dotenv").config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});

// Prefijo de la API y montaje de las rutas
app.use("/api/analytics", analyticsRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Spotify Analytics Dashboard API",
    endpoints: {
      health: "/api/health",
      genres: "/api/analytics/genres",
      artists: "/api/analytics/artists",
      stats: "/api/analytics/stats",
      songs: "/api/analytics/songs",
    },
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

// Fixed - Not Found
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    error: {
      message: error.message || "Internal Server Error",
    },
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET http://localhost:${PORT}/api/analytics/genres`);
  console.log(`   GET http://localhost:${PORT}/api/analytics/artists`);
  console.log(`   GET http://localhost:${PORT}/api/analytics/stats`);
  console.log(`   GET http://localhost:${PORT}/api/analytics/songs`);
});
