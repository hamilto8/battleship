const mainDiv = document.getElementById('main');
const allBoards = document.querySelectorAll('.board');

const shipInfo = [
    {type: 'carrier', length: 5},
    {type: 'battleship', length: 4},
    {type: 'submarine', length: 3},
    {type: 'destroyer', length: 2},
    {type: 'cruiser', length: 3}
]

function Ship (length, name, location) {
    return {
        length: length,
        location: location,
        hits:[],
        sunk: false,
        name: name,
        hit (coord){
            console.log(`${this.name} has been hit at ${coord}`);
        },
        isSunk(){
            this.hits.forEach(hit =>{
               if(!this.location.includes(hit)){
                return false;
               }
                return true;
            })
        }
    }
}

function Gameboard (){
    return {
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

function Player(){
    let playerTurn = false;
    let playerBoard = Gameboard();
}

const carrier = new Ship(5, 'carrier');

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