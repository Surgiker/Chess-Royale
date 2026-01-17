// ========== AI ==========

const AI = {
    pieceValues: { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 },
    
    evaluate(chess) {
        if (chess.in_checkmate()) return chess.turn() === 'w' ? -99999 : 99999;
        if (chess.in_draw()) return 0;
        
        let score = 0;
        const board = chess.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    const val = this.pieceValues[piece.type];
                    score += piece.color === 'w' ? val : -val;
                }
            }
        }
        return score;
    },
    
    minimax(chess, depth, alpha, beta, maximizing) {
        if (depth === 0 || chess.game_over()) return this.evaluate(chess);
        
        const moves = chess.moves();
        if (maximizing) {
            let max = -Infinity;
            for (const move of moves) {
                chess.move(move);
                max = Math.max(max, this.minimax(chess, depth - 1, alpha, beta, false));
                chess.undo();
                alpha = Math.max(alpha, max);
                if (beta <= alpha) break;
            }
            return max;
        } else {
            let min = Infinity;
            for (const move of moves) {
                chess.move(move);
                min = Math.min(min, this.minimax(chess, depth - 1, alpha, beta, true));
                chess.undo();
                beta = Math.min(beta, min);
                if (beta <= alpha) break;
            }
            return min;
        }
    },
    
    getBestMove(chess) {
        const moves = chess.moves({ verbose: true });
        if (!moves.length) return null;
        
        // Shuffle for variety
        for (let i = moves.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [moves[i], moves[j]] = [moves[j], moves[i]];
        }
        
        const isWhite = chess.turn() === 'w';
        let best = moves[0];
        let bestVal = isWhite ? -Infinity : Infinity;
        
        for (const move of moves) {
            chess.move(move);
            const val = this.minimax(chess, 2, -Infinity, Infinity, !isWhite);
            chess.undo();
            
            if (isWhite ? val > bestVal : val < bestVal) {
                bestVal = val;
                best = move;
            }
        }
        return best;
    }
};
