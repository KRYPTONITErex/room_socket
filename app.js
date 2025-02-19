const socket = require("socket.io");

const express = require("express");
const app = express();

app.use(express.static("public"));

const server = app.listen(5100, () => {
    console.log("Server running on localhost:5100");
});

const io = socket(server, {
    cors: {
      origin: ["http://localhost:5100" , "https://admin.socket.io"],
      credentials: true
    }
  });

// Chat namespace
const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
    console.log("New user connected to /chat:", socket.id);

    socket.on("join-room", ({ name, room }) => {
        socket.join(room);
        socket.name = name;
        console.log(`${name} joined room: ${room}`);
        chatNamespace.to(room).emit("chat-message", { name: "Server", message: `${name} joined ${room} room.` });
    });

    socket.on("message", ({ room, message }) => {
        const userName = socket.name;
        chatNamespace.to(room).emit("chat-message", { name: userName, message });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Admin namespace
const adminNamespace = io.of("/adminUsers");

adminNamespace.on("connection", (socket) => {
    console.log("Admin connected:", socket.id);

    socket.on("adminMessage", (msg) => {
        console.log("Admin says:", msg);
        adminNamespace.emit("adminMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("Admin disconnected:", socket.id);
    });
});


//setup admin ui
const { instrument } = require("@socket.io/admin-ui");

instrument(io, {
    auth: false,
    mode: "development",
});