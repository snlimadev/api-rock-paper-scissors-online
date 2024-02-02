const { sendAvailableRooms } = require('./utils');

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

module.exports = { addToLobby };