const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const { handleConnection, handlePing } = require('./events');

const rooms = {};
const lobbyRoomCode = 'Lobby';

server.on('connection', (socket) => {
  handleConnection(socket, rooms, lobbyRoomCode);
});

const interval = setInterval(() => {
  server.clients.forEach((socket) => {
    handlePing(socket);
  });
}, 30000);

server.on('close', () => {
  clearInterval(interval);
});

server.on('error', console.error);

server.on('listening', () => {
  console.log(`WebSocket server is running on port ${server.options.port}`);
});