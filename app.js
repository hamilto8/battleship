const mainDiv = document.getElementById('main');
const allBoards = document.querySelectorAll('.board');

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
        reveiveAttack(num){
            if(board[num].dataset.status === 'taken'){
                
                board[coordX][coordY].hit();
            } else{
                return false;
            }
        }
    }
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