// ========== POSITIONING ==========

function initPositioning() {
    State.positions = { white: {}, black: {} };
    State.selectedTrayPiece = null;
    
    createPositioningBoard();
    updateTrays();
    
    ['white', 'black'].forEach(color => {
        $(color + '-tray').style.opacity = State.players[color] === 'ai' ? '0.5' : '1';
        if (State.players[color] === 'ai') autoPosition(color);
    });
    
    updatePositioningBoard();
    updatePositioningStatus();
}

function createPositioningBoard() {
    const board = $('positioning-board');
    board.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const sq = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            sq.className = 'square ' + (isLight ? 'light' : 'dark');
            
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
            
            // Click
            sq.addEventListener('click', () => onPositioningSquareClick(sq));
            
            // Drag over
            sq.addEventListener('dragover', e => {
                e.preventDefault();
                const r = parseInt(sq.dataset.square[1]);
                const types = e.dataTransfer.types;
                const dragColor = types.indexOf('white') >= 0 ? 'white' : (types.indexOf('black') >= 0 ? 'black' : null);
                if (dragColor) {
                    const valid = (dragColor === 'white' && r <= 2) || (dragColor === 'black' && r >= 7);
                    if (valid) sq.classList.add('drag-over');
                }
            });
            sq.addEventListener('dragleave', () => sq.classList.remove('drag-over'));
            sq.addEventListener('drop', e => {
                e.preventDefault();
                sq.classList.remove('drag-over');
                onDrop(sq, e.dataTransfer);
            });
            
            board.appendChild(sq);
        }
    }
}

function updateTrays() {
    ['white', 'black'].forEach(color => {
        const tray = $(color + '-tray-pieces');
        tray.innerHTML = '';
        
        const positioned = Object.values(State.positions[color]);
        const posIndices = [];
        positioned.forEach(p => { if (p.piece !== 'k') posIndices.push(p.index); });
        const kingPos = positioned.some(p => p.piece === 'k');
        
        if (!kingPos) tray.appendChild(createTrayPiece(color, 'k', -1));
        
        State.armies[color].forEach((p, i) => {
            if (posIndices.indexOf(i) < 0) tray.appendChild(createTrayPiece(color, p, i));
        });
    });
}

function createTrayPiece(color, piece, index) {
    const span = document.createElement('span');
    span.className = 'tray-piece';
    span.textContent = ICONS[color][piece];
    span.draggable = State.players[color] === 'human';
    
    span.onclick = () => {
        if (State.players[color] !== 'human') return;
        clearSelection();
        State.selectedTrayPiece = { color: color, piece: piece, index: index, element: span };
        span.classList.add('selected');
        highlightValidSquares(color);
    };
    
    span.addEventListener('dragstart', e => {
        span.classList.add('dragging');
        e.dataTransfer.setData(color, JSON.stringify({ piece: piece, index: index }));
    });
    span.addEventListener('dragend', () => span.classList.remove('dragging'));
    
    return span;
}

function onPositioningSquareClick(sq) {
    const square = sq.dataset.square;
    const rank = parseInt(square[1]);
    const existing = getPieceAt(square);
    
    // If we have a tray piece selected
    if (State.selectedTrayPiece) {
        const color = State.selectedTrayPiece.color;
        const piece = State.selectedTrayPiece.piece;
        const index = State.selectedTrayPiece.index;
        const valid = (color === 'white' && rank <= 2) || (color === 'black' && rank >= 7);
        
        if (valid) {
            if (existing && existing.color === color) {
                delete State.positions[color][square];
            }
            State.positions[color][square] = { piece: piece, index: index };
            clearSelection();
            updatePositioningBoard();
            updateTrays();
            updatePositioningStatus();
        } else {
            clearSelection();
        }
        return;
    }
    
    // If we have a board piece selected
    if (State.selectedSquare) {
        const from = State.selectedSquare;
        const fromPiece = getPieceAt(from);
        
        if (from === square) {
            clearSelection();
            updatePositioningBoard();
            return;
        }
        
        const valid = (fromPiece.color === 'white' && rank <= 2) || (fromPiece.color === 'black' && rank >= 7);
        if (valid && fromPiece.color === (existing ? existing.color : fromPiece.color)) {
            if (existing) {
                // Swap
                State.positions[fromPiece.color][square] = { piece: fromPiece.piece, index: fromPiece.index };
                State.positions[fromPiece.color][from] = { piece: existing.piece, index: existing.index };
            } else {
                delete State.positions[fromPiece.color][from];
                State.positions[fromPiece.color][square] = { piece: fromPiece.piece, index: fromPiece.index };
            }
        }
        clearSelection();
        updatePositioningBoard();
        updatePositioningStatus();
        return;
    }
    
    // Select a piece on the board
    if (existing && State.players[existing.color] === 'human') {
        State.selectedSquare = square;
        sq.classList.add('selected');
        highlightValidSquares(existing.color);
    }
}

function onDrop(sq, dataTransfer) {
    const square = sq.dataset.square;
    const rank = parseInt(square[1]);
    const types = dataTransfer.types;
    const color = types.indexOf('white') >= 0 ? 'white' : (types.indexOf('black') >= 0 ? 'black' : null);
    if (!color) return;
    
    const data = JSON.parse(dataTransfer.getData(color));
    const valid = (color === 'white' && rank <= 2) || (color === 'black' && rank >= 7);
    if (!valid) return;
    
    const existing = getPieceAt(square);
    
    if (data.fromSquare) {
        // From board
        if (data.fromSquare === square) return;
        if (existing && existing.color === color) {
            State.positions[color][square] = { piece: data.piece, index: data.index };
            State.positions[color][data.fromSquare] = { piece: existing.piece, index: existing.index };
        } else if (!existing) {
            delete State.positions[color][data.fromSquare];
            State.positions[color][square] = { piece: data.piece, index: data.index };
        }
    } else {
        // From tray
        if (existing && existing.color === color) {
            delete State.positions[color][square];
        }
        State.positions[color][square] = { piece: data.piece, index: data.index };
    }
    
    clearSelection();
    updatePositioningBoard();
    updateTrays();
    updatePositioningStatus();
}

function getPieceAt(square) {
    for (let c = 0; c < 2; c++) {
        const color = c === 0 ? 'white' : 'black';
        if (State.positions[color][square]) {
            const p = State.positions[color][square];
            return { color: color, piece: p.piece, index: p.index };
        }
    }
    return null;
}

function highlightValidSquares(color) {
    document.querySelectorAll('#positioning-board .square').forEach(sq => {
        const rank = parseInt(sq.dataset.square[1]);
        const valid = (color === 'white' && rank <= 2) || (color === 'black' && rank >= 7);
        if (valid) sq.classList.add('highlight');
    });
}

function clearSelection() {
    State.selectedTrayPiece = null;
    State.selectedSquare = null;
    document.querySelectorAll('.tray-piece.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.square.highlight, .square.selected').forEach(sq => sq.classList.remove('highlight', 'selected'));
}

function updatePositioningBoard() {
    document.querySelectorAll('#positioning-board .square').forEach(sq => {
        const labels = sq.querySelectorAll('.row-label, .col-label');
        sq.innerHTML = '';
        labels.forEach(l => sq.appendChild(l));
        
        const p = getPieceAt(sq.dataset.square);
        if (p) {
            const span = document.createElement('span');
            span.className = 'piece';
            span.textContent = ICONS[p.color][p.piece];
            
            if (State.players[p.color] === 'human') {
                span.draggable = true;
                (function(piece, idx, sqName, clr) {
                    span.addEventListener('dragstart', function(e) {
                        span.classList.add('dragging');
                        e.dataTransfer.setData(clr, JSON.stringify({ piece: piece, index: idx, fromSquare: sqName }));
                    });
                })(p.piece, p.index, sq.dataset.square, p.color);
                span.addEventListener('dragend', function() { span.classList.remove('dragging'); });
            }
            
            sq.appendChild(span);
        }
    });
}

function autoPosition(color) {
    const pieces = ['k'].concat(State.armies[color]);
    const r1 = color === 'white' ? 1 : 8;
    const r2 = color === 'white' ? 2 : 7;
    const files = 'abcdefgh'.split('').sort(() => Math.random() - 0.5);
    
    let i = 0;
    for (let f = 0; f < files.length; f++) {
        if (i >= pieces.length) break;
        State.positions[color][files[f] + r1] = { piece: pieces[i], index: pieces[i] === 'k' ? -1 : i - 1 };
        i++;
    }
    for (let f = 0; f < files.length; f++) {
        if (i >= pieces.length) break;
        State.positions[color][files[f] + r2] = { piece: pieces[i], index: i - 1 };
        i++;
    }
}

function updatePositioningStatus() {
    const wReady = isPositionComplete('white');
    const bReady = isPositionComplete('black');
    
    if (wReady && bReady) {
        $('positioning-status').textContent = t('allPiecesPlaced');
    } else {
        const waiting = [];
        if (!wReady) waiting.push(t('white'));
        if (!bReady) waiting.push(t('black'));
        $('positioning-status').textContent = t('waiting') + ' ' + waiting.join(', ');
    }
}

function isPositionComplete(color) {
    const pos = Object.values(State.positions[color]);
    const hasKing = pos.some(p => p.piece === 'k');
    const count = pos.filter(p => p.piece !== 'k').length;
    return hasKing && count === State.armies[color].length;
}

function setupPositioningButtons() {
    $('auto-position').onclick = function() {
        ['white', 'black'].forEach(c => {
            if (State.players[c] === 'human') {
                State.positions[c] = {};
                autoPosition(c);
            }
        });
        updatePositioningBoard();
        updateTrays();
        updatePositioningStatus();
    };
    
    $('confirm-position').onclick = function() {
        if (isPositionComplete('white') && isPositionComplete('black')) {
            showScreen('game-screen');
            initGame();
        }
    };
}
