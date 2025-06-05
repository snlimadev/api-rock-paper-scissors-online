const WebSocket = require('ws');
const { sendAvailableRooms } = require('./utils');

//#region Function to delete a game room
// Função para excluir uma sala de jogo
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
//#endregion

module.exports = { deleteGameRoom };