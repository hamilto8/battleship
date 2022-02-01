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
        sunk: false,
        name: name,
        hit (coordX, coordY){

        }
    }
}

function Gameboard (){
    return{
        reveiveAttack(coordX, coordY){
            if(board[coordX][coordY].dataset.status === 'taken'){
                board[coordX][coordY].hit();
            } else{
                return false;
            }
        }
    }
}

