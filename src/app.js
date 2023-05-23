import { createPlayer, createComputerPlayer } from "./Player.js";

const humanBoard = document.getElementById("human-board");
const computerBoard = document.getElementById("computer-board");
const startGameButton = document.querySelector(".start-game");
const messageDiv = document.querySelector("#message");

// create two players: human and computer
const human = createPlayer("Human");
const computer = createComputerPlayer();

// populate each player's gameboard with predetermined coordinates for their ships
// human.gameboard.placeShips();

startGameButton.addEventListener("click", () => {
  human.gameboard.placeShips(false);
  computer.gameboard.placeShips(true);

  // Render the human player's board
  human.gameboard.board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const newSquare = document.createElement("div");
      newSquare.classList.add("square");
      if (square.isShip) {
        newSquare.classList.add("ship");
      }
      newSquare.dataset.x = rowIndex;
      newSquare.dataset.y = colIndex;
      newSquare.addEventListener("click", (e) => {
        console.log("clicked " + e.target.dataset.x, e.target.dataset.y);
      });
      humanBoard.appendChild(newSquare);
    });
  });

  // Render the computer player's board
  computer.gameboard.board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const newSquare = document.createElement("div");
      newSquare.classList.add("square");
      if (square.isShip) {
        newSquare.classList.add("ship");
      }
      newSquare.dataset.x = rowIndex;
      newSquare.dataset.y = colIndex;
      newSquare.addEventListener("click", () => {
        console.log(
          "Computer was clicked at " + newSquare.dataset.x,
          newSquare.dataset.y
        );
      });
      computerBoard.appendChild(newSquare);
    });
  });
});

console.log(human);

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
  let enemyGameboard;
  if (currentPlayer === human) {
    enemyGameboard = computer.gameboard;
  } else {
    enemyGameboard = human.gameboard;
  }
  const allSunk = enemyGameboard.allSunk();
  if (allSunk) {
    gameOn = false;
    if (currentPlayer === human) {
      if (currentPlayer === human) {
        messageDiv.textContent = "You win!";
      }
      console.log("You win!");
    } else {
      if (currentPlayer === computer) {
        messageDiv.textContent = "You lose!";
      }
      console.log("You lose!");
    }
  }
}

// create a function to handle the attack logic
function attackLogic(X, Y) {
  // Get the enemy gameboard based on the current player
  let enemyGameboard;
  if (currentPlayer === human) {
    enemyGameboard = computer.gameboard;
  } else {
    enemyGameboard = human.gameboard;
  }

  // Call the receiveAttack method on the enemy gameboard with the coordinates
  // enemyGameboard.receiveAttack(X, Y);

  // Check if the attack hit or missed a ship using the isShip property on the board square
  const square = enemyGameboard.board[X][Y];
  if (square.isShip) {
    // Increase the numHits property of the ship on the square
    square.ship.numHits++;

    // Color the square red to indicate a hit
    // const squareElement = document.querySelector(
    //   `[data-x="${X}"][data-y="${Y}"]`
    // );
    // squareElement.style.backgroundColor = "red";

    // Check if the ship is sunk
    //   if (square.ship.isSunk()) {
    //     // Display a message indicating that the ship has been sunk
    //     console.log(`You sunk the ${square.ship.type}!`);
    //   } else {
    //     // Display a message indicating a hit
    //     console.log("You hit a ship!");
    //   }
    // } else {
    //   // Color
    // Color the square gray to indicate a missed attack
    //   const squareElement = document.querySelector(
    //     `[data-x="${X}"][data-y="${Y}"]`
    //   );
    //   squareElement.style.backgroundColor = "gray";

    //   // Display a message indicating a missed attack
    //   console.log("You missed!");
    // }

    // Check if the game is over using the gameOver function
    gameOver();

    // If not over, switch the current player using the switchPlayer function
    // switchPlayer();

    // If the current player is computer, call the attackLogic function with random coordinates
    if (currentPlayer === computer) {
      const randomX = Math.floor(Math.random() * 10);
      const randomY = Math.floor(Math.random() * 10);
      attackLogic(randomX, randomY);
    }
  }
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
    const X = event.target.dataset.x;
    const Y = event.target.dataset.y;

    // check if the square has already been attacked
    const square = computer.gameboard.board[X][Y];
    if (square.isAttacked) {
      return;
    }

    // mark the square as attacked
    square.isAttacked = true;

    // check if there is a ship at the square
    if (square.isShip) {
      const ship = square.ship;
      if (ship.isSunk()) {
        console.log(`The ${ship.type} is already sunk!`);
        return;
      }

      // Increase the numHits property of the ship on the square
      ship.hit();

      if (ship.isSunk()) {
        console.log(`You sunk the ${ship.type}!`);
      } else {
        console.log(`You hit the ${ship.type}!`);
      }

      // Update the UI to display the hit square
      event.target.classList.add("hit");
    } else {
      console.log("You missed!");
      // Update the UI to display the missed square
      event.target.classList.add("miss");
    }

    // Call the attackLogic function with the coordinates
    attackLogic(Number(X), Number(Y));
  }

  // add an event listener to each square on the computer board using handleClick as callback
  computerBoard.addEventListener("click", handleClick);

  // return an object with public methods or properties that can be accessed from outside
  return { renderBoards };
})();

// call the renderBoards method on DOMModule to display both boards initially
DOMModule.renderBoards();
