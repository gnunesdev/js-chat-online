const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("messages-container");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// pega o username e a sala baseado nos query params
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // recebe mensagem enviada pelo cliente
  const message = event.target.elements.msg.value;

  // envia mensagem ao servidor
  socket.emit("chatMessage", message);

  // limpa o input de mensagem
  event.target.elements.msg.value = "";
  event.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.getElementById("messages-container").appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}
