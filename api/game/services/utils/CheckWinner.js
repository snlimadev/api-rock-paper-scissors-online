/**
 * Checks the winner.
 * 
 * @param {string} player1Move - `ROCK`, `PAPER`, or `SCISSORS`.
 * @param {string} player2Move - `ROCK`, `PAPER`, or `SCISSORS`.
 * 
 * @returns {object} Returns an object containing the properties `winner`
 * (`DRAW`, `PLAYER 1`, or `PLAYER 2`) and `description` (string).
 */
function checkWinner(player1Move, player2Move) {
  let winner = '';
  let description = '';

  if (player1Move === player2Move) {
    winner = 'DRAW';
    description = `Both players chose ${player1Move}`;
  } else if (
    (player1Move === 'ROCK' && player2Move === 'SCISSORS') ||
    (player1Move === 'PAPER' && player2Move === 'ROCK') ||
    (player1Move === 'SCISSORS' && player2Move === 'PAPER')
  ) {
    winner = 'PLAYER 1';
    description = `${player1Move} beats ${player2Move}`;
  } else {
    winner = 'PLAYER 2';
    description = `${player2Move} beats ${player1Move}`;
  }

  return { winner, description };
}

module.exports = { checkWinner };