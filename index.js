const ROWS_COUNT = 16;
const COLUMNS_COUNT = 16;
const MINES_COUNT = 4;
const CELLS_COUNT = ROWS_COUNT * COLUMNS_COUNT;

const table = document.getElementById("table");
const gameStatusBtn = document.getElementById("btn-reset");

let arr;
let mines;
let flags;

let isGameStarted = false;
let flagsBoardCount;
let openedCellsCount;
let timerSeconds;
let interval;
let buttons;

class Cell {
  constructor(num) {
    this.num = num;
    this.status = "closed";
  }
}

const changeGameStatus = (status) => {
  gameStatusBtn.className = "btn-reset btn-reset-" + status;
};

const smile = () => {
  gameStatusBtn.className = "btn-reset";
};

const getCellElement = (index) => {
  return table.childNodes[0].childNodes[Math.floor(index / COLUMNS_COUNT)]
    .childNodes[index % ROWS_COUNT];
};

const getCellIndex = (target) => {
  return target.parentNode.rowIndex * ROWS_COUNT + target.cellIndex;
};

const fillBoard = () => {
  table.innerHTML = `<tr>${'<td class="cell"></td>'.repeat(
    COLUMNS_COUNT
  )}</tr>`.repeat(ROWS_COUNT);
};

const setMinesBoard = () => {
  if (flagsBoardCount < 0) return;
  document.getElementById("mines-third").className = `number num-${
    flagsBoardCount % 10
  }`;
  document.getElementById("mines-sec").className = `number num-${Math.floor(
    (flagsBoardCount % 100) / 10
  )}`;
  document.getElementById("mines-first").className = `number num-${Math.floor(
    (flagsBoardCount % 1000) / 100
  )}`;
};

const setTimeBoard = () => {
  if (timerSeconds > 999) return;
  document.getElementById("seconds-third").className = `number num-${
    timerSeconds % 10
  }`;
  document.getElementById("seconds-sec").className = `number num-${Math.floor(
    (timerSeconds % 100) / 10
  )}`;
  document.getElementById("seconds-first").className = `number num-${Math.floor(
    (timerSeconds % 1000) / 100
  )}`;
};

const tickTimer = () => {
  timerSeconds++;
  setTimeBoard();
};

const openCell = (index) => {
  if (arr[index].status !== "closed" && arr[index].status !== "unknown") return;
  const target = getCellElement(index);
  arr[index].status = "opened";
  openedCellsCount++;
  if (arr[index].status === "unknown") {
    target.classList.replace("cell-unknown-active", `cell-${arr[index].num}`);
  } else {
    target.classList.remove("cell-0");
    target.classList.add(`cell-${arr[index].num}`);
  }
  if (arr[index].num) return;
  if (arr[index - COLUMNS_COUNT]) {
    openCell(index - COLUMNS_COUNT);
  }
  if (arr[index + COLUMNS_COUNT]) {
    openCell(index + COLUMNS_COUNT);
  }
  if (index % COLUMNS_COUNT && arr[index - 1]) {
    openCell(index - 1);
  }
  if ((index + 1) % COLUMNS_COUNT && arr[index + 1]) {
    openCell(index + 1);
  }
  if ((index + 1) % COLUMNS_COUNT && arr[index - COLUMNS_COUNT + 1]) {
    openCell(index - COLUMNS_COUNT + 1);
  }
  if ((index + 1) % COLUMNS_COUNT && arr[index + COLUMNS_COUNT + 1]) {
    openCell(index + COLUMNS_COUNT + 1);
  }
  if (index % COLUMNS_COUNT && arr[index - COLUMNS_COUNT - 1]) {
    openCell(index - COLUMNS_COUNT - 1);
  }
  if (index % COLUMNS_COUNT && arr[index + COLUMNS_COUNT - 1]) {
    openCell(index + COLUMNS_COUNT - 1);
  }
};

const handleCellMouseOver = (event) => {
  const target = event.target;
  if (target.tagName != "TD" || event.buttons !== 1) return;
  const index = getCellIndex(target);
  if (arr[index]?.status === "closed" || !isGameStarted) {
    target.classList.add("cell-0");
  } else if (arr[index]?.status === "unknown") {
    target.classList.add("cell-unknown-active");
  }
};

const handleCellMouseOut = (event) => {
  const target = event.target;
  if (target.tagName != "TD") return;
  const index = getCellIndex(target);
  if (arr[index]?.status === "closed" || !isGameStarted) {
    target.classList.remove("cell-0");
  } else if (arr[index]?.status === "unknown") {
    target.classList.remove("cell-unknown-active");
  }
};

const handleFirstStep = (index) => {
  while (mines.size < MINES_COUNT) {
    const tmp = Math.round(Math.random() * (CELLS_COUNT - 1));
    if (tmp !== index) mines.add(tmp);
  }
  for (let i = 0; i < CELLS_COUNT; i++) {
    if (mines.has(i)) {
      arr.push(new Cell(-1));
    } else {
      const cellNUm =
        0 +
        mines.has(i - COLUMNS_COUNT) +
        mines.has(i + COLUMNS_COUNT) +
        (i % COLUMNS_COUNT && mines.has(i - 1)) +
        (i % COLUMNS_COUNT && mines.has(i - COLUMNS_COUNT - 1)) +
        (i % COLUMNS_COUNT && mines.has(i + COLUMNS_COUNT - 1)) +
        ((i + 1) % COLUMNS_COUNT && mines.has(i - COLUMNS_COUNT + 1)) +
        ((i + 1) % COLUMNS_COUNT && mines.has(i + COLUMNS_COUNT + 1)) +
        ((i + 1) % COLUMNS_COUNT && mines.has(i + 1));
      arr.push(new Cell(cellNUm));
    }
  }
  interval = setInterval(tickTimer, 1000);
  isGameStarted = true;
};

const handleCellMouseDown = (event) => {
  buttons = event.buttons;
  const target = event.target;
  if (target.tagName != "TD" || (buttons !== 1 && buttons !== 2)) return;
  const index = getCellIndex(target);
  if (!event.button) {
    changeGameStatus("cell-active");
    if (arr[index]?.status === "unknown") {
      target.classList.add("cell-unknown-active");
    } else if (arr[index]?.status === "closed" || !isGameStarted)
      target.classList.add("cell-0");
  } else if (
    event.button === 2 &&
    buttons === 2 &&
    arr[index]?.status !== "opened"
  ) {
    if (!isGameStarted) {
      handleFirstStep(index);
    }
    if (arr[index].status === "closed") {
      arr[index].status = "flagged";
      flags.add(index);
      flagsBoardCount--;
      target.classList.add("cell-flagged");
    } else if (arr[index].status === "flagged") {
      arr[index].status = "unknown";
      flags.delete(index);
      flagsBoardCount++;
      target.classList.replace("cell-flagged", "cell-unknown");
    } else if (arr[index].status === "unknown") {
      arr[index].status = "closed";
      target.classList.remove("cell-unknown");
    }
    setMinesBoard();
  }
};

const failGame = (target) => {
  changeGameStatus("fail");
  stopGame();
  mines.forEach((m) => {
    const cell =
      table.childNodes[0].childNodes[Math.floor(m / COLUMNS_COUNT)].childNodes[
        m % ROWS_COUNT
      ];
    if (cell !== target) cell.classList.add("cell-bomb");
  });
  flags.forEach((f) => {
    const cell =
      table.childNodes[0].childNodes[Math.floor(f / COLUMNS_COUNT)].childNodes[
        f % ROWS_COUNT
      ];
    if (arr[f].num !== -1) {
      cell.classList.replace("cell-flagged", "cell-flagged-bomb");
    }
  });
};

const winGame = () => {
  flagsBoardCount = 0;
  changeGameStatus("win");
  stopGame();
  mines.forEach((m) => {
    const cell =
      table.childNodes[0].childNodes[Math.floor(m / COLUMNS_COUNT)].childNodes[
        m % ROWS_COUNT
      ];
    if (arr[m].status !== "flagged") cell.classList.add("cell-flagged");
  });
};

const handleCellMouseUp = (event) => {
  const target = event.target;
  if (target.tagName != "TD") return;
  const index = getCellIndex(target);
  if (!event.button && buttons === 1) {
    if (!isGameStarted) {
      handleFirstStep(index);
    }
    if (arr[index].status === "closed" || arr[index].status === "unknown") {
      openCell(index);
      if (arr[index].num === -1) {
        failGame(target);
      } else if (CELLS_COUNT - openedCellsCount === MINES_COUNT) {
        winGame();
      }
    }
  }
};

const startGame = () => {
  flagsBoardCount = MINES_COUNT;
  timerSeconds = 0;
  openedCellsCount = 0;
  arr = [];
  flags = new Set();
  mines = new Set();
  setMinesBoard();
  setTimeBoard();
  fillBoard();
  table.addEventListener("mousedown", handleCellMouseDown);
  table.addEventListener("mouseup", handleCellMouseUp);
  table.addEventListener("mouseover", handleCellMouseOver);
  table.addEventListener("mouseout", handleCellMouseOut);
  this.addEventListener("mouseup", smile);
};

const stopGame = () => {
  clearInterval(interval);
  isGameStarted = false;
  setMinesBoard();
  table.removeEventListener("mousedown", handleCellMouseDown);
  table.removeEventListener("mouseup", handleCellMouseUp);
  table.removeEventListener("mouseover", handleCellMouseOver);
  table.removeEventListener("mouseout", handleCellMouseOut);
  this.removeEventListener("mouseup", smile);
};

const resetGame = () => {
  isGameStarted && stopGame();
  smile();
  startGame();
};

gameStatusBtn.addEventListener("click", resetGame);
startGame();

