const server = require("http").createServer((req, res) => {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  });

  res.end("tô aqui");
});

const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

io.on("connection", (socket) => {
  console.log("connection", socket.id);
  socket.on("join-room", (roomId, userId) => {
    // adiciona os users na mesma sala
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("disconnected", () =>{
      console.log("diconnected!", roomId, userId)
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      });
  });
});

const startServer = () => {
  const { address, port } = server.address()
  console.log(`app running at ${address}:${port}`)
}

server.listen(process.env.PORT || 3000, startServer)