// ========== STATE ==========

const State = {
    players: { white: 'human', black: 'ai' },
    speed: 'step',
    armies: { white: [], black: [] },
    armiesConfirmed: { white: false, black: false },
    cartQty: { 
        white: { q: 0, r: 0, b: 0, n: 0, p: 0 }, 
        black: { q: 0, r: 0, b: 0, n: 0, p: 0 } 
    },
    positions: { white: {}, black: {} },
    currentTurn: 'white',
    chess: null,
    selectedSquare: null,
    selectedTrayPiece: null,
    captured: { white: [], black: [] },
    gameOver: false,
    thinking: false
};
