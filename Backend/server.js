require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectToDB = require("./src/config/database.connection");

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

const server = http.createServer(app);

const isDevelopment = ENV === "development";
const allowedOrigins = isDevelopment
  ? ["http://localhost:5173", "http://127.0.0.1:5173"]
  : [process.env.FRONTEND_URL];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(
    `🔌 New active workspace synchronization pipe established: ${socket.id}`,
  );

  socket.on("join-workspace", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(
        `🛡️ User linked securely to safe personal room stream: ${userId}`,
      );
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Workspace pipe disconnected gracefully: ${socket.id}`);
  });
});

connectToDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        `🚀 ExamPulse Engine initialized in [${ENV.toUpperCase()}] Mode`,
      );
      if (isDevelopment) {
        console.log(
          `📡 Local Access Point listening at: http://localhost:${PORT}`,
        );
      }
    });
  })
  .catch((err) => {
    console.error(
      "❌ Critical System Failure: Database integration refused baseline handshake.",
    );
    console.error(err.message);
    process.exit(1);
  });
