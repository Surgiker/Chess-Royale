// ========== INTERNATIONALIZATION ==========

const TRANSLATIONS = {
    en: {
        // Header
        subtitle: "Build your army, conquer the kingdom",
        
        // Setup screen
        players: "Players",
        white: "White",
        black: "Black",
        human: "Human",
        ai: "AI",
        aiSpeed: "AI Speed",
        instant: "Instant",
        stepByStep: "Step-by-step",
        timed: "1 second/move",
        startGame: "Start Game",
        
        // Army selection
        whiteArmy: "White Army",
        blackArmy: "Black Army",
        queen: "Queen",
        rook: "Rook",
        bishop: "Bishop",
        knight: "Knight",
        pawn: "Pawn",
        pieces: "Pieces:",
        pointsUsed: "Points used:",
        kingIncluded: "King (included):",
        classic: "Classic",
        clear: "Clear",
        confirm: "Confirm",
        selectionInProgress: "Selection in progress...",
        armiesReady: "Armies ready!",
        
        // Positioning
        positioningHint: "Place your pieces in the first two rows",
        whitePieces: "White",
        blackPieces: "Black",
        auto: "Auto",
        allPiecesPlaced: "All pieces placed!",
        waiting: "Waiting:",
        
        // Game
        turn: "Turn:",
        capturedByWhite: "Captured by White:",
        capturedByBlack: "Captured by Black:",
        nextMove: "Next Move",
        newGame: "New Game",
        
        // End game modal
        gameOver: "Game Over",
        checkmate: "Checkmate!",
        whiteWins: "White wins!",
        blackWins: "Black wins!",
        draw: "Draw",
        stalemate: "Stalemate.",
        drawGame: "Draw."
    },
    
    it: {
        // Header
        subtitle: "Componi il tuo esercito, conquista il regno",
        
        // Setup screen
        players: "Giocatori",
        white: "Bianco",
        black: "Nero",
        human: "Umano",
        ai: "IA",
        aiSpeed: "Velocità IA",
        instant: "Istantanea",
        stepByStep: "Passo-passo",
        timed: "1 secondo/mossa",
        startGame: "Inizia Partita",
        
        // Army selection
        whiteArmy: "Esercito Bianco",
        blackArmy: "Esercito Nero",
        queen: "Donna",
        rook: "Torre",
        bishop: "Alfiere",
        knight: "Cavallo",
        pawn: "Pedone",
        pieces: "Pezzi:",
        pointsUsed: "Punti usati:",
        kingIncluded: "Re (incluso):",
        classic: "Classico",
        clear: "Svuota",
        confirm: "Conferma",
        selectionInProgress: "Selezione in corso...",
        armiesReady: "Eserciti pronti!",
        
        // Positioning
        positioningHint: "Posiziona i tuoi pezzi nelle prime due righe",
        whitePieces: "Bianchi",
        blackPieces: "Neri",
        auto: "Auto",
        allPiecesPlaced: "Tutti i pezzi posizionati!",
        waiting: "In attesa:",
        
        // Game
        turn: "Turno:",
        capturedByWhite: "Catturati dal Bianco:",
        capturedByBlack: "Catturati dal Nero:",
        nextMove: "Prossima Mossa",
        newGame: "Nuova Partita",
        
        // End game modal
        gameOver: "Partita Terminata",
        checkmate: "Scacco Matto!",
        whiteWins: "Bianco vince!",
        blackWins: "Nero vince!",
        draw: "Patta",
        stalemate: "Stallo.",
        drawGame: "Partita pari."
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('chessRoyaleLang', lang);
    updateAllTexts();
}

function t(key) {
    return TRANSLATIONS[currentLang][key] || key;
}

function updateAllTexts() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.lang === currentLang);
    });
    
    // Update CSS pseudo-element content via data attribute
    document.querySelectorAll('.army-panel').forEach(panel => {
        panel.setAttribute('data-selection-text', t('selectionInProgress'));
    });
}

function initLanguage() {
    // Check saved preference
    const saved = localStorage.getItem('chessRoyaleLang');
    if (saved && TRANSLATIONS[saved]) {
        currentLang = saved;
    }
    
    // Setup language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
    
    updateAllTexts();
}
