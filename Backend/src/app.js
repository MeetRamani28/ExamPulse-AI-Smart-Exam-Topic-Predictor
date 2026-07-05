const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const userRoutes = require("./routes/user.routes");
const blueprintRoutes = require("./routes/blueprint.routes");

const isDevelopment = process.env.NODE_ENV === "development";

// ==========================================
// 🌐 Dynamic CORS Configuration
// ==========================================
const allowedOrigins = isDevelopment
  ? ["http://localhost:5173", "http://127.0.0.1:5173"]
  : [process.env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin && isDevelopment) return callback(null, true);

      if (allowedOrigins.includes(origin) || (isDevelopment && !origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==========================================
// 🚀 Application Core Routing Registration
// ==========================================
app.use("/api/users", userRoutes);
app.use("/api/blueprints", blueprintRoutes); 

app.get("/", (req, res) => {
  res.send("ExamPulse AI Backend is up and running! ✨");
});

app.use((err, req, res, next) => {
  console.error(`❌ Error Cache: ${err.message}`);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: isDevelopment ? err.stack : undefined,
  });
});

module.exports = app;