const { addToLobby } = require('./AddToLobby');
const { createOrJoinRoom } = require('./CreateOrJoinRoom');
const { handleGameRounds } = require('./HandleGameRounds');
const { deleteGameRoom } = require('./DeleteGameRoom');

module.exports = {
  addToLobby,
  createOrJoinRoom,
  handleGameRounds,
  deleteGameRoom
};