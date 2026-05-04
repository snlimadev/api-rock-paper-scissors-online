const WebSocket = require('ws');
const { sendAvailableRooms } = require('./utils');

/**
 * Deletes the game room where the client is in.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {string} lobbyRoomCode - The lobby room code.
 * 
 * @returns {void} This function does not return any value.
 */
function deleteGameRoom(socket, rooms, lobbyRoomCode) {
  let shouldUpdateLobby = false;

  if (rooms[socket.roomCode]) {
    if (
      rooms[socket.roomCode].isPublic &&
      rooms[socket.roomCode].clients.size < 2
    ) {
      shouldUpdateLobby = true;
    }

    rooms[socket.roomCode].clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          event: 'Opponent left the game.'
        }));
      }
    });

    delete rooms[socket.roomCode];

    if (rooms[lobbyRoomCode] && shouldUpdateLobby) {
      rooms[lobbyRoomCode].clients.forEach((client) => {
        sendAvailableRooms(client, rooms);
      });
    }
  }
}

module.exports = { deleteGameRoom };