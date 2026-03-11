// ============================================
// 🐍 GAME CONFIGURATION
// ============================================

const GAME_CONFIG = {
    TOTAL_CELLS: 100,  // 100 клеток вместо 50
    BOARD_WIDTH: 400,
    BOARD_HEIGHT: 600,
    CELL_SIZE: 30,
    ANIMATION_DURATION: 300
};

// ============================================
// 🐍 SNAKE PATH DEFINITION
// ============================================

/**
 * Вычисляет координаты 100 клеток вдоль S-образного пути змеи
 * Создает красивую волнистую кривую сверху вниз
 */
function generateSnakePath() {
    const cells = [];
    const centerX = GAME_CONFIG.BOARD_WIDTH / 2;
    const centerY = 30;
    const maxY = GAME_CONFIG.BOARD_HEIGHT - 30;
    const amplitude = 85; // Амплитуда волны (расстояние от центра)
    
    for (let i = 0; i < GAME_CONFIG.TOTAL_CELLS; i++) {
        // Параметр от 0 до 1 для плавного движения сверху вниз
        const t = i / (GAME_CONFIG.TOTAL_CELLS - 1);
        
        // Y координата: идет от вверху до вниз
        const y = centerY + (t * (maxY - centerY));
        
        // X координата: синусоида для S-образного движения влево-вправо
        // 3 полных волны для красивого эффекта
        const x = centerX + Math.sin(t * Math.PI * 3) * amplitude;
        
        cells.push({
            id: i,
            x: Math.max(20, Math.min(GAME_CONFIG.BOARD_WIDTH - 20, x)), // Ограничиваем края
            y: y,
            originalX: x,
            originalY: y
        });
    }
    
    return cells;
}

// ============================================
// 🎮 GAME STATE
// ============================================

class GameState {
    constructor() {
        this.playerPosition = 0;
        this.snakePath = generateSnakePath();
        this.diceRolling = false;
        this.gameRunning = true;
        this.playerColor = '#667eea';
        this.powerUps = this.generatePowerUps();
    }

    generatePowerUps() {
        const powerups = [];
        // Создаем 10 бонусов (было 5, теперь больше для 100 клеток)
        const powerupCells = new Set();
        
        while (powerupCells.size < 10) {
            const randomCell = Math.floor(Math.random() * GAME_CONFIG.TOTAL_CELLS);
            // Не ставим в начало и конец
            if (randomCell > 10 && randomCell < GAME_CONFIG.TOTAL_CELLS - 10) {
                powerupCells.add(randomCell);
            }
        }
        
        powerupCells.forEach(cellId => {
            powerups.push({
                cellId: cellId,
                type: 'bonus',
                value: Math.floor(Math.random() * 3) + 2 // +2 или +3 хода
            });
        });
        
        return powerups;
    }

    rollDice() {
        if (this.diceRolling || !this.gameRunning) return null;
        
        const diceValue = Math.floor(Math.random() * 6) + 1;
        return diceValue;
    }

    movePlayer(steps) {
        const newPosition = Math.min(
            this.playerPosition + steps,
            GAME_CONFIG.TOTAL_CELLS - 1
        );
        
        // Проверяем, есть ли бонус на клетке
        const powerup = this.powerUps.find(p => p.cellId === newPosition);
        if (powerup) {
            console.log('🌟 Получен бонус! +' + powerup.value + ' ходов');
            // Можно применить бонус автоматически
            // this.playerPosition += powerup.value;
        }
        
        // Проверяем победу
        if (newPosition === GAME_CONFIG.TOTAL_CELLS - 1) {
            this.gameRunning = false;
            console.log('🎉 Вы победили!');
        }
        
        this.playerPosition = newPosition;
        return newPosition;
    }

    getPlayerCell() {
        return this.snakePath[this.playerPosition];
    }
}

// ============================================
// 🎨 RENDERING
// ============================================

class GameRenderer {
    constructor(gameState) {
        this.gameState = gameState;
        this.gameBoard = document.getElementById('game-board');
        this.playerPosDisplay = document.getElementById('playerPos');
        this.progressFill = document.getElementById('progress-fill');
    }

    renderCells() {
        // Очищаем старые клетки
        this.gameBoard.innerHTML = '';
        
        const cells = this.gameState.snakePath;
        
        cells.forEach((cell, index) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.id = `cell-${index}`;
            
            // Отображаем номер клетки (от 1 до 100)
            cellDiv.textContent = index + 1;
            
            // Позиционируем клетку абсолютно вдоль пути змеи
            cellDiv.style.left = (cell.x - GAME_CONFIG.CELL_SIZE / 2) + 'px';
            cellDiv.style.top = (cell.y - GAME_CONFIG.CELL_SIZE / 2) + 'px';
            
            // Проверяем, есть ли здесь бонус
            const hasPowerup = this.gameState.powerUps.some(p => p.cellId === index);
            if (hasPowerup) {
                cellDiv.classList.add('powerup');
                cellDiv.textContent = '⭐';
            }
            
            // Проверяем, есть ли здесь игрок
            if (index === this.gameState.playerPosition) {
                cellDiv.classList.add('player');
                cellDiv.textContent = '🎮';
            }
            
            // Добавляем обработчик клика для отладки
            cellDiv.addEventListener('click', () => {
                console.log(`Клетка ${index + 1}: (${cell.x.toFixed(1)}, ${cell.y.toFixed(1)})`);
            });
            
            this.gameBoard.appendChild(cellDiv);
        });
    }

    updatePlayerDisplay() {
        this.playerPosDisplay.textContent = this.gameState.playerPosition + 1;
        
        // Обновляем прогресс-бар
        const progress = (this.gameState.playerPosition / (GAME_CONFIG.TOTAL_CELLS - 1)) * 100;
        this.progressFill.style.width = progress + '%';
    }

    animatePlayerMove(fromIndex, toIndex) {
        return new Promise((resolve) => {
            const fromCell = document.getElementById(`cell-${fromIndex}`);
            const toCell = document.getElementById(`cell-${toIndex}`);
            
            if (fromCell) {
                fromCell.classList.remove('player');
                // Восстанавливаем номер или звезду
                const hasPowerup = this.gameState.powerUps.some(p => p.cellId === fromIndex);
                fromCell.textContent = hasPowerup ? '⭐' : (fromIndex + 1);
            }
            
            // Анимация перемещения
            setTimeout(() => {
                if (toCell) {
                    toCell.classList.add('player');
                    toCell.textContent = '🎮';
                    toCell.style.animation = 'none';
                    
                    // Триггерим анимацию пульса
                    setTimeout(() => {
                        toCell.style.animation = 'pulse 0.6s ease-out';
                    }, 10);
                }
                
                this.updatePlayerDisplay();
                resolve();
            }, GAME_CONFIG.ANIMATION_DURATION);
        });
    }

    showDiceResult(value) {
        const button = document.getElementById('rollDice');
        const originalText = button.textContent;
        button.textContent = `🎲 ${value}`;
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    }

    showGameOver() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const message = document.createElement('div');
        message.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        `;
        message.innerHTML = `
            <h2 style="color: #667eea; font-size: 32px; margin-bottom: 20px;">🎉 Вы победили!</h2>
            <p style="color: #666; font-size: 18px; margin-bottom: 20px;">Вы прошли всю змею из 100 клеток!</p>
            <button id="playAgain" style="
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
                font-weight: bold;
            ">Сыграть ещё</button>
        `;
        
        overlay.appendChild(message);
        document.body.appendChild(overlay);
        
        document.getElementById('playAgain').addEventListener('click', () => {
            location.reload();
        });
    }
}

// ============================================
// 🎮 GAME CONTROLLER
// ============================================

class GameController {
    constructor() {
        this.gameState = new GameState();
        this.renderer = new GameRenderer(this.gameState);
        this.setupEventListeners();
        this.init();
    }

    init() {
        this.renderer.renderCells();
        this.renderer.updatePlayerDisplay();
    }

    setupEventListeners() {
        const rollButton = document.getElementById('rollDice');
        
        rollButton.addEventListener('click', () => {
            this.handleDiceRoll();
        });
        
        // Поддержка Telegram WebApp
        if (window.Telegram?.WebApp) {
            console.log('🤖 Telegram WebApp API обнаружен');
            window.Telegram.WebApp.ready();
        }
    }

    async handleDiceRoll() {
        if (this.gameState.diceRolling || !this.gameState.gameRunning) return;
        
        this.gameState.diceRolling = true;
        
        // Бросаем кубик
        const diceValue = this.gameState.rollDice();
        console.log(`🎲 Выпало: ${diceValue}`);
        
        // Показываем результат
        this.renderer.showDiceResult(diceValue);
        
        // Ждем перед движением
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Запоминаем старую позицию
        const oldPosition = this.gameState.playerPosition;
        
        // Движемся на выпавшее количество шагов
        this.gameState.movePlayer(diceValue);
        const newPosition = this.gameState.playerPosition;
        
        console.log(`📍 Движение с клетки ${oldPosition + 1} на клетку ${newPosition + 1}`);
        
        // Анимируем движение
        await this.renderer.animatePlayerMove(oldPosition, newPosition);
        
        this.gameState.diceRolling = false;
        
        // Проверяем, победили ли
        if (!this.gameState.gameRunning) {
            await new Promise(resolve => setTimeout(resolve, 500));
            this.renderer.showGameOver();
        }
    }
}

// ============================================
// 🎮 ИНИЦИАЛИЗАЦИЯ ИГРЫ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐍 Инициализируем игру Змейка Боевое Поле...');
    console.log(`📊 Конфигурация: ${GAME_CONFIG.TOTAL_CELLS} клеток`);
    
    const game = new GameController();
    
    console.log('✅ Игра готова!');
    console.log(`📊 Всего клеток: ${GAME_CONFIG.TOTAL_CELLS}`);
    console.log(`⭐ Бонусов на доске: ${game.gameState.powerUps.length}`);
    console.log(`📍 Начальная позиция: 1`);
});
