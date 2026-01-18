// ========== GAME ==========

function initGame() {
    const fen = buildFEN();
    State.chess = new Chess(fen);
    State.currentTurn = Math.random() < 0.5 ? 'white' : 'black';
    State.captured = { white: [], black: [] };
    State.gameOver = false;
    State.selectedSquare = null;
    State.lastMove = null;
    
    const parts = fen.split(' ');
    parts[1] = State.currentTurn === 'white' ? 'w' : 'b';
    State.chess.load(parts.join(' '));
    
    createGameBoard();
    updateTurnIndicator();
    
    const needStep = State.speed === 'step' && (State.players.white === 'ai' || State.players.black === 'ai');
    $('next-move').style.display = needStep ? 'inline-block' : 'none';
    
    maybeAIMove();
}

function buildFEN() {
    const board = [];
    for (let r = 0; r < 8; r++) {
        board.push([null, null, null, null, null, null, null, null]);
    }
    
    ['white', 'black'].forEach(color => {
        for (const sq in State.positions[color]) {
            const data = State.positions[color][sq];
            const f = sq.charCodeAt(0) - 97;
            const r = 8 - parseInt(sq[1]);
            board[r][f] = color === 'white' ? data.piece.toUpperCase() : data.piece;
        }
    });
    
    let fen = '';
    for (let r = 0; r < 8; r++) {
        let empty = 0;
        for (let f = 0; f < 8; f++) {
            if (board[r][f]) {
                if (empty) { fen += empty; empty = 0; }
                fen += board[r][f];
            } else empty++;
        }
        if (empty) fen += empty;
        if (r < 7) fen += '/';
    }
    return fen + ' w - - 0 1';
}

function createGameBoard() {
    const board = $('game-board');
    board.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const sq = document.createElement('div');
            sq.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
            
            const file = String.fromCharCode(97 + col);
            const rank = 8 - row;
            sq.dataset.square = file + rank;
            
            if (col === 0) {
                const lbl = document.createElement('span');
                lbl.className = 'row-label';
                lbl.textContent = rank;
                sq.appendChild(lbl);
            }
            if (row === 7) {
                const lbl = document.createElement('span');
                lbl.className = 'col-label';
                lbl.textContent = file;
                sq.appendChild(lbl);
            }
            
            (function(square) {
                square.onclick = function() { onGameSquareClick(square); };
            })(sq);
            board.appendChild(sq);
        }
    }
    updateGameBoard();
}

function updateGameBoard() {
    document.querySelectorAll('#game-board .square').forEach(sq => {
        sq.classList.remove('highlight', 'valid-move', 'last-move', 'check');
        
        const labels = sq.querySelectorAll('.row-label, .col-label');
        sq.innerHTML = '';
        labels.forEach(l => sq.appendChild(l));
        
        const piece = State.chess.get(sq.dataset.square);
        if (piece) {
            const color = piece.color === 'w' ? 'white' : 'black';
            const span = document.createElement('span');
            span.className = 'piece';
            span.textContent = ICONS[color][piece.type];
            sq.appendChild(span);
        }
        
        // Highlight last move squares
        if (State.lastMove) {
            if (sq.dataset.square === State.lastMove.from || sq.dataset.square === State.lastMove.to) {
                sq.classList.add('last-move');
            }
        }
    });
    
    if (State.chess.in_check()) {
        const kingPos = findKing(State.chess.turn());
        if (kingPos) document.querySelector('#game-board [data-square="' + kingPos + '"]').classList.add('check');
    }
    
    $('white-captured').textContent = State.captured.white.map(p => ICONS.black[p]).join('');
    $('black-captured').textContent = State.captured.black.map(p => ICONS.white[p]).join('');
}

function findKing(color) {
    for (let r = 1; r <= 8; r++) {
        for (let fi = 0; fi < 8; fi++) {
            const f = 'abcdefgh'[fi];
            const p = State.chess.get(f + r);
            if (p && p.type === 'k' && p.color === color) return f + r;
        }
    }
    return null;
}

function onGameSquareClick(sq) {
    if (State.gameOver || State.players[State.currentTurn] === 'ai') return;
    
    const square = sq.dataset.square;
    const piece = State.chess.get(square);
    const turn = State.chess.turn() === 'w' ? 'white' : 'black';
    
    if (State.selectedSquare) {
        const move = State.chess.move({ from: State.selectedSquare, to: square, promotion: 'q' });
        
        if (move) {
            if (move.captured) State.captured[State.currentTurn].push(move.captured);
            
            // Store last move for highlighting
            State.lastMove = {
                from: move.from,
                to: move.to
            };
            
            State.selectedSquare = null;
            updateGameBoard();
            checkGameEnd();
            if (!State.gameOver) {
                State.currentTurn = State.currentTurn === 'white' ? 'black' : 'white';
                updateTurnIndicator();
                maybeAIMove();
            }
        } else if (piece && piece.color === (turn === 'white' ? 'w' : 'b')) {
            selectGameSquare(square);
        } else {
            State.selectedSquare = null;
            updateGameBoard();
        }
    } else if (piece && piece.color === (turn === 'white' ? 'w' : 'b')) {
        selectGameSquare(square);
    }
}

function selectGameSquare(square) {
    State.selectedSquare = square;
    updateGameBoard();
    
    const sq = document.querySelector('#game-board [data-square="' + square + '"]');
    sq.classList.add('highlight');
    
    State.chess.moves({ square: square, verbose: true }).forEach(m => {
        document.querySelector('#game-board [data-square="' + m.to + '"]').classList.add('valid-move');
    });
}

function updateTurnIndicator() {
    const icon = State.currentTurn === 'white' ? '♔' : '♚';
    const name = State.currentTurn === 'white' ? t('white') : t('black');
    const ai = State.players[State.currentTurn] === 'ai' ? ' (' + t('ai') + ')' : '';
    const loading = State.thinking ? '<span class="loading"></span>' : '';
    $('turn-indicator').innerHTML = t('turn') + '<br>' + icon + ' ' + name + ai + loading;
}

function maybeAIMove() {
    if (State.gameOver || State.players[State.currentTurn] !== 'ai') return;
    
    if (State.speed === 'instant') doAIMove();
    else if (State.speed === 'timed') setTimeout(doAIMove, 1000);
    // step: wait for button
}

function doAIMove() {
    if (State.thinking || State.gameOver) return;
    State.thinking = true;
    updateTurnIndicator();
    
    setTimeout(() => {
        const move = AI.getBestMove(State.chess);
        if (move) {
            const result = State.chess.move(move);
            if (result) {
                if (result.captured) State.captured[State.currentTurn].push(result.captured);
                
                // Store last move for highlighting
                State.lastMove = {
                    from: result.from,
                    to: result.to
                };
            }
        }
        State.thinking = false;
        updateGameBoard();
        checkGameEnd();
        if (!State.gameOver) {
            State.currentTurn = State.currentTurn === 'white' ? 'black' : 'white';
            updateTurnIndicator();
            maybeAIMove();
        }
    }, 50);
}

function checkGameEnd() {
    if (!State.chess.game_over()) return;
    State.gameOver = true;
    
    let title, msg;
    if (State.chess.in_checkmate()) {
        title = t('checkmate');
        msg = State.currentTurn === 'white' ? t('whiteWins') : t('blackWins');
    } else {
        title = t('draw');
        msg = State.chess.in_stalemate() ? t('stalemate') : t('drawGame');
    }
    
    $('modal-title').textContent = title;
    $('modal-message').textContent = msg;
    $('game-end-modal').classList.add('active');
}

function setupGameButtons() {
    $('next-move').onclick = function() {
        if (State.players[State.currentTurn] === 'ai' && !State.thinking) doAIMove();
    };
    
    $('new-game').onclick = function() {
        resetToSetup();
    };
    
    $('modal-new-game').onclick = function() {
        $('game-end-modal').classList.remove('active');
        resetToSetup();
    };
}

function resetToSetup() {
    // Reset state
    State.manualSetup = false;
    State.armies = { white: [], black: [] };
    State.armiesConfirmed = { white: false, black: false };
    State.positions = { white: {}, black: {} };
    State.lastMove = null;
    State.gameOver = false;
    State.thinking = false;
    
    // Reset UI
    $('manual-setup').checked = false;
    
    showScreen('setup-screen');
}
