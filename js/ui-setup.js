// ========== SETUP SCREEN ==========

function initSetup() {
    // Player type buttons
    document.querySelectorAll('.player-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const player = btn.dataset.player;
            document.querySelectorAll('.player-type-btn[data-player="' + player + '"]')
                .forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            State.players[player] = btn.dataset.type;
        });
    });
    
    // Speed options
    document.querySelectorAll('input[name="speed"]').forEach(r => {
        r.addEventListener('change', () => { 
            State.speed = r.value; 
        });
    });
    
    // Manual setup checkbox
    $('manual-setup').addEventListener('change', (e) => {
        State.manualSetup = e.target.checked;
    });
    
    // Start game button
    $('start-game').addEventListener('click', () => {
        showScreen('army-screen');
        initArmySelection();
    });
}
