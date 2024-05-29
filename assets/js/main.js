AOS.init();

// Toggle mode btn variable
var button = document.getElementById("btn");
var singlePlayerBtn = document.getElementById("singleplayer");
var multiPlayerBtn = document.getElementById("multiplayer");


// Player variables
var player_1 = document.getElementById('pl_x');
var player_2 = document.getElementById('pl_o');


// Score variables
var score_p1_display = document.getElementById('point_x');
var score_p2_display = document.getElementById('point_o');

var score_p1 = 0;
var score_p2 = 0;


// Toggle turn variables
var bg_turn_togg = document.getElementById('turn_togg');
var player_x_togg = document.getElementById('turn_x');
var player_o_togg = document.getElementById('turn_o');


// Audio Variables
var win_1_audio = document.getElementById('win_1_audio');
var win_2_audio = document.getElementById('win_2_audio');
var loose_audio = document.getElementById('loose_audio');
var draw_audio = document.getElementById('draw_audio');
var click_1_audio = document.getElementById('click_1_audio');      // Clicks by X
var click_2_audio = document.getElementById('click_2_audio');      // Clicks by O
var new_game_audio = document.getElementById('new_game_audio');


// Gif Variables
var win_x_gif = document.getElementById('win_p1');
var win_o_gif = document.getElementById('win_p2');
var draw_gif = document.getElementById('draw');
var loose_gif = document.getElementById('loose');
var gif = ['win_p1','win_p2','draw','loose'];
var gif_index = null;


// Changes on toggle

function singlePlayer() {
    button.style.left = "140px";
    toggleButtonColor(singlePlayerBtn);
    toggleButtonColor(multiPlayerBtn);

    player_1.innerHTML = 'Player 1 ( X ) :';
    player_2.innerHTML = 'Computer ( O ) :';

    score_p1_display = '--';
    score_p2_display = '--';
}

function multiPlayer() {
    button.style.left = "0px";
    toggleButtonColor(singlePlayerBtn);
    toggleButtonColor(multiPlayerBtn);

    player_1.innerHTML = 'Player 1 ( X ) :';
    player_2.innerHTML = 'Player 2 ( O ) :';

    score_p1_display = '--';
    score_p2_display = '--';
}

function toggleButtonColor(button) {
    // Toggle button color between white and black
    if (button.style.color === "white") { button.style.color = "black"; }
    else { button.style.color = "white"; }
}



// Confetti of the winning player

function Confetti(ply) {
    var duration = 4 * 1000;
    var color;
    var scalar = 1.5;

    if (ply === 'x') {
        color = ['#00ffff', '#9400d3', '#0c03ad', '#ffffff'];
    } else {
        color = ['#7ff000s', '#011f14', '#ffffff', '#ffff00'];
    }

    var animationEnd = Date.now() + duration;

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);

        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, scalar: scalar, particleCount: particleCount, colors: color };

        confetti({
            ...defaults,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });

        confetti({
            ...defaults,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}









const X_class = 'x';
const O_class = 'circle';

let o_turn=false;

const cubeElements = document.querySelectorAll('.cube');
const matrix_hover = document.getElementById('matrix');
var result = document.getElementById('winner');
let gameOverFlag = false;                       // Initialize the game over flag
var game_mode = 1;


// Winning conditions
let win_conditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];


// single Player mode against Computer using MiniMax Algorithm

// first contains numbers representing cell (0-8) on completing a turn no. is replaced by X/O based on the human / AI choice
var og_board;

startGame(o_turn);

function startGame(initialTurn) {
    o_turn = initialTurn;

    og_board = Array.from(Array(9).keys());     // Initialize board with numbers

    cubeElements.forEach(cell => {
        cell.classList.remove(X_class);
        cell.classList.remove(O_class);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });

    set_newHover(o_turn);
    updateTurnIndicator(o_turn);

    // Reset the displayed result
    result.style.color = '#a6a6a6';
    result.innerHTML = 'Result : --';
}


function updateTurnIndicator(currentTurn) {
    if (currentTurn) {
        bg_turn_togg.style.left = "75px";
        player_o_togg.style.color = "black";
        player_x_togg.style.color = "white";
        bg_turn_togg.style.backgroundColor = "chartreuse";
    } else {
        bg_turn_togg.style.left = "0px";
        player_x_togg.style.color = "black";
        player_o_togg.style.color = "white";
        bg_turn_togg.style.backgroundColor = "aqua";
    }
}

function handleClick(clicked) {
    if (gameOverFlag) return; // Do nothing if the game is over

    if(game_mode==1)
    {
        const cube = clicked.target;
        const currentClass = o_turn ? O_class : X_class; // Mark is O_class when o_turn is true and vice versa
        o_turn ? click_2_audio.play() :  click_1_audio.play();

        // Place Mark
        placeMark(cube, currentClass);

        // Check winner
        const winningCombination = check_winner(currentClass);
        if (winningCombination) {
            gameOver(false, winningCombination);
        } else if (is_a_draw()) {
            gameOver(true);
        } else {
            // Swap Player Turns and call set_newHover() to indicate next player turn
            swapTurns();
            set_newHover(o_turn);
            updateTurnIndicator(o_turn);
        }
    }
    else
    {
        if(typeof og_board[clicked.target.id] == 'number')  // cube is not clicked yet
        {
            humanTurn(clicked.target.id,X_class);       // Human player Turn
            if(!checkDraw()) turn(bestSpot(),O_class)   // Ai player Turn
        }
    }
}




function swapTurns() {
    o_turn = !o_turn;
}

function set_newHover(currentTurn) {
    matrix_hover.classList.remove(X_class);
    matrix_hover.classList.remove(O_class);

    if (!currentTurn) {
        matrix_hover.classList.add(X_class);
    } else {
        matrix_hover.classList.add(O_class);
    }
}

// New Match in same Game mode
function newGame() {
    gameOverFlag = false; // Reset the game over flag
    new_game_audio.play();
    document.getElementById(`${gif[gif_index]}`).style.width = '0px';

    for (let condition of win_conditions) {
        condition.forEach(index => {
            cubeElements[index].style.boxShadow = '0 0 10px 0.5px rgba(255, 255, 255, 0.47)';
        });
    }

    startGame(o_turn); // Continue turns from the previous game
}

// Reset application to default
function resetMode() {
    o_turn = !o_turn; // Reset turns
    newGame();

    // Reset score
    score_p1 = 0;
    score_p2 = 0;

    score_p1_display.innerHTML = '--';
    score_p2_display.innerHTML = '--';

    // Reset player turns to the default (X) and reset the indicator
    o_turn = false;

    // Toggle turn indicator
    bg_turn_togg.style.left = "0px";
    player_x_togg.style.color = "black";
    player_o_togg.style.color = "white";
    bg_turn_togg.style.backgroundColor = "aqua";
}


// function to place mark in the cell
function placeMark(cube,currentClass){  cube.classList.add(currentClass); }



function check_winner(currentClass) {
    for (let condition of win_conditions) {
        if (condition.every(index => cubeElements[index].classList.contains(currentClass))) {
            // Apply box shadow to the winning combination cells
            condition.forEach(index => {
                cubeElements[index].style.boxShadow = `0 0 10px 0.5px ${o_turn ? 'chartreuse' : 'aqua'}`;
            });
            return true; // Return the winning subarray
        }
    }
    return false; // Return null if no winning combination is found
}



function gameOver(draw){
    if(draw){
        result.innerHTML = 'Result : Match Draw !';
        draw_audio.play();
        gif_index = 2;
        document.getElementById(`${gif[gif_index]}`).style.width='200px';;
        //draw_gif.style.width='220px';
        gameOverFlag = true; // Set the game over flag to true   
    }
    else if(!draw && game_mode==1){
        if(!o_turn)
        {
            result.style.color = 'aqua';
            result.innerHTML = 'Result : X wins !';
    
            // Celebration
            Confetti('x');
            win_1_audio.play();
            win_2_audio.play();
            gif_index = 0;
            document.getElementById(`${gif[gif_index]}`).style.width='250px';
    
            score_p1++;                                 // Increment player 1 ( X ) score
            score_p1_display.innerHTML = score_p1;      // Display updated score
    
        }
        else
        {
            result.style.color = 'chartreuse';
            result.innerHTML = 'Result : O wins !';
    
            // Celebration
            Confetti('o');
            win_1_audio.play();
            win_2_audio.play();
            gif_index = 1;
            document.getElementById(`${gif[gif_index]}`).style.width='230px';
    
            score_p2++;                                 // Increment player 2 ( O ) score
            score_p2_display.innerHTML = score_p2;      // Display updated score
    
        }
        gameOverFlag = true; // Set the game over flag to true
    }
    else if(!draw && game_mode==2)
    {
        if(!o_turn)
        {
            result.style.color = 'aqua';
            result.innerHTML = 'Result : X wins !';
    
            // Celebration
            Confetti('x');
            win_1_audio.play();
            win_2_audio.play();
            gif_index = 0;
            document.getElementById(`${gif[gif_index]}`).style.width='250px';
    
            score_p1++;                                 // Increment player 1 ( X ) score
            score_p1_display.innerHTML = score_p1;      // Display updated score
    
        }
        else
        {
            result.style.color = 'chartreuse';
            result.innerHTML = 'Result : O wins !';
    
            // Celebration
            Confetti('o');
            win_1_audio.play();
            win_2_audio.play();
            gif_index = 3;
            document.getElementById(`${gif[gif_index]}`).style.width='230px';
    
            score_p2++;                                 // Increment player 2 ( O ) score
            score_p2_display.innerHTML = score_p2;      // Display updated score
    
        }
        gameOverFlag = true; // Set the game over flag to true
    }
}





// Checks if each cube has any one of the classes which basically tells that no player 
// has won yet and there are no more cubes to place a mark so the match is a Draw
function is_a_draw(){
    return [...cubeElements].every(cell=>{
        return cell.classList.contains(X_class) || cell.classList.contains(O_class)
    })
}





















// old  function

/*




// Tic Tac Toe Functionality

var player_x_togg_turn = true;
var click_count = 0;    // This is to stop when match is draw and all boxes are picked
var x = "X";
var o = "O";

var b1 = document.getElementById('b1');
var b2 = document.getElementById('b2');
var b3 = document.getElementById('b3');
var b4 = document.getElementById('b4');
var b5 = document.getElementById('b5');
var b6 = document.getElementById('b6');
var b7 = document.getElementById('b7');
var b8 = document.getElementById('b8');
var b9 = document.getElementById('b9');

var result = document.getElementById('winner');




// All Events on Button Click like audio , turn toggle , placing symbol

function btnClick(ID) {
    if (player_x_togg_turn) {

        click_1_audio.play();
        document.getElementById(ID).innerHTML = x;  // Place X in box
        player_x_togg_turn = false;                      // Change Player turn

        // Toggle turn indicator
        bg_turn_togg.style.left = "75px";

        if (player_o_togg.style.color === "white") {
            player_o_togg.style.color = "black";
            player_x_togg.style.color = "white";
            bg_turn_togg.style.backgroundColor = "chartreuse";
        }
        else { player_o_togg.style.color = "white"; }
    }
    else {

        click_2_audio.play();
        document.getElementById(ID).innerHTML = o;  // Place O in box
        player_x_togg_turn = true;                       // Change player turn

        // Toggle turn indicator
        bg_turn_togg.style.left = "0px";

        if (player_x_togg.style.color === "white") {
            player_x_togg.style.color = "black";
            player_o_togg.style.color = "white";
            bg_turn_togg.style.backgroundColor = "aqua";
        }
        else { player_x_togg.style.color = "white"; }
    }
    document.getElementById(ID).disabled = true;    // Disable button after picked by a player
}






// Game Logic

function check_condition(ID) {

    btnClick(ID);
    winning_player = decide_winner();

    if(winning_player == x)
    {
        result.style.color = 'aqua';
        result.innerHTML = 'Result : X wins !';

        // Celebration
        Confetti('x');
        win_1_audio.play();
        win_2_audio.play();
        win_x_gif.style.width='250px';

        score_p1++;                                 // Increment player 1 ( X ) score
        score_p1_display.innerHTML = score_p1;      // Display updated score

        disableAllButtons();
    }
    else if(winning_player == o)
    {
        result.style.color = 'chartreuse';
        result.innerHTML = 'Result : O wins !';

        // Celebration
        Confetti('o');
        win_1_audio.play();
        win_2_audio.play();
        win_o_gif.style.width='230px';

        score_p2++;                                 // Increment player 2 ( O ) score
        score_p2_display.innerHTML = score_p2;      // Display updated score

        disableAllButtons();
    }
    else{
        click_count++;
        // Check if all boxes are filled
        if (click_count >= 9) {
            document.getElementById('winner').innerHTML = 'Result : Match Draw !';
            disableAllButtons();

            draw_audio.play();
            draw_gif.style.width='220px';

        }
    }
}




// Winning conditions
let wins = [
    [1, 2, 3], [4, 5, 6], [7, 8, 9],
    [1, 4, 7], [2, 5, 8], [3, 6, 9],
    [1, 5, 9], [3, 5, 7]
];


function decide_winner(){

    for (let i = 0; i < wins.length; i++) {
        let [a, b, c] = wins[i];
        // Get elements by their IDs
        let box_A = document.getElementById(`b${a}`).innerHTML;
        let box_B = document.getElementById(`b${b}`).innerHTML;
        let box_C = document.getElementById(`b${c}`).innerHTML;

        // Check for winning condition and return the winning player
        if (box_A === box_B && box_B === box_C && box_A!='') {
            return box_A;
        }
    }
    // If no winner, return null
    return null;
}





// Once a match is over due to win / draw disable all buttons to save the result

function disableAllButtons() {
    b1.disabled = true; b2.disabled = true; b3.disabled = true;
    b4.disabled = true; b5.disabled = true; b6.disabled = true;
    b7.disabled = true; b8.disabled = true; b9.disabled = true;
}




function resetMode() {
    // Reset Result
    clearResult();

    // Reset score
    score_p1 = 0;
    score_p2 = 0;

    score_p1_display.innerHTML = '--';
    score_p2_display.innerHTML = '--';

    // Reset player turns to the default ( X ) and reset the indicator
    player_x_togg_turn = true;

    // Toggle turn indicator
    bg_turn_togg.style.left = "0px";

    if (player_x_togg.style.color === "white") {
        player_x_togg.style.color = "black";
        player_o_togg.style.color = "white";
        bg_turn_togg.style.backgroundColor = "aqua";
    }
    else { player_x_togg.style.color = "white"; }


    // Toggle turn indicator
    bg_turn_togg.style.left = "0px";

    if(o_turn)
    {
        player_x_togg.style.color = "black";
        player_o_togg.style.color = "white";
        bg_turn_togg.style.backgroundColor = "aqua";
    }
    else { player_x_togg.style.color = "white"; }
}




// New Match in same Game mode

function newGame() {

    // First Enable all the buttons again
    b1.disabled = false; b2.disabled = false; b3.disabled = false;
    b4.disabled = false; b5.disabled = false; b6.disabled = false;
    b7.disabled = false; b8.disabled = false; b9.disabled = false;


    new_game_audio.play();
    clearResult();
}


// Reset Result

function clearResult() {
    b1.innerHTML = ''; b2.innerHTML = ''; b3.innerHTML = '';
    b4.innerHTML = ''; b5.innerHTML = ''; b6.innerHTML = '';
    b7.innerHTML = ''; b8.innerHTML = ''; b9.innerHTML = '';

    // Reset the displayed result
    result.style.color = 'white';
    result.innerHTML = 'Result : --';

    // Reset the click_count 
    click_count = 0;
}

*/

































/*

let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

let w; // = width / 3;
let h; // = height / 3;

let comp = 'O';
let human = 'X';
let currentPlayer = human;

function setup() {
    createCanvas(400, 400);
    w = width / 3;
    h = height / 3;
    bestMove();
}

function equals3(a, b, c) {
    return a == b && b == c && a != '';
}

function checkWinner() {
    let winner = null;

    // horizontal
    for (let i = 0; i < 3; i++) {
        if (equals3(board[i][0], board[i][1], board[i][2])) {
            winner = board[i][0];
        }
    }

    // Vertical
    for (let i = 0; i < 3; i++) {
        if (equals3(board[0][i], board[1][i], board[2][i])) {
            winner = board[0][i];
        }
    }

    // Diagonal
    if (equals3(board[0][0], board[1][1], board[2][2])) {
        winner = board[0][0];
    }
    if (equals3(board[2][0], board[1][1], board[0][2])) {
        winner = board[2][0];
    }

    let openSpots = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] == '') {
                openSpots++;
            }
        }
    }

    if (winner == null && openSpots == 0) {
        return 'tie';
    } else {
        return winner;
    }
}

function mousePressed() {
    if (currentPlayer == human) {
        // Human make turn
        let i = floor(mouseX / w);
        let j = floor(mouseY / h);
        // If valid turn
        if (board[i][j] == '') {
            board[i][j] = human;
            currentPlayer = comp;
            bestMove();
        }
    }
}

function draw() {
    background(255);
    strokeWeight(4);

    line(w, 0, w, height);
    line(w * 2, 0, w * 2, height);
    line(0, h, width, h);
    line(0, h * 2, width, h * 2);

    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
            let x = w * i + w / 2;
            let y = h * j + h / 2;
            let spot = board[i][j];
            textSize(32);
            let r = w / 4;
            if (spot == human) {
                noFill();
                ellipse(x, y, r * 2);
            } 
            else if (spot == comp) {
                line(x - r, y - r, x + r, y + r);
                line(x + r, y - r, x - r, y + r);
            }
        }
    }

    let result = checkWinner();
    if (result != null) {
        noLoop();
        let resultP = createP('');
        resultP.style('font-size', '32pt');
        if (result == 'tie') {
            resultP.html('Tie!');
        } else {
            resultP.html(`${result} wins!`);
        }
    }
}
*/

