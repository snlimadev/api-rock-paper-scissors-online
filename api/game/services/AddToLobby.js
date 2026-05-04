const { sendAvailableRooms } = require('./utils');

/**
 * Creates the lobby room if it does not exist, then adds the client to the lobby.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {string} lobbyRoomCode - The lobby room code.
 * 
 * @returns {void} This function does not return any value.
 */
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

module.exports = { addToLobby };