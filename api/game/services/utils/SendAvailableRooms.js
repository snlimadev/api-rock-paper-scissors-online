const WebSocket = require('ws');

//#region Function to send the list of available rooms
// Função para enviar a lista de salas disponíveis
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
//#endregion

module.exports = { sendAvailableRooms };