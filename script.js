const CELL_SIZE = 50;
const PADDING = 5;
const WALL_COLOR = "black";
const FREE_COLOR = "white";
const BACKGROUND_COLOR = "gray";
const TRACTOR_COLOR = "red";
const WITH_ANIMATION = false;

const TRACTORS_NUMBER = 1;
const DELAY_TIMEOUT = 100;

// колличество ячеек должно быть нечетным
const COLUMNS = 21;
const ROWS = 21;

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

// хотим получить состояние муши в зависимости от того, где она находиться на canvas
const mouse = createMouse(canvas);

// две переменные заполняемые при клике
let cell1 = null;
let cell2 = null;
let potentials = null;
let path = null;

const matrix = createMatrix(COLUMNS, ROWS);
const tractors = [];
for (let i = 0; i < TRACTORS_NUMBER; i++) {
  tractors.push({
    x: 0,
    y: 0,
  });
}
// стартовая ячейка для всех тракторов
matrix[0][0] = true;

main();

//  главная функция для отрисовки лабиринта
async function main() {
  while (!isValidMaze()) {
    for (const tractor of tractors) {
      moveTractor(tractor);
    }
    // если с анимацией, то ставим в true
    if (WITH_ANIMATION) {
      drawMaze();

      for (const tractor of tractors) {
        drawTractor(tractor);
      }

      await delay(DELAY_TIMEOUT);
    }
  }
  drawMaze();

  requestAnimationFrame(tick);
}

// стандартная функция задержки
function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

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

// отрисовка лабиринта в том состоянии в котором он сейчас есть
function drawMaze() {
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
}

// функция отрисовки трактора в текущем состоянии
function drawTractor(tractor) {
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

// рисует трактор после перемещения
function moveTractor(tractor) {
  const directions = [];

  if (tractor.x > 0) {
    directions.push([-2, 0]);
  }

  if (tractor.x < COLUMNS - 1) {
    directions.push([2, 0]);
  }

  if (tractor.y > 0) {
    directions.push([0, -2]);
  }

  if (tractor.y < ROWS - 1) {
    directions.push([0, 2]);
  }

  // деструктуризация движения трактора
  const [dx, dy] = getRandomItem(directions);

  tractor.x += dx;
  tractor.y += dy;

  if (!matrix[tractor.y][tractor.x]) {
    matrix[tractor.y][tractor.x] = true;
    matrix[tractor.y - dy / 2][tractor.x - dx / 2] = true;
  }
}

// случайное генерация движения трактора вверх, вниз, вправо в лево при возможности
function getRandomItem(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

//  проверка завершенности рисования лабиринта
function isValidMaze() {
  for (let y = 0; y < COLUMNS; y += 2) {
    for (let x = 0; x < ROWS; x += 2) {
      if (!matrix[y][x]) {
        return false;
      }
    }
  }

  return true;
}

function createMouse(element) {
  const mouse = {
    x: 0,
    y: 0,
    left: false,
    pLeft: false,
    over: false,
    // сравниваем состояние текущее и предыдущего тика
    update() {
      this.pLeft = this.left;
    },
  };

  element.addEventListener("mouseenter", mouseenterHandler);
  element.addEventListener("mouseleave", mouseleaveHandler);
  element.addEventListener("mousemove", mousemoveHandler);
  element.addEventListener("mousedown", mousedownHandler);
  element.addEventListener("mouseup", mouseupHandler);

  function mouseenterHandler() {
    mouse.over = true;
  }

  function mouseleaveHandler() {
    mouse.over = false;
  }

  function mousemoveHandler(event) {
    const rect = element.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }

  function mousedownHandler(event) {
    mouse.left = true;
  }

  function mouseupHandler(event) {
    mouse.left = false;
  }

  return mouse;
}

function tick() {
  requestAnimationFrame(tick);

  if (
    mouse.x < PADDING ||
    mouse.y < PADDING ||
    mouse.x > canvas.width - PADDING ||
    mouse.y > canvas.height - PADDING
  ) {
    return;
  }

  const x = Math.floor((mouse.x - PADDING) / CELL_SIZE);
  const y = Math.floor((mouse.y - PADDING) / CELL_SIZE);

  if (mouse.left && !mouse.pLeft && matrix[y][x]) {
    // проверка если мы кликнули на одну и ту же ячейку
    if (!cell1 || cell1[0] !== x || cell1[1] !== y) {
      cell2 = cell1;
      // забираем положение прокликивоемой ячейки
      cell1 = [x, y];

     
    }
    if (cell1 && cell2) {
      potentials = getPotentialMatrix(matrix, cell1, cell2);

      let [x, y] = cell1;
      let potential = potentials[y][x];
      path = [[x, y]];      
      

      while (potential !== 0) {
        // отнимаем от текущего потенциала 1
        potential--;

        // ячейка сверху, равна ли она текущему потенциалу минус 1
        if (y > 0 && potentials[y - 1][x] === potential) {
          path.push([x, y - 1]);
          y--;
          continue;
        }

        // ячейка снизу, равна ли она текущему потенциалу минус 1
        if (y < COLUMNS - 1 && potentials[y + 1][x] === potential) {
          path.push([x, y + 1]);
          y++;
          continue;
        }

        // ячейка слева, равна ли она текущему потенциалу минус 1
        if (x > 0 && potentials[y][x - 1] === potential) {
          path.push([x - 1, y]);
          x--;
          continue;
        }

        // ячейка справа, равна ли она текущему потенциалу минус 1
        if (x < ROWS - 1 && potentials[y][x + 1] === potential) {
          path.push([x + 1, y]);
          x++;
          continue;
        }
      }
      console.log(path);
    }
  }

  if (path) {
    for (const [x, y] of path) {
      context.fillStyle = "green";
      context.fillRect(
        PADDING + x * CELL_SIZE,
        PADDING + y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      )
    }
  }
  // фрагмент кода для рисования цифр определяющий растояние между двумя точками лабиринта
  // if (potentials) {
  //   for (let y = 0; y < COLUMNS; y++) {
  //     for (let x = 0; x < ROWS; x++) {
  //       if (potentials[y][x] === null || potentials[y][x] === false) {
  //         continue;
  //       }

  //       context.fillStyle = "red";
  //       context.font = "30px serif";
  //       context.textAlign = "center";
  //       context.textBaseline = "middle";
  //       context.fillText(
  //         potentials[y][x],
  //         PADDING + x * CELL_SIZE + CELL_SIZE * 0.5,
  //         PADDING + y * CELL_SIZE + CELL_SIZE * 0.5
  //       );
  //     }
  //   }

  // }

  mouse.update();
}
// использую волновую функцию для нохождения выхода из лабиринта
function getPotentialMatrix(matrix, [x1, y1], [x2, y2]) {
  const potentials = [];
  for (let y = 0; y < matrix.length; y++) {
    const row = [];
    for (let x = 0; x < matrix[y].length; x++) {
      row.push(null);
    }
    potentials.push(row);
  }
  // та часть лабиринта, которая темная, отмечаем ее false
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === false) {
        potentials[y][x] = false;
      }
    }
  }
  // при работе с матрицами мы сначала обращаемся к у координате, а потом к х
  potentials[y2][x2] = 0;

  while (potentials[y1][x1] === null) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (potentials[y][x] === false || potentials[y][x] === null) {
          continue;
        }

        const number = potentials[y][x] + 1;
        // верхняя ячейка
        if (y > 0 && potentials[y - 1][x] !== false) {
          if (potentials[y - 1][x] === null) {
            potentials[y - 1][x] = number;
          } else {
            potentials[y - 1][x] = Math.min(potentials[y - 1][x], number);
          }
        }
        // нижняя ячейка
        if (y < matrix.length - 1 && potentials[y + 1][x] !== false) {
          if (potentials[y + 1][x] === null) {
            potentials[y + 1][x] = number;
          } else {
            potentials[y + 1][x] = Math.min(potentials[y + 1][x], number);
          }
        }
        // левая ячейка
        if (x > 0 && potentials[y][x - 1] !== false) {
          if (potentials[y][x - 1] === null) {
            potentials[y][x - 1] = number;
          } else {
            potentials[y][x - 1] = Math.min(potentials[y][x - 1], number);
          }
        }
        // правая ячейка
        if (x < matrix[0].length && potentials[y][x + 1] !== false) {
          if (potentials[y][x + 1] === null) {
            potentials[y][x + 1] = number;
          } else {
            potentials[y][x + 1] = Math.min(potentials[y][x + 1], number);
          }
        }
      }
    }
  }
  return potentials;
}