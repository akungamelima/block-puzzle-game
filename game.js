// ===== BLOCK PUZZLE GAME ENGINE =====

const GRID_SIZE = 10;
const COLORS = [
    '#6c63ff', '#ff6584', '#43e97b', '#f7971e',
    '#38f9d7', '#fa709a', '#fee140', '#30cfd0',
    '#a18cd1', '#ff9a9e'
];

const SHAPES = [
    // Single
    { cells: [[0,0]], color: COLORS[0] },
    // Dominoes
    { cells: [[0,0],[0,1]], color: COLORS[1] },
    { cells: [[0,0],[1,0]], color: COLORS[2] },
    // Trominoes
    { cells: [[0,0],[0,1],[0,2]], color: COLORS[3] },
    { cells: [[0,0],[1,0],[2,0]], color: COLORS[4] },
    { cells: [[0,0],[0,1],[1,0]], color: COLORS[5] },
    { cells: [[0,0],[0,1],[1,1]], color: COLORS[6] },
    { cells: [[0,0],[1,0],[1,1]], color: COLORS[7] },
    { cells: [[0,1],[1,0],[1,1]], color: COLORS[8] },
    // Tetrominoes
    { cells: [[0,0],[0,1],[0,2],[0,3]], color: COLORS[9] },
    { cells: [[0,0],[1,0],[2,0],[3,0]], color: COLORS[0] },
    { cells: [[0,0],[0,1],[0,2],[1,2]], color: COLORS[1] },
    { cells: [[0,0],[1,0],[2,0],[2,1]], color: COLORS[2] },
    { cells: [[0,0],[0,1],[1,0],[1,1]], color: COLORS[3] },
    { cells: [[0,1],[0,2],[1,0],[1,1]], color: COLORS[4] },
    { cells: [[0,0],[0,1],[1,1],[1,2]], color: COLORS[5] },
    { cells: [[0,0],[1,0],[1,1],[2,1]], color: COLORS[6] },
    { cells: [[0,1],[1,0],[1,1],[2,0]], color: COLORS[7] },
    // L shapes
    { cells: [[0,0],[1,0],[2,0],[2,1]], color: COLORS[8] },
    { cells: [[0,0],[0,1],[0,2],[1,0]], color: COLORS[9] },
    { cells: [[0,0],[0,1],[1,1],[2,1]], color: COLORS[0] },
    { cells: [[0,2],[1,0],[1,1],[1,2]], color: COLORS[1] },
    // 2x2 square
    { cells: [[0,0],[0,1],[1,0],[1,1]], color: COLORS[2] },
    // 3x3
    { cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]], color: COLORS[3] },
    // Plus
    { cells: [[0,1],[1,0],[1,1],[1,2],[2,1]], color: COLORS[4] },
    // Corner
    { cells: [[0,0],[1,0],[1,1]], color: COLORS[5] },
    { cells: [[0,1],[1,0],[1,1]], color: COLORS[6] },
    { cells: [[0,0],[0,1],[1,1]], color: COLORS[7] },
    { cells: [[0,0],[0,1],[1,0]], color: COLORS[8] },
];

// ===== STATE =====
let grid = [];
let score = 0;
let bestScore = 0;
let level = 1;
let pieces = [];
let selectedPieceIdx = -1;
let isGameOver = false;
let isPaused = false;
let hoverCell = { r: -1, c: -1 };
let gameStarted = false;
let animating = [];

// ===== CANVAS =====
let canvas, ctx;
let cellSize;

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    const isMobile = window.innerWidth <= 600;
    const boardPx = isMobile ? 320 : 400;
    canvas.width = boardPx;
    canvas.height = boardPx;
    cellSize = boardPx / GRID_SIZE;

    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasHover);
    canvas.addEventListener('touchstart', onCanvasTouch, { passive: false });
    canvas.addEventListener('mouseleave', () => { hoverCell = { r: -1, c: -1 }; drawBoard(); });

    window.addEventListener('resize', () => {
        const isMob = window.innerWidth <= 600;
        const bp = isMob ? 320 : 400;
        canvas.width = bp; canvas.height = bp;
        cellSize = bp / GRID_SIZE;
        drawBoard();
    });
}

// ===== GRID =====
function initGrid() {
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

// ===== PIECES =====
function generatePieces() {
    pieces = [];
    for (let i = 0; i < 3; i++) {
        pieces.push(randomShape());
    }
    selectedPieceIdx = -1;
    renderPieceTray();
}

function randomShape() {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return JSON.parse(JSON.stringify(s));
}

// ===== DRAW =====
function drawBoard() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#16162a';
    ctx.roundRect(0, 0, canvas.width, canvas.height, 8);
    ctx.fill();

    // Grid cells
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const x = c * cellSize;
            const y = r * cellSize;
            const val = grid[r][c];

            if (val) {
                // Filled cell
                ctx.fillStyle = val;
                roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
                ctx.fill();

                // Shine
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                roundRect(ctx, x + 3, y + 3, cellSize - 6, 5, 2);
                ctx.fill();
            } else {
                // Empty cell
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 1;
                roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
                ctx.stroke();
            }
        }
    }

    // Hover preview
    if (selectedPieceIdx >= 0 && hoverCell.r >= 0 && !isGameOver && !isPaused) {
        const piece = pieces[selectedPieceIdx];
        if (piece && !piece.used) {
            const canPlace = canPlacePiece(piece, hoverCell.r, hoverCell.c);
            piece.cells.forEach(([dr, dc]) => {
                const pr = hoverCell.r + dr;
                const pc = hoverCell.c + dc;
                if (pr >= 0 && pr < GRID_SIZE && pc >= 0 && pc < GRID_SIZE) {
                    ctx.fillStyle = canPlace
                        ? hexToRgba(piece.color, 0.65)
                        : 'rgba(255,80,80,0.35)';
                    roundRect(ctx, pc * cellSize + 1, pr * cellSize + 1, cellSize - 2, cellSize - 2, 4);
                    ctx.fill();
                }
            });
        }
    }

    // Animating clears
    animating.forEach(a => {
        ctx.fillStyle = `rgba(255,255,255,${a.alpha})`;
        if (a.type === 'row') {
            ctx.fillRect(0, a.index * cellSize, canvas.width, cellSize);
        } else {
            ctx.fillRect(a.index * cellSize, 0, cellSize, canvas.height);
        }
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ===== PIECE TRAY =====
function renderPieceTray() {
    const tray = document.getElementById('pieceTray');
    tray.innerHTML = '';

    pieces.forEach((piece, idx) => {
        const container = document.createElement('div');
        container.className = 'piece-container' + (piece.used ? ' used' : '') + (idx === selectedPieceIdx ? ' selected' : '');
        container.addEventListener('click', () => selectPiece(idx));

        // Find bounds
        const maxR = Math.max(...piece.cells.map(c => c[0]));
        const maxC = Math.max(...piece.cells.map(c => c[1]));
        const rows = maxR + 1;
        const cols = maxC + 1;
        const cellPx = Math.min(52 / Math.max(rows, cols), 18);

        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = cols * cellPx + 4;
        pieceCanvas.height = rows * cellPx + 4;
        pieceCanvas.style.display = 'block';

        const pCtx = pieceCanvas.getContext('2d');
        piece.cells.forEach(([r, c]) => {
            pCtx.fillStyle = piece.used ? '#444' : piece.color;
            pCtx.beginPath();
            pCtx.roundRect(c * cellPx + 1, r * cellPx + 1, cellPx - 2, cellPx - 2, 3);
            pCtx.fill();
            if (!piece.used) {
                pCtx.fillStyle = 'rgba(255,255,255,0.2)';
                pCtx.beginPath();
                pCtx.roundRect(c * cellPx + 2, r * cellPx + 2, cellPx - 4, 3, 2);
                pCtx.fill();
            }
        });

        container.appendChild(pieceCanvas);
        tray.appendChild(container);
    });
}

function selectPiece(idx) {
    if (!gameStarted || isGameOver || isPaused) return;
    if (pieces[idx] && !pieces[idx].used) {
        selectedPieceIdx = selectedPieceIdx === idx ? -1 : idx;
        renderPieceTray();
        drawBoard();
    }
}

// ===== PLACE PIECE =====
function canPlacePiece(piece, row, col) {
    return piece.cells.every(([dr, dc]) => {
        const r = row + dr, c = col + dc;
        return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid[r][c] === null;
    });
}

function placePiece(piece, row, col) {
    piece.cells.forEach(([dr, dc]) => {
        grid[row + dr][col + dc] = piece.color;
    });
}

function onCanvasClick(e) {
    if (!gameStarted || isGameOver || isPaused) return;
    if (selectedPieceIdx < 0) return;
    const { r, c } = getCellFromEvent(e);
    const piece = pieces[selectedPieceIdx];
    if (!piece || piece.used) return;
    if (canPlacePiece(piece, r, c)) {
        placePiece(piece, r, c);
        score += piece.cells.length;
        piece.used = true;
        selectedPieceIdx = -1;
        clearLines();
        updateScoreDisplay();
        checkLevelUp();
        renderPieceTray();
        drawBoard();

        // All pieces used → new batch
        if (pieces.every(p => p.used)) {
            generatePieces();
        }

        // Check game over
        if (!canAnyPieceBePlaced()) {
            triggerGameOver();
        }
    }
}

function onCanvasHover(e) {
    if (!gameStarted || isGameOver || isPaused) return;
    const { r, c } = getCellFromEvent(e);
    if (hoverCell.r !== r || hoverCell.c !== c) {
        hoverCell = { r, c };
        drawBoard();
    }
}

function onCanvasTouch(e) {
    e.preventDefault();
    if (!gameStarted || isGameOver || isPaused) return;
    const touch = e.touches[0];
    const { r, c } = getCellFromEvent(touch);
    hoverCell = { r, c };
    // On tap, place the piece
    if (selectedPieceIdx >= 0) {
        const piece = pieces[selectedPieceIdx];
        if (piece && !piece.used && canPlacePiece(piece, r, c)) {
            placePiece(piece, r, c);
            score += piece.cells.length;
            piece.used = true;
            selectedPieceIdx = -1;
            clearLines();
            updateScoreDisplay();
            checkLevelUp();
            renderPieceTray();
            drawBoard();
            if (pieces.every(p => p.used)) generatePieces();
            if (!canAnyPieceBePlaced()) triggerGameOver();
        }
    }
}

function getCellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return {
        r: Math.floor(y / cellSize),
        c: Math.floor(x / cellSize)
    };
}

// ===== CLEAR LINES =====
function clearLines() {
    const rowsToClear = [];
    const colsToClear = [];

    for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r].every(c => c !== null)) rowsToClear.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
        if (grid.every(row => row[c] !== null)) colsToClear.push(c);
    }

    const total = rowsToClear.length + colsToClear.length;
    if (total === 0) return;

    // Animate flash
    const flashes = [
        ...rowsToClear.map(i => ({ type: 'row', index: i, alpha: 0.8 })),
        ...colsToClear.map(i => ({ type: 'col', index: i, alpha: 0.8 }))
    ];
    animating = flashes;
    drawBoard();

    setTimeout(() => {
        animating = [];
        rowsToClear.forEach(r => { grid[r] = Array(GRID_SIZE).fill(null); });
        colsToClear.forEach(c => { grid.forEach(row => { row[c] = null; }); });

        // Scoring: base 10 per line, combo bonus
        const base = total * 10 * GRID_SIZE;
        const comboBonus = total > 1 ? total * total * 15 : 0;
        score += base + comboBonus;
        updateScoreDisplay();

        if (total >= 2) showCombo(total);
        drawBoard();
    }, 200);
}

function showCombo(count) {
    const msgs = {
        2: '🔥 DOUBLE!',
        3: '💥 TRIPLE!',
        4: '⚡ QUAD!',
    };
    const msg = msgs[count] || `✨ x${count} COMBO!`;
    const el = document.getElementById('comboMsg');
    el.textContent = msg;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 900);
}

// ===== SCORING =====
function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = score.toLocaleString();
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('blockpuzzle_best', bestScore);
        document.getElementById('bestScoreDisplay').textContent = bestScore.toLocaleString();
    }
    document.getElementById('levelDisplay').textContent = level;
}

function checkLevelUp() {
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel;
        updateScoreDisplay();
    }
}

// ===== CAN ANY PIECE BE PLACED? =====
function canAnyPieceBePlaced() {
    return pieces.some(piece => {
        if (piece.used) return false;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (canPlacePiece(piece, r, c)) return true;
            }
        }
        return false;
    });
}

// ===== GAME OVER =====
function triggerGameOver() {
    isGameOver = true;
    gameStarted = false;
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('finalBest').textContent = bestScore.toLocaleString();
    document.getElementById('gameOverModal').classList.add('show');
}

// ===== START / RESTART =====
function startGame() {
    isGameOver = false;
    isPaused = false;
    gameStarted = true;
    score = 0;
    level = 1;
    initGrid();
    generatePieces();
    updateScoreDisplay();
    drawBoard();

    // Hide overlay
    document.getElementById('boardOverlay').classList.add('hidden');
    document.getElementById('gameOverModal').classList.remove('show');

    // Scroll to game
    document.getElementById('game-section').scrollIntoView({ behavior: 'smooth' });
}

function restartGame() {
    document.getElementById('gameOverModal').classList.remove('show');
    startGame();
}

function togglePause() {
    if (!gameStarted && !isPaused) return;
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '▶ Lanjut' : '⏸ Pause';

    if (isPaused) {
        const overlay = document.getElementById('boardOverlay');
        const content = document.getElementById('overlayContent');
        overlay.classList.remove('hidden');
        content.innerHTML = `
            <div class="start-screen">
                <div class="start-icon">⏸</div>
                <h2>Game Dijeda</h2>
                <p>Klik tombol Lanjut untuk melanjutkan</p>
                <button class="btn-start" onclick="togglePause()">▶ Lanjut</button>
            </div>`;
    } else {
        document.getElementById('boardOverlay').classList.add('hidden');
        document.getElementById('overlayContent').innerHTML = `<div class="start-screen" id="startScreen"></div>`;
    }
}

// ===== PREVIEW GRID ANIMATION =====
function initPreviewGrid() {
    const grid = document.getElementById('previewGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const cells = [];
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'preview-cell';
        grid.appendChild(cell);
        cells.push(cell);
    }

    const previewColors = ['#6c63ff','#ff6584','#43e97b','#f7971e','#38f9d7','#fa709a'];
    const patterns = [
        [0,1,2,10,11,12,20,21,22],
        [33,34,35,43,44,45,53,54,55],
        [66,67,77,78],
        [88,89,90,98,99],
        [4,5,14,15,24,25],
        [70,71,72,80],
    ];

    let patternIdx = 0;
    function animateNext() {
        const prev = patterns[(patternIdx - 1 + patterns.length) % patterns.length];
        prev.forEach(i => {
            cells[i].style.background = 'var(--bg2)';
            cells[i].classList.remove('filled');
        });
        const p = patterns[patternIdx % patterns.length];
        const color = previewColors[patternIdx % previewColors.length];
        p.forEach((i, j) => {
            setTimeout(() => {
                cells[i].style.background = color;
                cells[i].classList.add('filled');
            }, j * 40);
        });
        patternIdx++;
        setTimeout(animateNext, 1800);
    }
    setTimeout(animateNext, 600);
}

// ===== MOBILE MENU =====
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    // Load best score
    bestScore = parseInt(localStorage.getItem('blockpuzzle_best') || '0');
    document.getElementById('bestScoreDisplay').textContent = bestScore.toLocaleString();

    initCanvas();
    initPreviewGrid();
    drawBoard();
});

function closeMobileMenu() {
    document.getElementById('mobileNav').classList.remove('open');
}

function scrollToTutorial() {
    document.getElementById('tutorial-section').scrollIntoView({ behavior: 'smooth' });
}
