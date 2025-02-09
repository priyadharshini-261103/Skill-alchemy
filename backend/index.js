const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ CSP Configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  res.setHeader("Content-Security-Policy", 
    "default-src 'self' http://localhost:5000 https://cdnjs.cloudflare.com; " +
    "connect-src 'self' http://localhost:5000 http://localhost:3000; " +
    "font-src 'self' data: https://cdnjs.cloudflare.com;"
  );

  next();
});

app.use(express.json());
app.use(bodyParser.json());

// ✅ Import Routes
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const recommendRoutes = require("./routes/recommend");
const userRoutes = require("./routes/user");

// ✅ Setup API Routes
app.use("/auth", authRoutes);
app.use("/course", courseRoutes);
app.use("/recommend", recommendRoutes);
app.use("/api", userRoutes);
app.use("/api", courseRoutes); // Ensure this route includes the `/dashboard` endpoint

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
