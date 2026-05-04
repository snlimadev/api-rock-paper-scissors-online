const WebSocket = require('ws');
const { checkWinner } = require('./utils');

/**
 * Handles game rounds.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {object} parsedMessage - The parsed JSON message received.
 * 
 * @returns {void} This function does not return any value.
 */
function handleGameRounds(socket, rooms, parsedMessage) {
  const move = parsedMessage.move.toString().trim().toUpperCase();
  const validMoves = ['ROCK', 'PAPER', 'SCISSORS'];

  if (!rooms[socket.roomCode]) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'You must enter a room to make a move.'
      }));
    }

    return;
  }

  if (!validMoves.includes(move)) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'Invalid move.'
      }));
    }

    return;
  }

  if (socket.user === 'PLAYER 1') {
    if (!rooms[socket.roomCode].state.player1Move) {
      rooms[socket.roomCode].state.player1Move = move;
    } else {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          error: 'You have already made your move.'
        }));
      }

      return;
    }
  }

  if (socket.user === 'PLAYER 2') {
    if (!rooms[socket.roomCode].state.player2Move) {
      rooms[socket.roomCode].state.player2Move = move;
    } else {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          error: 'You have already made your move.'
        }));
      }

      return;
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

    // Send a message informing the winner and description for both players
    rooms[socket.roomCode].clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          winner: rooms[socket.roomCode].state.winner,
          description: rooms[socket.roomCode].state.description
        }));
      }
    });

    // Reset game state
    rooms[socket.roomCode].state = {
      player1Move: '',
      player2Move: '',
      winner: '',
      description: ''
    };
  }
}

module.exports = { handleGameRounds };