let playerPosition = 1 //лет плейер позишн - игрок начинает на клетке 1

// Находим элементы страницы
const board = document.getElementById("game-board")

const rollButton = document.getElementById("rollDice")

const posText = document.getElementById("playerPos")

//Массив для хранения клеток
const cells = []

//Создаем поле (100 клеток)
for(let i=1;i<=100;i++){ //for - это цикл, 100 - это 100 клеток. Лет 1 - это начнем с единицы

let cell = document.createElement("div")

cell.className="cell"

cell.innerText=i

board.appendChild(cell)

// сохраняем клетку в массив
cells.push(cell)
}

//ставим игрока на старт
cells[0].style.background = "silver" //сильвер - первая клетка станет золотой

cells[99].style.background = "gold" //голд - финишная клетка станет золотой

//кнопка кубика
rollButton.onclick = function(){ //а это уже кубик - ролл

let dice = Math.floor(Math.random()*6)+1

playerPosition += dice

if(playerPosition > 100){
playerPosition = 100;
alert("Ничего себе! Вот это удача! Финиш🎉!"); //УВЕДОМЛЕНИЕ
}

posText.innerText = playerPosition

updatePlayer()

}

//функция перемещения игрока

function updatePlayer(){

cells.forEach((cell, index) => {
if (index === 99) {
cell.style.background = "gold";
 } else {
cell.style.background = "white";
        }
    });

cells[playerPosition-1].style.background = "gold"

}
