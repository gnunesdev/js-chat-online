const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Define página estática a ser ouvida pelo servidor
app.use(express.static(path.join(__dirname, "public")));

const botName = "Admin";

// Evento disparado quando o cliente se conecta
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // mensagens de boas vindas
    socket.emit("message", formatMessage(botName, "Bem vindo ao chat online!"));

    // avisa todos quando um usuário entra no chat
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} entrou no chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // ouvindo mensagens no chat
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  // avisa que um usuário saiu do chat
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} saiu do chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//Define a porta que o servidor irá rodar
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`servidor iniciado na porta ${PORT}`));
