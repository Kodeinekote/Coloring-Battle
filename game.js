// Number of cells to generate along the snake path
const numCells = 100;

// Function to generate an S-shaped snake path
function generateSnakePath() {
    const cells = [];
    for (let i = 0; i < numCells; i++) {
        const x = (i % 10) * 20; // 10 cells per row, adjust x based on index
        const y = (Math.floor(i / 10) % 2 === 0) ? i * 20 : (i - 10 * Math.floor(i / 10)) * 20;
        cells.push({ x: x, y: y });
    }
    return cells;
}

const snakePath = generateSnakePath();
console.log(snakePath); // Log the snake path coordinates