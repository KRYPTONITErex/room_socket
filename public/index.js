const socket = io("/chat");  // Connect to /chat namespace
const adminSocket = io("/admin"); // Connect to /admin namespace

const nameInput = document.getElementById("name-input");
const roomSelect = document.getElementById("room-select");
const joinRoomBtn = document.getElementById("join-room");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const adminMessageBtn = document.getElementById("admin-message");
const adminInput = document.getElementById("admin-input");

let currentRoom = "general";

joinRoomBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Please enter your name.");
        return;
    }
    const room = roomSelect.value;
    
    socket.emit("join-room", { name, room });
    currentRoom = room;
});

socket.on("chat-message", (data) => {
    const li = document.createElement("li");
    li.textContent = `${data.name}: ${data.message}`;
    messages.appendChild(li);
});

// Send message
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (!message) return;
    
    socket.emit("message", { room: currentRoom, message });
    messageInput.value = "";
});

// Admin section
adminMessageBtn.addEventListener("click", () => {
    adminSocket.emit("adminMessage", adminInput.value);
    adminInput.value = "";
});

adminSocket.on("adminMessage", (msg) => {
    console.log("Admin says:", msg);
});