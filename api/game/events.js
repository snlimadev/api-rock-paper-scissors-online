const WebSocket = require('ws');
const gameServices = require('./services');

/**
 * Handles the WebSocket `message` event by calling the corresponding service
 * based on the `action` field in the received message.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {string} lobbyRoomCode - The lobby room code.
 * @param {string} message - The incoming message as a JSON string.
 * 
 * @returns {void} This function does not return any value.
 */
function handleMessage(socket, rooms, lobbyRoomCode, message) {
  try {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.action) {
      case 'create':
      case 'join':
        gameServices.createOrJoinRoom(socket, rooms, parsedMessage, lobbyRoomCode);
        break;

      case 'getRooms':
        gameServices.addToLobby(socket, rooms, lobbyRoomCode);
        break;

      default:
        if (parsedMessage.move) {
          gameServices.handleGameRounds(socket, rooms, parsedMessage);
        } else {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              error: 'Invalid request.'
            }));
          }
        }
        break;
    }
  } catch (error) {
    console.error('Error processing message: ', error);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        error: 'Invalid JSON message received.'
      }));
    }
  }
}

/**
 * Handles the WebSocket `close` event by calling cleanup services.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {string} lobbyRoomCode - The lobby room code.
 * 
 * @returns {void} This function does not return any value.
 */
function handleClose(socket, rooms, lobbyRoomCode) {
  gameServices.removeFromLobby(socket, rooms, lobbyRoomCode);
  gameServices.deleteGameRoom(socket, rooms, lobbyRoomCode);
}

/**
 * Handles the WebSocket `connection` event by setting up event listeners for
 * the `message`, `close`, and `error` events.
 * 
 * @param {object} socket - The WebSocket connection object.
 * @param {object} rooms - An object containing all active rooms on the server.
 * @param {string} lobbyRoomCode - The lobby room code.
 * 
 * @returns {void} This function does not return any value.
 */
function handleConnection(socket, rooms, lobbyRoomCode) {
  socket.on('message', (message) => {
    try {
      handleMessage(socket, rooms, lobbyRoomCode, message);
    } catch (error) {
      console.error('Error handling message event: ', error);
    }
  });

  socket.on('close', () => {
    try {
      handleClose(socket, rooms, lobbyRoomCode);
    } catch (error) {
      console.error('Error handling close event: ', error);
    }
  });

  socket.on('error', console.error);
}

module.exports = { handleConnection };