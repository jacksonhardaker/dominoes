const PLAYER = {
    ONE: 'PLAYER_ONE',
    TWO: 'PLAYER_TWO'
};
const players = {
    [PLAYER.ONE]: {
        name: 'Jackson',
        tiles: []
    },
    [PLAYER.TWO]: {
        name: 'Syberen',
        tiles: []
    }
};
const board = {
    left: null,
    right: null
}

let currentPlayerTurn = PLAYER.ONE;
let stack = [];

function Domino(sideA, sideB) {
    this.sideA = { value: sideA, next: null };
    this.sideB = { value: sideB, next: null };

    // Assign the reference to the other side of the tile.
    this.sideA.otherSide = this.sideB;
    this.sideB.otherSide = this.sideA;
}

function play() {
    stack = [];
    createShuffledStack();

    // Draw hands
    drawTile(PLAYER.ONE, 7);
    drawTile(PLAYER.TWO, 7);

    // Start board.
    gameSetup();

    while (true) {

        let currentPlayer = players[currentPlayerTurn];

        // Get the index of a matching tile
        let index = currentPlayer.tiles.findIndex(tile => {
            return tile.sideA.value === board.left.value ||
                tile.sideA.value === board.right.value ||
                tile.sideB.value === board.left.value ||
                tile.sideB.value === board.right.value
        });

        // Found a valid tile?
        if (index >= 0) {
            // Place tile and remove from players hand.
            placeTile(currentPlayer.tiles.splice(index, 1)[0], currentPlayer);
            displayBoard();

            if (currentPlayer.tiles.length === 0) {

                // GAME OVER this player wins
                console.log(`Player ${currentPlayer.name} has won!`);
                break;
            }
        }
        else {
            let tile = drawTile(currentPlayerTurn, 1);
            console.log(`${currentPlayer.name} can't play, drawing tile <${tile.sideA.value}:${tile.sideB.value}>`)

            if (stack.length === 0) {
                // GAME OVER the game is a draw
                console.log('The game was a draw!');
                break;
            }
        }

        // Move to the next turn
        currentPlayerTurn = currentPlayerTurn === PLAYER.ONE ? PLAYER.TWO : PLAYER.ONE;
    }
}

function createShuffledStack() {
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            stack.push(new Domino(i, j));
        }
    }

    // shuffle stack
    for (let i = stack.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [stack[i], stack[j]] = [stack[j], stack[i]];
    }
}

function gameSetup() {
    let tile = stack.pop();
    board.left = tile.sideA;
    board.right = tile.sideB;
    console.log(`Game starting with first tile: <${board.left.value}:${board.right.value}>`);
}

function drawTile(player, number) {
    const tiles = [];

    for (let i = 1; i <= number; i++) {
        tiles.push(stack.pop());
    }

    players[player].tiles = [...players[player].tiles, ...tiles];

    return number === 1 ? tiles[0] : [...tiles];
}

function placeTile(tile, player) {
    if (tile.sideA.value === board.left.value) { // Place to the left
        board.left.next = tile.sideA;
        tile.sideA.next = board.left;
        console.log(`${player.name} plays <${tile.sideB.value}:${tile.sideA.value}> to connect to tile <${board.left.value}:${board.left.otherSide.value}> on the board`);
        board.left = tile.sideB;
    }
    else if (tile.sideB.value === board.left.value) { // Place to the left, flipped
        board.left.next = tile.sideB;
        tile.sideB.next = board.left;
        console.log(`${player.name} plays <${tile.sideA.value}:${tile.sideB.value}> to connect to tile <${board.left.value}:${board.left.otherSide.value}> on the board`);
        board.left = tile.sideA;

    }
    else if (tile.sideA.value === board.right.value) { // Place to the right
        board.right.next = tile.sideA;
        tile.sideA.next = board.right;
        console.log(`${player.name} plays <${tile.sideA.value}:${tile.sideB.value}> to connect to tile <${board.right.otherSide.value}:${board.right.value}> on the board`);
        board.right = tile.sideB;
    }
    else if (tile.sideB.value === board.right.value) { // Place to the right, flipped
        board.right.next = tile.sideB;
        tile.sideB.next = board.right;
        console.log(`${player.name} plays <${tile.sideB.value}:${tile.sideA.value}> to connect to tile <${board.right.otherSide.value}:${board.right.value}> on the board`);
        board.right = tile.sideA;
    }
}

function displayBoard() {
    console.log(`Board is now: ${traverseAndStringifyTiles(board.left)}`.trim());
}

function traverseAndStringifyTiles(tileSide) {
    return tileSide ? `<${tileSide.value}:${tileSide.otherSide.value}> ${traverseAndStringifyTiles(tileSide.otherSide.next)}` : '';
}

module.exports = { play };