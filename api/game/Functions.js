const WebSocket = require('ws');

//#region Local function to send the list of available rooms
// Função local para enviar a lista de salas disponíveis
function sendAvailableRooms(socket, rooms) {
  const availableRooms = Object.keys(rooms)
    .filter(
      (roomCode) => rooms[roomCode].isPublic &&
        rooms[roomCode].clients.size < 2
    )
    .map((roomCode) => ({ roomCode }))
    .map((room) => room.roomCode);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      rooms: availableRooms
    }));
  }
}
//#endregion

//#region Function to add the client to the lobby
// Função para adicionar o cliente ao lobby
function addToLobby(socket, rooms, lobbyRoomCode) {
  if (!rooms[lobbyRoomCode]) {
    rooms[lobbyRoomCode] = {
      clients: new Set(),
      isPublic: false
    };
  }

  if (!rooms[lobbyRoomCode].clients.has(socket)) {
    rooms[lobbyRoomCode].clients.add(socket);
  }

  if (rooms[lobbyRoomCode]) {
    sendAvailableRooms(socket, rooms);
  }
}
//#endregion

//#region Function to handle game room creation and user joining
// Função para lidar com a criação de salas de jogo e entrada de usuários
function createOrJoinRoom(socket, rooms, parsedMessage, lobbyRoomCode) {
  const roomCode = parseInt(parsedMessage.roomCode);
  const user = (parsedMessage.action === 'create') ? 'PLAYER 1' : 'PLAYER 2';
  const isPublic = (parsedMessage.isPublic === 'Y') ? true : false;

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
    if (parsedMessage.action === 'create' && roomCode) {
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
          'Required to inform room code, which must be an integer.'
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

  // Validate and attach room code and user to the socket
  // Valida e vincula o código da sala e o usuário ao socket
  if (roomCode && user) {
    socket.roomCode = roomCode;
    socket.user = user;
  } else {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'Required to inform room code.'
      }));
    }

    return;
  }
  //#endregion

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

//#region Local function to check winner
// Função local para verificar o vencedor
function checkWinner(player1Move, player2Move) {
  let winner = '';
  let description = '';

  if (player1Move === player2Move) {
    winner = 'DRAW';
    description = `Both players chose ${player1Move}`;
  } else if (
    (player1Move === 'ROCK' && player2Move === 'SCISSORS') ||
    (player1Move === 'PAPER' && player2Move === 'ROCK') ||
    (player1Move === 'SCISSORS' && player2Move === 'PAPER')
  ) {
    winner = 'PLAYER 1';
    description = `${player1Move} beats ${player2Move}`;
  } else {
    winner = 'PLAYER 2';
    description = `${player2Move} beats ${player1Move}`;
  }

  return { winner, description };
}
//#endregion

//#region Function to handle game rounds
// Função para lidar com as rodadas do jogo
function handleGameRounds(socket, rooms, parsedMessage) {
  const move = parsedMessage.move.trim().toUpperCase();
  const validMoves = ['ROCK', 'PAPER', 'SCISSORS'];

  if (move) {
    if (!validMoves.includes(move)) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          error: 'Invalid move.'
        }));
      }

      return;
    }

    if (
      socket.user === 'PLAYER 1' &&
      !rooms[socket.roomCode].state.player1Move
    ) {
      rooms[socket.roomCode].state.player1Move = move;
    }

    if (
      socket.user === 'PLAYER 2' &&
      !rooms[socket.roomCode].state.player2Move
    ) {
      rooms[socket.roomCode].state.player2Move = move;
    }
  }

  if (
    rooms[socket.roomCode].state.player1Move &&
    rooms[socket.roomCode].state.player2Move
  ) {
    const result = checkWinner(
      rooms[socket.roomCode].state.player1Move,
      rooms[socket.roomCode].state.player2Move
    );

    rooms[socket.roomCode].state.winner = result.winner;
    rooms[socket.roomCode].state.description = result.description;

    // Send a message informing the winner and description
    // Envia uma mensagem informando o vencedor e a descrição
    rooms[socket.roomCode].clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          winner: rooms[socket.roomCode].state.winner,
          description: rooms[socket.roomCode].state.description
        }));
      }
    });

    // Reset game state
    // Reinicia o estado do jogo
    rooms[socket.roomCode].state = {
      player1Move: '',
      player2Move: '',
      winner: '',
      description: ''
    };
  }
}
//#endregion

//#region Function to delete a game room
// Função para excluir uma sala de jogo
function deleteGameRoom(socket, rooms, lobbyRoomCode) {
  if (rooms[socket.roomCode]) {
    rooms[socket.roomCode].clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          event: 'Opponent left the game.'
        }));
      }
    });

    delete rooms[socket.roomCode];

    if (rooms[lobbyRoomCode]) {
      rooms[lobbyRoomCode].clients.forEach((client) => {
        sendAvailableRooms(client, rooms);
      });
    }
  }
}
//#endregion

module.exports = {
  addToLobby,
  createOrJoinRoom,
  handleGameRounds,
  deleteGameRoom
};