const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:5100" , "https://admin.socket.io"],
      credentials: true
    }
  });

app.use(express.static("public")); // Serve static files from the 'public' folder

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

// Start server
const PORT = process.env.PORT || 5100;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


//setup admin ui
const { instrument } = require("@socket.io/admin-ui");

instrument(io, {
    auth: false,
    mode: "development",

});