import { createPlayer, createComputerPlayer } from "./Player.js";

// create two players: human and computer
const human = createPlayer("Human");
const computer = createComputerPlayer();

// populate each player's gameboard with predetermined coordinates for their ships
human.gameboard.placeShips();
// create a variable to store the current player
let currentPlayer = human;

// create a variable to store the game status
let gameOn = true;

// create a function to switch the current player
function switchPlayer() {
  if (currentPlayer === human) {
    currentPlayer = computer;
  } else {
    currentPlayer = human;
  }
}

// create a function to check if the game is over
function gameOver() {
  // check if either player's gameboard is all sunk using the allSunk method
  // if yes, set gameOn to false and display a message to indicate who won or lost
}

// create a function to handle the attack logic
function attackLogic(X, Y) {
  // get the enemy gameboard based on the current player
  let enemyGameboard;
  if (currentPlayer === human) {
    enemyGameboard = computer.gameboard;
  } else {
    enemyGameboard = human.gameboard;
  }

  // call the attack method on the current player with the enemy gameboard and the coordinates
  currentPlayer.attack(enemyGameboard, X, Y);

  // check if the attack hit or missed a ship using the missedAttacks array on the enemy gameboard
  // display a message to indicate the result of the attack

  // check if the game is over using the gameOver function

  // if not over, switch the current player using the switchPlayer function

  // if the current player is computer, call the attackLogic function with random coordinates
}

// create a module for DOM interaction
const DOMModule = (() => {
  // get the HTML elements for both players' gameboards
  const humanBoard = document.getElementById("human-board");
  const computerBoard = document.getElementById("computer-board");

  // get the HTML element for displaying messages
  const message = document.getElementById("message");

  // create a function to render both players' gameboards using information from their gameboard objects
  function renderBoards() {
    // loop through each square on both boards
    // add classes or styles depending on whether they have ships or missed attacks
  }

  // create a function to handle user input when clicking on a square on the computer board
  function handleClick(event) {
    // get the coordinates of the clicked square from its data attributes
    let X = event.target.dataset.x;
    let Y = event.target.dataset.y;

    // call the attackLogic function with those coordinates
    attackLogic(X, Y);
  }

  // add an event listener to each square on the computer board using handleClick as callback
  computerBoard.addEventListener("click", handleClick);

  // return an object with public methods or properties that can be accessed from outside
  return { renderBoards };
})();

// call the renderBoards method on DOMModule to display both boards initially
DOMModule.renderBoards();
