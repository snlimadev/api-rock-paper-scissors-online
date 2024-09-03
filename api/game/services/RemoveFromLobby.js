//#region Function to remove the user from the lobby
// Função para remover o usuário do lobby
function removeFromLobby(socket, rooms, lobbyRoomCode) {
  if (rooms[lobbyRoomCode]) {
    if (rooms[lobbyRoomCode].clients.has(socket)) {
      rooms[lobbyRoomCode].clients.delete(socket);
    }

    // Delete the lobby room if it's empty
    // Exclui a sala de lobby se estiver vazia
    if (rooms[lobbyRoomCode].clients.size === 0) {
      delete rooms[lobbyRoomCode];
    }
  }
}
//#endregion

module.exports = { removeFromLobby };