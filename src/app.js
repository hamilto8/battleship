import { createPlayer, createComputerPlayer } from "./Player.js";

const humanBoard = document.getElementById("human-board");
const computerBoard = document.getElementById("computer-board");
const startGameButton = document.querySelector(".start-game");
const messageDiv = document.querySelector("#message");

const human = createPlayer("Human");
const computer = createComputerPlayer();

startGameButton.addEventListener("click", () => {
  human.gameboard.placeShips(false);
  computer.gameboard.placeShips(true);

  human.gameboard.board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const newSquare = document.createElement("div");
      newSquare.classList.add("square");
      if (square.isShip) {
        newSquare.classList.add("ship");
      }
      newSquare.dataset.x = rowIndex;
      newSquare.dataset.y = colIndex;
      humanBoard.appendChild(newSquare);
    });
  });

  computer.gameboard.board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const newSquare = document.createElement("div");
      newSquare.classList.add("square");
      newSquare.dataset.x = rowIndex;
      newSquare.dataset.y = colIndex;
      computerBoard.appendChild(newSquare);
    });
  });

  // Add click event listeners to the computer board squares
  Array.from(computerBoard.children).forEach((square) => {
    square.addEventListener("click", handleClick);
  });
});

let currentPlayer = "human";
let gameOn = true;

function switchPlayer() {
  currentPlayer = currentPlayer === "human" ? "computer" : "human";
}

function gameOver() {
  let enemyGameboard =
    currentPlayer === human ? computer.gameboard : human.gameboard;
  if (enemyGameboard.allSunk()) {
    gameOn = false;
    messageDiv.textContent = currentPlayer === human ? "You win!" : "You lose!";
    console.log(messageDiv.textContent);
  }
}

function attackLogic(X, Y) {
  let enemyGameboard =
    currentPlayer === human ? computer.gameboard : human.gameboard;
  if (enemyGameboard.board[X][Y].isAttacked) {
    return;
  }

  enemyGameboard.receiveAttack(X, Y);

  const square = enemyGameboard.board[X][Y];
  // check if the board attacked is the computer board or player board and select the appropriate square using querySelector and the dataset x and y values
  const uiSquare =
    currentPlayer === "human"
      ? computerBoard.querySelector(`[data-x="${X}"][data-y="${Y}"]`)
      : humanBoard.querySelector(`[data-x="${X}"][data-y="${Y}"]`);

  if (square.isShip) {
    square.ship.hit();
    uiSquare.classList.add("hit");

    if (square.ship.isSunk()) {
      console.log(`You sunk the ${square.ship.type}!`);
    } else {
      if (currentPlayer === "human") {
        console.log("You hit a ship!!");
      } else {
        console.log("Computer hit a ship!");
      }
    }
  } else {
    if (currentPlayer === "human") {
      console.log("You missed!");
    } else {
      console.log("Computer missed!");
    }
    uiSquare.classList.add("miss");
  }

  gameOver();

  if (gameOn) {
    switchPlayer();

    if (currentPlayer === "computer") {
      setTimeout(() => {
        const randomX = Math.floor(Math.random() * 10);
        const randomY = Math.floor(Math.random() * 10);
        attackLogic(randomX, randomY);
      }, 500);
    }
  }
}

function handleClick(event) {
  const X = event.target.dataset.x;
  const Y = event.target.dataset.y;

  attackLogic(Number(X), Number(Y));
}
