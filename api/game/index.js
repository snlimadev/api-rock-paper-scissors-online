const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const lobbyRoomCode = 'Lobby';
const rooms = {};

const gameFunctions = require('./services');

server.on('connection', (socket) => {
  socket.on('message', (message) => {
    //#region Handle game room creation, user joining and rounds
    // Lida com a criação de salas de jogo, entrada de usuários e rodadas
    try {
      const parsedMessage = JSON.parse(message);

      if (!parsedMessage.action && !parsedMessage.move) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            error: 'No valid parameters received.'
          }));
        }

        return;
      }

      if (
        parsedMessage.action === 'create' ||
        parsedMessage.action === 'join'
      ) {
        gameFunctions.createOrJoinRoom(
          socket, rooms, parsedMessage, lobbyRoomCode
        );
      } else if (parsedMessage.action === 'getRooms') {
        gameFunctions.addToLobby(
          socket, rooms, lobbyRoomCode
        );
      } else {
        gameFunctions.handleGameRounds(
          socket, rooms, parsedMessage
        );
      }
    } catch (error) {
      console.error('Error processing message: ', error);

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          error: 'Invalid JSON message received.'
        }));
      }
    }
    //#endregion
  });

  socket.on('close', () => {
    //#region Handle client disconnection
    // Lida com desconexões do cliente
    if (rooms[lobbyRoomCode]) {
      if (rooms[lobbyRoomCode].clients.has(socket)) {
        rooms[lobbyRoomCode].clients.delete(socket);
      }

      if (rooms[lobbyRoomCode].clients.size === 0) {
        delete rooms[lobbyRoomCode];
      }
    }

    gameFunctions.deleteGameRoom(
      socket, rooms, lobbyRoomCode
    );
    //#endregion
  });
});

server.on('listening', () => {
  console.log(
    `WebSocket server is running on port ${server.options.port}`
  );
});