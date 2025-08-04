const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const roomSocketHandlers = require("./sockets/roomHandler");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(`Error occured, ${err}`);
  });

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  roomSocketHandlers(socket, io);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
server.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
});
