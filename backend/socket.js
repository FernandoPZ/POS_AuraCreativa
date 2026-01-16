let io = null;
function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  });
  io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io no inicializado");
  return io;
}

module.exports = { init, getIO };
