const WebSocket = require('ws');
const { sendAvailableRooms } = require('./utils');

/**
 * Handles game room creation and user joining.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {object} parsedMessage - The parsed JSON message received.
 * @param {string} lobbyRoomCode - The lobby room code.
 * 
 * @returns {void} This function does not return any value.
 */
function createOrJoinRoom(socket, rooms, parsedMessage, lobbyRoomCode) {
  const roomCode = parseInt(parsedMessage.roomCode);
  const user = (parsedMessage.action === 'create') ? 'PLAYER 1' : 'PLAYER 2';
  const isPublic = (parsedMessage.isPublic === 'Y') ? true : false;

  if (socket.roomCode) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'You are already in a room.'
      }));
    }

    return;
  }

  if (rooms[roomCode]) {
    if (parsedMessage.action === 'create') {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          error: 'Room already exists. Please try using a different room code.'
        }));
      }

      return;
    }
  } else {
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
  }

  if (!rooms[roomCode]) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'Failed to create room. ' +
          'Required to inform room code, which must be a positive integer.'
      }));
    }

    return;
  }

  if (rooms[roomCode].clients.size >= 2) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'Room is full.'
      }));
    }

    return;
  }

  socket.roomCode = roomCode;
  socket.user = user;

  rooms[roomCode].clients.add(socket);

  // Update the available rooms list
  if (rooms[lobbyRoomCode] && rooms[roomCode].isPublic) {
    rooms[lobbyRoomCode].clients.forEach((client) => {
      sendAvailableRooms(client, rooms);
    });
  }

  // Send a message informing that the game has started for both players
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

module.exports = { createOrJoinRoom };