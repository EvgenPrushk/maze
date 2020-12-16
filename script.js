const CELL_SIZE = 50;
const PADDING = 5;
const WALL_COLOR = "black";
const FREE_COLOR = "white";
const BACKGROUND_COLOR = "gray";
const TRACTOR_COLOR = "red";

// колличество ячеек должно быть нечетным
const COLUMNS = 11;
const ROWS = 11;

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const matrix = createMatrix(COLUMNS, ROWS);

const tractor = {
  x: 0,
  y: 0,
};

matrix[tractor.y][tractor.x] = true;


moveTractor();
drawmaze();

// генерация матрицы для создания лабиринта
function createMatrix(columns, rows) {
  const matrix = [];

  for (let y = 0; y < rows; y++) {
    const row = [];

    for (let x = 0; x < columns; x++) {
      row.push(false);
    }

    matrix.push(row);
  }

  return matrix;
}

function drawmaze() {
  canvas.width = PADDING * 2 + COLUMNS * CELL_SIZE;
  canvas.height = PADDING * 2 + ROWS * CELL_SIZE;

  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = BACKGROUND_COLOR;
  context.fill();

  for (let y = 0; y < COLUMNS; y++) {
    for (let x = 0; x < ROWS; x++) {
      const color = matrix[y][x] ? FREE_COLOR : WALL_COLOR;

      context.beginPath();
      context.rect(
        PADDING + x * CELL_SIZE,
        PADDING + y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      context.fillStyle = color;
      context.fill();
    }
  }

  context.beginPath();
  context.rect(
    PADDING + tractor.x * CELL_SIZE,
    PADDING + tractor.y * CELL_SIZE,
    CELL_SIZE,
    CELL_SIZE
  );
  context.fillStyle = TRACTOR_COLOR;
  context.fill();
}

function moveTractor () {
    const directions = [];

    if (tractor.x > 0) {
        directions.push([-2, 0])
    }

    if (tractor.x < COLUMNS) {
        directions.push([2,0]);
    }

    if (tractor.y > 0) {
        directions.push([0, -2]);
    }

    if (tractor.y < ROWS) {
        directions.push([0, 2]);
    }
    // деструктуризация движения трактора
    const [dx, dy] = getRandomItem(directions);
    tractor.x += dx;
    tractor.y += dy;
}

function getRandomItem (array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}
