const mainDiv = document.getElementById('main');

const shipInfo = [
    {type: 'carrier', length: 5},
    {type: 'battleship', length: 4},
    {type: 'submarine', length: 3},
    {type: 'destroyer', length: 2},
    {type: 'cruiser', length: 3}
]

function Ship (length, name) {
    return {
        length: length,
        location: [],
        hits:[],
        sunk: false,
        name: name,
        hit (coordX, coordY){
            console.log(`${this.name} has been hit at ${coordX}, ${coordY}`);
        },
        isSunk(){
            return this.sunk;
        }
    }
}

function Gameboard (){
    return {
        board: [
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], [],
            [], [], [], [], [], [], [], [], [], []
        ],
        reveiveAttack(coordX, coordY){
            if(board[coordX][coordY].dataset.status === 'taken'){
                
                board[coordX][coordY].hit();
            } else{
                return false;
            }
        }
    }
}

const carrier = new Ship(5, 'carrier');