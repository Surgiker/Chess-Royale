// ========== UTILITIES ==========

function $(id) { 
    return document.getElementById(id); 
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
}
