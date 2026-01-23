let io = null;
function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://20.168.11.169:3001/",
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
