const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const supabase = require("./supabase");
const createMessage = require("./functions/createMessage");

const PORT = process.env.VITE_NJS_PORT || 8080;
const ORIGIN = process.env.VITE_NJS_ORIGIN || "http://localhost:5173";

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [ORIGIN, "http://192.168.0.136:5173"],
    methods: ["GET", "POST"],
  },
});

let connectedUsers = [];

// Logging
function log(event, message) {
  console.log(`[${new Date().toISOString()}] [${event}]: ${message}`);
}

// Light message validation
function isValidMessage(data) {
  return (
    typeof data?.message === "string" && typeof data?.username === "string"
  );
}

// Join chat
function handleJoinChat(socket, connectedUsers) {
  return ({ username }) => {
    if (typeof username !== "string" || username.trim() === "") return;

    socket.broadcast.emit("receive_message", {
      message: `${username} has joined the chat`,
      username: "system",
    });

    socket.emit("receive_message", {
      message: `Welcome ${username}!`,
      username: "system",
    });

    // Update and emit user list
    connectedUsers.push({ id: socket.id, username });
    io.emit("chatroom_users", connectedUsers);

    // Send chat history to the user
    getMessages(socket);
  };
}

// Send message
function handleSendMessage() {
  return (data) => {
    const { message, username, timestamp } = data;

    if (!isValidMessage(data)) {
      log("warn", "Invalid message payload received");
      return;
    }

    io.emit("receive_message", data);
    createMessage(message, username, timestamp);
    log("msg", `${data.username}: ${data.message}`);
  };
}

// Disconnect
function handleDisconnect(socket, connectedUsers) {
  return () => {
    const index = connectedUsers.findIndex((user) => user.id === socket.id);
    if (index !== -1) connectedUsers.splice(index, 1);
    io.emit("chatroom_users", connectedUsers);
  };
}

// Load history
async function getMessages(socket) {
  const { data, error } = await supabase.from("messages").select();

  if (error) {
    console.error(error);
  } else {
    log("db_load", "Chat history load successful");
    data.forEach((msg) => {
      socket.emit("receive_message", msg);
    });
  }
}

io.on("connection", (socket) => {
  log("connect", `User connected: ${socket.id}`);

  socket.on("join_chat", handleJoinChat(socket, connectedUsers));
  socket.on("send_message", handleSendMessage());
  socket.on("disconnect", handleDisconnect(socket, connectedUsers));
});

server.listen(PORT, () => {
  log("startup", `Server is running on port ${PORT}`);
});
