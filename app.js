const mainDiv = document.getElementById('main');
const allBoards = document.querySelectorAll('.board');
const playerBoard = document.querySelector('.player-board');
const computerBoard = document.querySelector('.computer-board');
const selectShipsDiv = document.querySelector('.select-ships');

const shipInfo = [
    {type: 'carrier', length: 5, color: 'red'},
    {type: 'battleship', length: 4, color: 'blue'},
    {type: 'submarine', length: 3, color: 'green'},
    {type: 'destroyer', length: 2, color: 'yellow'},
    {type: 'cruiser', length: 3, color: 'purple'}
]

function Ship (length, name, location, color) {
    return {
        length: length,
        location: location,
        hits:[],
        sunk: false,
        name: name,
        color: color,
        hit (coord){
            console.log(`${this.name} has been hit at ${coord}`);
        },
        isSunk(num){
            this.location.forEach(square =>{
               if(square === num){
                return false;
               }
                return true;
            })
        }
    }
}

function Gameboard (player){
    return {
        board:(player === 'player' ? 'es' : 'us'),
        // should be able to place ship by calling ship function
        placeShip(){
            
        },
        reveiveAttack(num){
            
        },
        missedAttacks: [],
        allShipsSunk(){
            return false;
        }
    }
}

const Player = {
    turn: false,
    board: Gameboard('player')
}

const Computer = {
    turn: true,
    board: Gameboard('computer')
}

const carrier = new Ship(5, 'carrier', [0,1,2,3,4], 'red');

allBoards.forEach(board =>{
    let count = 0;
    while(count < 100){
        const newDiv = document.createElement('div');
            newDiv.dataset.id = count;
            newDiv.classList.add('cell');
            newDiv.addEventListener('click', amClicked)
            board.appendChild(newDiv);
        count++;
    }
});

function amClicked(e){
    console.log(`clicked div ${e.target.parentElement.classList} #${e.target.dataset.id}`)
}

carrier.location.forEach(idx =>{
    selectShipsDiv.children[idx].classList.add('carrier');
    selectShipsDiv.children[idx].draggable = true;
})