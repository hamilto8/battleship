const mainDiv = document.querySelector('#main');
const playerBoard = document.querySelector('.player-board');
const computerBoard = document.querySelector('.computer-board');
const shipArr = [];
const shipClasses = [
                        ['Carrier', 5], 
                        ['Battleship', 4], 
                        ['Cruiser', 3], 
                        ['Submarine', 3], 
                        ['Destroyer', 2]
                    ];

let playerData;
let computerData;

function Ship (shipClass, shipLength){
    const ship = {
        shipClass,
        shipLength,
        hit: (num) =>{
            // marks position as hit
            console.log(`Hit part ${num}!`);
        },
        isSunk: ()=>{
            console.log('not sunk');
        }
    }
    // return ship;
    shipArr.push(ship);
}

function Gameboard (player) {
    const board = {
        player: player = 'player',
        receiveAttack: (coords)=>{
            //check if coords hit a ship
            if(coords ){
                //send hit function to that ship

            }
            console.log('received')
        },
        placeShip: Ship(),
        missedAttacks: 0,
        allShipsSunk: false
    }
    return board;
}

shipClasses.forEach((ship)=>{
    const shipClass = ship[0];
    const shipLength = ship[1];
    Ship(shipClass, shipLength);
});

function setUpCells(board){
    for(i = 0; i < 100; i++){
        const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.cell = i;
            cellDiv.addEventListener('click', cellClicked)
            board.appendChild(cellDiv);
    }
}

setUpCells(playerBoard);
setUpCells(computerBoard);

function cellClicked(){
    console.log(this.dataset.cell);
}