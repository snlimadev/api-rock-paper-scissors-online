const WebSocket = require('ws');

/**
 * Sends the list of available rooms to the client.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * 
 * @returns {void} This function does not return any value.
 */
function sendAvailableRooms(socket, rooms) {
  const availableRooms = Object.keys(rooms)
    .filter(
      (roomCode) => rooms[roomCode].isPublic &&
        rooms[roomCode].clients.size < 2
    );

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      rooms: availableRooms
    }));
  }
}

module.exports = { sendAvailableRooms };