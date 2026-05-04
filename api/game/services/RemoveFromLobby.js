/**
 * Removes the client from the lobby, then deletes the lobby room if it becomes
 * empty.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {string} lobbyRoomCode - The lobby room code.
 * 
 * @returns {void} This function does not return any value.
 */
function removeFromLobby(socket, rooms, lobbyRoomCode) {
  if (rooms[lobbyRoomCode]) {
    if (rooms[lobbyRoomCode].clients.has(socket)) {
      rooms[lobbyRoomCode].clients.delete(socket);
    }

    if (rooms[lobbyRoomCode].clients.size === 0) {
      delete rooms[lobbyRoomCode];
    }
  }
}

module.exports = { removeFromLobby };