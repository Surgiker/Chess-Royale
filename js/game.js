// ========== GAME ==========

function initGame() {
    const fen = buildFEN();
    State.chess = new Chess(fen);
    State.currentTurn = Math.random() < 0.5 ? 'white' : 'black';
    State.captured = { white: [], black: [] };
    State.gameOver = false;
    State.selectedSquare = null;
    State.lastMove = null;
    State.animating = false;
    
    const parts = fen.split(' ');
    parts[1] = State.currentTurn === 'white' ? 'w' : 'b';
    State.chess.load(parts.join(' '));
    
    createGameBoard();
    updateTurnIndicator();
    
    const needStep = State.speed === 'step' && (State.players.white === 'ai' || State.players.black === 'ai');
    $('next-move').style.display = needStep ? 'inline-block' : 'none';
    $('replay-move').style.display = 'none';
    
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

function getSquarePosition(square) {
    const sq = document.querySelector('#game-board [data-square="' + square + '"]');
    if (!sq) return null;
    const rect = sq.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function animateMove(from, to, pieceIcon, callback) {
    if (State.animating) {
        if (callback) callback();
        return;
    }
    
    State.animating = true;
    
    const fromPos = getSquarePosition(from);
    const toPos = getSquarePosition(to);
    
    if (!fromPos || !toPos) {
        State.animating = false;
        if (callback) callback();
        return;
    }
    
    // Hide the piece at destination temporarily
    const toSquare = document.querySelector('#game-board [data-square="' + to + '"]');
    const toPiece = toSquare.querySelector('.piece');
    if (toPiece) toPiece.classList.add('hidden');
    
    // Create animated piece
    const animPiece = document.createElement('span');
    animPiece.className = 'piece-animating';
    animPiece.textContent = pieceIcon;
    animPiece.style.left = fromPos.x + 'px';
    animPiece.style.top = fromPos.y + 'px';
    animPiece.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(animPiece);
    
    // Trigger animation
    requestAnimationFrame(() => {
        animPiece.style.left = toPos.x + 'px';
        animPiece.style.top = toPos.y + 'px';
    });
    
    // Cleanup after animation
    setTimeout(() => {
        animPiece.remove();
        if (toPiece) toPiece.classList.remove('hidden');
        State.animating = false;
        if (callback) callback();
    }, 320);
}

function replayLastMove() {
    if (!State.lastMove || State.animating) return;
    
    const move = State.lastMove;
    const pieceIcon = ICONS[move.color][move.piece];
    
    // Temporarily show piece at origin for animation
    const fromSquare = document.querySelector('#game-board [data-square="' + move.from + '"]');
    const toSquare = document.querySelector('#game-board [data-square="' + move.to + '"]');
    
    // Hide piece at destination
    const toPiece = toSquare.querySelector('.piece');
    if (toPiece) toPiece.classList.add('hidden');
    
    // Animate
    animateMove(move.from, move.to, pieceIcon, () => {
        if (toPiece) toPiece.classList.remove('hidden');
    });
}

function onGameSquareClick(sq) {
    if (State.gameOver || State.players[State.currentTurn] === 'ai' || State.animating) return;
    
    const square = sq.dataset.square;
    const piece = State.chess.get(square);
    const turn = State.chess.turn() === 'w' ? 'white' : 'black';
    
    if (State.selectedSquare) {
        // Get piece info before move for animation
        const movingPiece = State.chess.get(State.selectedSquare);
        const pieceIcon = movingPiece ? ICONS[turn][movingPiece.type] : null;
        
        const move = State.chess.move({ from: State.selectedSquare, to: square, promotion: 'q' });
        
        if (move) {
            if (move.captured) State.captured[State.currentTurn].push(move.captured);
            
            // Store last move
            State.lastMove = {
                from: move.from,
                to: move.to,
                piece: move.piece,
                color: turn
            };
            
            const fromSquare = State.selectedSquare;
            State.selectedSquare = null;
            
            // Animate then update
            animateMove(fromSquare, square, pieceIcon, () => {
                updateGameBoard();
                $('replay-move').style.display = 'inline-block';
                checkGameEnd();
                if (!State.gameOver) {
                    State.currentTurn = State.currentTurn === 'white' ? 'black' : 'white';
                    updateTurnIndicator();
                    maybeAIMove();
                }
            });
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
    $('turn-indicator').innerHTML = t('turn') + ' ' + icon + ' ' + name + ai + (State.thinking ? '<span class="loading"></span>' : '');
}

function maybeAIMove() {
    if (State.gameOver || State.players[State.currentTurn] !== 'ai') return;
    
    if (State.speed === 'instant') doAIMove();
    else if (State.speed === 'timed') setTimeout(doAIMove, 1000);
    // step: wait for button
}

function doAIMove() {
    if (State.thinking || State.gameOver || State.animating) return;
    State.thinking = true;
    updateTurnIndicator();
    
    setTimeout(() => {
        const move = AI.getBestMove(State.chess);
        if (move) {
            const turn = State.currentTurn;
            const pieceIcon = ICONS[turn][move.piece];
            const fromSquare = move.from;
            const toSquare = move.to;
            
            const result = State.chess.move(move);
            if (result) {
                if (result.captured) State.captured[State.currentTurn].push(result.captured);
                
                // Store last move
                State.lastMove = {
                    from: result.from,
                    to: result.to,
                    piece: result.piece,
                    color: turn
                };
            }
            
            State.thinking = false;
            updateTurnIndicator();
            
            // Animate then continue
            animateMove(fromSquare, toSquare, pieceIcon, () => {
                updateGameBoard();
                $('replay-move').style.display = 'inline-block';
                checkGameEnd();
                if (!State.gameOver) {
                    State.currentTurn = State.currentTurn === 'white' ? 'black' : 'white';
                    updateTurnIndicator();
                    maybeAIMove();
                }
            });
        } else {
            State.thinking = false;
            updateTurnIndicator();
            updateGameBoard();
            checkGameEnd();
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
        if (State.players[State.currentTurn] === 'ai' && !State.thinking && !State.animating) doAIMove();
    };
    
    $('replay-move').onclick = function() {
        replayLastMove();
    };
    
    $('new-game').onclick = $('modal-new-game').onclick = function() {
        $('game-end-modal').classList.remove('active');
        showScreen('setup-screen');
    };
}
