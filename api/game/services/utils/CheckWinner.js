//#region Function to check winner
// Função para verificar o vencedor
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
//#endregion

module.exports = { checkWinner };