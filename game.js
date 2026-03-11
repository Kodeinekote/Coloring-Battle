let playerPosition = 0

const board = document.getElementById("game-board")

const rollButton = document.getElementById("rollDice")

const posText = document.getElementById("playerPos")

for(let i=0;i<50;i++){ //for - это цикл, 50 - это 50 клеток

let cell = document.createElement("div")

cell.className="cell"

cell.innerText=i

board.appendChild(cell)

}

rollButton.onclick = function(){ //а это уже кубик - ролл

let dice = Math.floor(Math.random()*6)+1

playerPosition += dice

posText.innerText = playerPosition

}
