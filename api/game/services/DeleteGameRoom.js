const WebSocket = require('ws');
const { sendAvailableRooms } = require('./utils');

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

module.exports = { deleteGameRoom };