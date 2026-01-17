// ========== ARMY SELECTION ==========

function initArmySelection() {
    State.armies = { white: [], black: [] };
    State.armiesConfirmed = { white: false, black: false };
    State.cartQty = { 
        white: { q: 0, r: 0, b: 0, n: 0, p: 0 }, 
        black: { q: 0, r: 0, b: 0, n: 0, p: 0 } 
    };
    
    ['white', 'black'].forEach(color => {
        resetCart(color);
        updateCartDisplay(color);
        const panel = $(color + '-army-panel');
        panel.classList.remove('hidden-selection');
        panel.style.pointerEvents = '';
        
        // Setup cart button listeners
        const cart = $(color + '-cart');
        cart.querySelectorAll('.cart-item').forEach(item => {
            const piece = item.dataset.piece;
            item.querySelector('.plus').onclick = () => changeQty(color, piece, 1);
            item.querySelector('.minus').onclick = () => changeQty(color, piece, -1);
        });
        
        if (State.players[color] === 'ai') {
            setClassicArmy(color);
            State.armiesConfirmed[color] = true;
            panel.classList.add('hidden-selection');
            checkArmiesReady();
        }
    });
}

function resetCart(color) {
    State.cartQty[color] = { q: 0, r: 0, b: 0, n: 0, p: 0 };
}

function changeQty(color, piece, delta) {
    const newQty = State.cartQty[color][piece] + delta;
    if (newQty < 0) return;
    
    // Calculate totals
    let totalPieces = 0;
    let totalPoints = 0;
    for (const p in State.cartQty[color]) {
        const qty = p === piece ? newQty : State.cartQty[color][p];
        totalPieces += qty;
        totalPoints += qty * COSTS[p];
    }
    
    // Check limits
    if (totalPieces > MAX_SLOTS) return;
    if (totalPoints > BUDGET) return;
    
    State.cartQty[color][piece] = newQty;
    updateCartDisplay(color);
}

function updateCartDisplay(color) {
    const cart = $(color + '-cart');
    let totalPieces = 0;
    let totalPoints = 0;
    
    cart.querySelectorAll('.cart-item').forEach(item => {
        const piece = item.dataset.piece;
        const qty = State.cartQty[color][piece];
        item.querySelector('.qty-value').textContent = qty;
        totalPieces += qty;
        totalPoints += qty * COSTS[piece];
    });
    
    // Update summary
    $(color + '-pieces-count').textContent = totalPieces;
    $(color + '-points-used').textContent = totalPoints;
    
    // Update button states
    cart.querySelectorAll('.cart-item').forEach(item => {
        const piece = item.dataset.piece;
        const qty = State.cartQty[color][piece];
        const canAdd = totalPieces < MAX_SLOTS && totalPoints + COSTS[piece] <= BUDGET;
        item.querySelector('.plus').disabled = !canAdd;
        item.querySelector('.minus').disabled = qty <= 0;
    });
    
    // Build army array
    State.armies[color] = [];
    for (const p in State.cartQty[color]) {
        for (let i = 0; i < State.cartQty[color][p]; i++) {
            State.armies[color].push(p);
        }
    }
    
    // Update confirm button
    $(color + '-confirm').disabled = totalPieces === 0;
}

function setClassicArmy(color) {
    State.cartQty[color] = { q: 1, r: 2, b: 2, n: 2, p: 8 };
    updateCartDisplay(color);
}

function setupArmyButtons() {
    ['white', 'black'].forEach(color => {
        $(color + '-classic').onclick = () => { setClassicArmy(color); };
        $(color + '-clear').onclick = () => { resetCart(color); updateCartDisplay(color); };
        $(color + '-confirm').onclick = () => {
            if (State.armies[color].length > 0) {
                State.armiesConfirmed[color] = true;
                $(color + '-army-panel').classList.add('hidden-selection');
                checkArmiesReady();
            }
        };
    });
}

function checkArmiesReady() {
    if (State.armiesConfirmed.white && State.armiesConfirmed.black) {
        $('army-status').textContent = t('armiesReady');
        setTimeout(() => { 
            showScreen('positioning-screen'); 
            initPositioning(); 
        }, 500);
    }
}
