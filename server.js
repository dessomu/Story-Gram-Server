const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); // NEW
const { Server } = require("socket.io"); // NEW
const connectDB = require("./config/db");

require("./models/user");

const uploadRoute = require("./routes/uploadRoute");
const storyRoute = require("./routes/storyRoute");
const authRoute = require("./routes/authRoute");
const progressRoute = require("./routes/progressRoute");
const commentRoute = require("./routes/commentRoute");
const likeRoute = require("./routes/likeRoute");

dotenv.config();

const app = express();
const server = http.createServer(app); // NEW - wrap express in http server

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "https://nopicstorygram.netlify.app/", // frontend URL (Vite default)
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// assign io instance globally (so routes can access)
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send(`Server Running ✅`));

app.use("/upload", uploadRoute);
app.use("/stories", storyRoute);
app.use("/auth", authRoute);
app.use("/progress", progressRoute);
app.use("/comments", commentRoute);
app.use("/likes", likeRoute);

app.use("/health", (req, res) => {
  res.json({ message: "Server is healthy" });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on  http://localhost:${process.env.PORT}`);
});
