const WebSocket = require('ws');
const { sendAvailableRooms } = require('./utils');

//#region Function to handle game room creation and user joining
// Função para lidar com a criação de salas de jogo e entrada de usuários
function createOrJoinRoom(socket, rooms, parsedMessage, lobbyRoomCode) {
  const roomCode = parseInt(parsedMessage.roomCode);
  const user = (parsedMessage.action === 'create') ? 'PLAYER 1' : 'PLAYER 2';
  const isPublic = (parsedMessage.isPublic === 'Y') ? true : false;

  //#region Check if the client is already in a room
  // Verifica se o cliente já está em uma sala
  if (socket.roomCode) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'You are already in a room.'
      }));
    }

    return;
  }
  //#endregion

  //#region Handle room creation
  // Lida com a criação de salas
  if (rooms[roomCode]) {
    //#region Prevent duplicate room codes
    // Impede duplicidade de códigos de sala
    if (parsedMessage.action === 'create') {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          error: 'Room already exists. Please try using a different room code.'
        }));
      }

      return;
    }
    //#endregion
  } else {
    //#region Create a new room or prevent user joining an inexistent one
    // Cria uma nova sala ou impede que o usuário entre em uma que não existe
    if (parsedMessage.action === 'create' && roomCode > 0) {
      rooms[roomCode] = {
        clients: new Set(),
        isPublic: isPublic,
        state: {
          player1Move: '',
          player2Move: '',
          winner: '',
          description: ''
        }
      };
    } else if (parsedMessage.action === 'join') {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          error: 'Room does not exist.'
        }));
      }

      return;
    }
    //#endregion
  }
  //#endregion

  //#region Validations / Validações
  // Check if the room still doesn't exist after a create attempt
  // Verifica se a sala ainda não existe após tentar criá-la
  if (!rooms[roomCode]) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'Failed to create room. ' +
          'Required to inform room code, which must be a positive integer.'
      }));
    }

    return;
  }

  // Check if the room is full
  // Verifica se a sala está lotada
  if (rooms[roomCode].clients.size >= 2) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'Room is full.'
      }));
    }

    return;
  }

  // Attach room code and user to the socket
  // Vincula o código da sala e o usuário ao socket
  socket.roomCode = roomCode;
  socket.user = user;

  // Add user to the room
  // Adiciona o usuário à sala
  rooms[roomCode].clients.add(socket);

  // Update available rooms list
  // Atualiza a lista de salas disponíveis
  if (rooms[lobbyRoomCode]) {
    rooms[lobbyRoomCode].clients.forEach((client) => {
      sendAvailableRooms(client, rooms);
    });
  }

  // Send a message about game starting
  // Envia uma mensagem avisando que o jogo começou
  if (rooms[roomCode].clients.size === 2) {
    rooms[socket.roomCode].clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          event: 'Opponent joined the game.'
        }));
      }
    });
  }
}
//#endregion

module.exports = { createOrJoinRoom };