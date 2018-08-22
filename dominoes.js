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

// Define the board, keeping track of the left most side (of a domino) and the right most side (of a domino).
// When initialised, left and right will be two sides of the same domino piece.
const board = {
    left: null,
    right: null
}

// Game starts with player ones turn. And an empty stack.
let currentPlayerTurn = PLAYER.ONE;
let stack = [];

/**
 * Define a Domino object. This has two sides, with a number at each side.
 * It has no specific orientation: The numbers can be read left-to-right or right-to-left
 *
 * @param {Number} sideA
 * @param {Number} sideB
 */
function Domino(sideA, sideB) {
    this.sideA = { value: sideA, next: null };
    this.sideB = { value: sideB, next: null };

    // Assign the reference to the other side of the tile. Allows us to traverse the domino without knowing the orientation.
    this.sideA.otherSide = this.sideB;
    this.sideB.otherSide = this.sideA;
}
Domino.prototype.leftToRightString = function() {
    return `<${this.sideA.value}:${this.sideB.value}>`
}
Domino.prototype.rightToLeftString = function() {
    return `<${this.sideB.value}:${this.sideA.value}>`
}

/**
 * Starts the automatated game of dominos.
 *
 */
function play() {

    // Reset stack.
    stack = [];

    createShuffledStack();

    // Draw hands
    drawTile(PLAYER.ONE, 7);
    drawTile(PLAYER.TWO, 7);

    // Start board.
    gameSetup();

    // Game continues indefinitely until a player wins or until there is a draw. In either instance, the loop will be broken.
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

/**
 * Creates a stack of dominos, and then shuffles them using the Fisher–Yates shuffle algorithm.
 *
 */
function createShuffledStack() {

    // Create set of dominos
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

/**
 * Setup the initial game board by taking the top tile from the stack and placing it on the board.
 *
 */
function gameSetup() {
    let tile = stack.pop();
    board.left = tile.sideA;
    board.right = tile.sideB;
    console.log(`Game starting with first tile: <${board.left.value}:${board.right.value}>`);
}


/**
 * Draws any number of dominos from the stack into a players hand.
 *
 * @param {String} player PLAYER_ONE or PLAYER_TWO from the PLAYER const
 * @param {Number} number of tiles to draw
 * @returns {Array or Domino} either an array of all tiles drawn (if many) or the sigle tile (if one)
 */
function drawTile(player, number) {
    const tiles = stack.splice(stack.length - number);

    // Add to the players tiles.
    players[player].tiles = [...players[player].tiles, ...tiles];

    // Return either an array of all tiles drawn (if many) or the sigle tile (if one)
    return number === 1 ? tiles[0] : [...tiles];
}

/**
 * Automatically places a tile based on the current board.
 * It can either go to the left or right of the board and can be placed left-to-right or right-to-left.
 *
 * @param {Domino} tile
 * @param {String} player PLAYER_ONE or PLAYER_TWO from the PLAYER const
 */
function placeTile(tile, player) {
    if (tile.sideA.value === board.left.value) { // Place to the left
        board.left.next = tile.sideA;
        tile.sideA.next = board.left;

        displayLeftPlacement(player.name, tile.rightToLeftString());
        
        board.left = tile.sideB; // The opposite side of the domino is now the left most number.
    }
    else if (tile.sideB.value === board.left.value) { // Place to the left, flipped
        board.left.next = tile.sideB;
        tile.sideB.next = board.left;
        
        displayLeftPlacement(player.name, tile.leftToRightString());

        board.left = tile.sideA; // The opposite side of the domino is now the left most number.

    }
    else if (tile.sideA.value === board.right.value) { // Place to the right
        board.right.next = tile.sideA;
        tile.sideA.next = board.right;
        
        displayRightPlacement(player.name, tile.leftToRightString());
        
        board.right = tile.sideB; // The opposite side of the domino is now the right most number.
    }
    else if (tile.sideB.value === board.right.value) { // Place to the right, flipped
        board.right.next = tile.sideB;
        tile.sideB.next = board.right;
        
        displayRightPlacement(player.name, tile.rightToLeftString());

        board.right = tile.sideA; // The opposite side of the domino is now the right most number.
    }
}

/**
 * Calls displayMove with the given player and tile, when the tile is being placed on the right.
 *
 * @param {String} playerName
 * @param {String} dominoString
 */
function displayRightPlacement(playerName, dominoString) {
    displayMove(playerName, dominoString, `<${board.right.otherSide.value}:${board.right.value}>`);
    
}

/**
 * Calls displayMove with the given player and tile, when the tile is being placed on the left.
 *
 * @param {String} playerName
 * @param {String} dominoString
 */
function displayLeftPlacement(playerName, dominoString) {
    displayMove(playerName, dominoString, `<${board.left.value}:${board.left.otherSide.value}>`);
}

/**
 * Displays a players move with the given tile, being placed on the given side.
 *
 * @param {String} playerName
 * @param {String} dominoString
 * @param {String} side
 */
function displayMove(playerName, dominoString, side) {
    console.log(`${playerName} plays ${dominoString} to connect to tile ${side} on the board`);
}

/**
 * Displays the existing board by traversing, left-to-right, the connected tiles.
 *
 */
function displayBoard() {
    console.log(`Board is now: ${traverseAndStringifyTiles(board.left)}`.trim());
}

/**
 * Traverse the tiles starting from the given side of a tile.
 *
 * @param {Object} tileSide
 * @returns {String} A fully traversed board.
 */
function traverseAndStringifyTiles(tileSide) {
    return tileSide ? `<${tileSide.value}:${tileSide.otherSide.value}> ${traverseAndStringifyTiles(tileSide.otherSide.next)}` : '';
}

module.exports = { play };