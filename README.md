<h2>English</h2>

This WebSocket server for a rock paper scissors online game was developed using Node.js and the ws library.

Besides game functionality, it features a lobby system, where users can create and join public and private rooms.

<h4>JSON Parameters</h4>

&middot; action: Specify 'create' to create a new room, 'join' to enter an existing room or 'getRooms' to obtain a list of available public rooms.
<br/>
&middot; roomCode: Unique code for the game room. Must be a positive integer.
<br/>
&middot; isPublic: Specify 'Y' to make the room visible in the lobby, or 'N' to make the room private.
<br/>
&middot; move: The player move can be 'ROCK', 'PAPER' or 'SCISSORS'.

<h4>JSON Response</h4>

&middot; winner: The player who won the round. It should be 'PLAYER 1', 'PLAYER 2' or 'DRAW'.
<br/>
&middot; description: The reason why the winner was 'PLAYER 1', 'PLAYER 2' or 'DRAW'.
<br/>
&middot; event: Alert when a player joins/leaves the room. The possible values are 'Opponent joined the game.' and 'Opponent left the game.'
<br/>
&middot; error: The error message if it occurs.

<h4>WebSocket Connection URL</h4>

wss://api-rock-paper-scissors-online.glitch.me

<h2>Português</h2>

Este servidor via WebSocket para um jogo online de pedra papel tesoura foi desenvolvido com Node.js e a biblioteca ws.

Além das funcionalidades de jogo, ele conta com um sistema de lobby, onde os usuários podem criar e entrar em salas públicas e privadas.

<h4>Parâmetros no Formato JSON</h4>

&middot; action: Especifique 'create' para criar uma nova sala, 'join' para entrar em uma sala existente ou 'getRooms' para obter uma lista de salas públicas disponíveis.
<br/>
&middot; roomCode: Código único da sala de jogo. Deve ser um número inteiro positivo.
<br/>
&middot; isPublic: Especifique 'Y' para tornar a sala visível no lobby, ou 'N' para torná-la privada.
<br/>
&middot; move: A jogada escolhida pelo jogador pode ser 'ROCK', 'PAPER' ou 'SCISSORS'.

<h4>Resposta no Formato JSON</h4>

&middot; winner: O jogador que venceu a rodada. Deve ser 'PLAYER 1', 'PLAYER 2' ou 'DRAW'.
<br/>
&middot; description: A razão pela qual o vencedor foi 'PLAYER 1', 'PLAYER 2' ou 'DRAW'.
<br/>
&middot; event: Alerta quando um jogador entra/sai da sala. Os valores possíveis são 'Opponent joined the game.' e 'Opponent left the game.'
<br/>
&middot; error: A mensagem de erro, se ocorrer.

<h4>URL de Conexão WebSocket</h4>

wss://api-rock-paper-scissors-online.glitch.me