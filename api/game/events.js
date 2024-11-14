const WebSocket = require('ws');
const gameServices = require('./services');

function handleMessage(socket, rooms, lobbyRoomCode, message) {
  //#region Handle game room creation, user joining and rounds
  // Lida com a criação de salas de jogo, entrada de usuários e rodadas
  try {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.action) {
      case 'create':
      case 'join':
        gameServices.createOrJoinRoom(socket, rooms, parsedMessage, lobbyRoomCode);
        break;

      case 'getRooms':
        gameServices.addToLobby(socket, rooms, lobbyRoomCode);
        break;

      default:
        if (parsedMessage.move) {
          gameServices.handleGameRounds(socket, rooms, parsedMessage);
        } else {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              error: 'Invalid request.'
            }));
          }
        }
        break;
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
}

function handleClose(socket, rooms, lobbyRoomCode) {
  gameServices.removeFromLobby(socket, rooms, lobbyRoomCode);
  gameServices.deleteGameRoom(socket, rooms, lobbyRoomCode);
}

function handleConnection(socket, rooms, lobbyRoomCode) {
  socket.on('message', (message) => {
    try {
      handleMessage(socket, rooms, lobbyRoomCode, message);
    } catch (error) {
      console.error('Error handling message event: ', error);
    }
  });

  socket.on('close', () => {
    try {
      handleClose(socket, rooms, lobbyRoomCode);
    } catch (error) {
      console.error('Error handling close event: ', error);
    }
  });

  socket.on('error', console.error);
}

module.exports = { handleConnection };