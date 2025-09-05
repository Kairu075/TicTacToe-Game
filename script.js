const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");
const newGameBtn = document.getElementById("newGame");
const resetScoreBtn = document.getElementById("resetScore");
const themeToggle = document.getElementById("themeToggle");

const pvpBtn = document.getElementById("pvpBtn");
const cpuBtn = document.getElementById("cpuBtn");
const difficultyEl = document.getElementById("difficulty");

let board, currentPlayer, gameActive, scores, vsCPU, difficulty;

function init() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameActive = true;
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    boardEl.appendChild(cell);
  }
  statusEl.textContent = "Player X's turn";
}

function handleCellClick(e) {
  const idx = e.target.dataset.index;
  if (!gameActive || board[idx]) return;
  place(idx, currentPlayer);
  if (checkWin(board, currentPlayer)) {
    endGame(false);
  } else if (board.every(c => c)) {
    endGame(true);
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusEl.textContent = `Player ${currentPlayer}'s turn`;

    if (vsCPU && currentPlayer === "O" && gameActive) {
      setTimeout(cpuMove, 500);
    }
  }
}

function place(idx, player) {
  board[idx] = player;
  const cell = boardEl.children[idx];
  cell.textContent = player;
  cell.classList.add(player);
}

function cpuMove() {
  let idx;
  if (difficulty === "easy") {
    const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
    idx = empty[Math.floor(Math.random() * empty.length)];
  } else if (difficulty === "medium") {
    idx = findBestMove(board, "O", false) ?? randomMove();
  } else {
    idx = findBestMove(board, "O", true);
  }
  place(idx, "O");
  if (checkWin(board, "O")) {
    endGame(false);
  } else if (board.every(c => c)) {
    endGame(true);
  } else {
    currentPlayer = "X";
    statusEl.textContent = "Player X's turn";
  }
}

function randomMove() {
  const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function endGame(draw) {
  gameActive = false;
  if (draw) {
    statusEl.textContent = "Draw!";
    scores.draws++;
    drawsEl.textContent = scores.draws;
  } else {
    statusEl.textContent = `Player ${currentPlayer} wins!`;
    highlightWin(board, currentPlayer);
    if (currentPlayer === "X") {
      scores.x++;
      xWinsEl.textContent = scores.x;
    } else {
      scores.o++;
      oWinsEl.textContent = scores.o;
    }
  }
}

function checkWin(b, p) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(line => line.every(i => b[i] === p));
}

function highlightWin(b, p) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  wins.forEach(line => {
    if (line.every(i => b[i] === p)) {
      line.forEach(i => boardEl.children[i].classList.add("win"));
    }
  });
}

function findBestMove(b, player, hardMode) {
  if (hardMode) {
    let bestScore = -Infinity, move;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = player;
        let score = minimax(b, 0, false);
        b[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  } else {
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = player;
        if (checkWin(b, player)) {
          b[i] = null;
          return i;
        }
        b[i] = null;
      }
    }
    return null;
  }
}

function minimax(b, depth, isMaximizing) {
  if (checkWin(b, "O")) return 10 - depth;
  if (checkWin(b, "X")) return depth - 10;
  if (b.every(c => c)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = "O";
        let score = minimax(b, depth + 1, false);
        b[i] = null;
        best = Math.max(score, best);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = "X";
        let score = minimax(b, depth + 1, true);
        b[i] = null;
        best = Math.min(score, best);
      }
    }
    return best;
  }
}

/* Buttons */
newGameBtn.addEventListener("click", init);
resetScoreBtn.addEventListener("click", () => {
  scores = { x:0, o:0, draws:0 };
  xWinsEl.textContent = oWinsEl.textContent = drawsEl.textContent = 0;
  init();
});

/* Theme toggle */
themeToggle.addEventListener("change", () => {
  document.body.className = themeToggle.checked ? "light" : "dark";
});

/* Mode select */
pvpBtn.addEventListener("click", () => {
  vsCPU = false;
  pvpBtn.classList.add("active");
  cpuBtn.classList.remove("active");
  difficultyEl.style.display = "none";
  init();
});
cpuBtn.addEventListener("click", () => {
  vsCPU = true;
  cpuBtn.classList.add("active");
  pvpBtn.classList.remove("active");
  difficultyEl.style.display = "block";
  init();
});

/* Difficulty change */
document.querySelectorAll('input[name="level"]').forEach(radio => {
  radio.addEventListener("change", () => {
    difficulty = radio.value;
  });
});

/* Start */
scores = { x:0, o:0, draws:0 };
vsCPU = false;
difficulty = "easy";
init();
