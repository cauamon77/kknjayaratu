class WashingSimulatorGame {
    constructor(container) {
        this.container = container;
        this.container.style.position = 'relative';
        
        this.isGameOver = false;
        this.score = 0;
        this.health = 100; // Time based health
        this.timeLeft = 15;
        
        this.dirtSpots = [];
        this.cleanProgress = 0;
        this.totalSpots = 20;
    }

    init() {
        this.container.innerHTML = `<div class="washing-hand" id="wash-hand"></div>`;
        const hand = document.getElementById('wash-hand');
        
        // Spawn dirt
        for (let i = 0; i < this.totalSpots; i++) {
            const dirt = document.createElement('div');
            dirt.className = 'dirt-spot';
            
            let x = Math.random() * 240 + 10;
            let y = Math.random() * 340 + 10;
            
            dirt.style.left = x + 'px';
            dirt.style.top = y + 'px';
            dirt.style.cursor = 'pointer'; // Make it look clickable
            
            const cleanSpot = () => {
                if (this.isGameOver) return;
                
                // One click cleans the spot entirely for smart TV simplicity
                dirt.style.display = 'none';
                this.cleanProgress++;
                this.score += 5;
                this.spawnFoam(hand, x, y);
                if (window.GameAudio) window.GameAudio.playPop();
                
                this.updateUI();
                
                if (this.cleanProgress >= this.totalSpots) {
                    this.endGame(true);
                }
            };
            
            // Allow both click and touchstart for better Smart TV / Mobile support
            dirt.addEventListener('mousedown', cleanSpot);
            dirt.addEventListener('touchstart', (e) => { e.preventDefault(); cleanSpot(); }, {passive: false});
            
            hand.appendChild(dirt);
        }
        
        this.updateUI();
    }

    spawnFoam(container, x, y) {
        const foam = document.createElement('div');
        foam.className = 'foam-bubble';
        foam.style.left = x + 'px';
        foam.style.top = y + 'px';
        container.appendChild(foam);
    }

    update(dt) {
        if (this.isGameOver) return;
        
        this.timeLeft -= dt;
        this.health = (this.timeLeft / 15) * 100;
        
        if (this.timeLeft <= 0) {
            this.endGame(false);
            return;
        }
        this.updateUI();
    }

    draw() {}

    updateUI() {
        const scoreEl = document.getElementById('game-score');
        const timerEl = document.getElementById('game-timer');
        if (scoreEl) scoreEl.textContent = `Bersih: ${Math.floor((this.cleanProgress/this.totalSpots)*100)}%`;
        if (timerEl) timerEl.textContent = Math.ceil(Math.max(0, this.timeLeft)) + 's';
        if (window.UI) window.UI.updateHealthBar(this.health);
    }

    endGame(isWin) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        let stars = 0; let coins = 0;
        
        if (isWin) {
            stars = this.timeLeft >= 5 ? 3 : (this.timeLeft >= 2 ? 2 : 1);
            coins = Math.floor(this.score / 2);
            
            if (window.GameStorage) {
                window.GameStorage.addCoins(coins);
                window.GameStorage.addStars(stars);
                
                const curLevel = parseInt(this.gameId.split('-')[1]);
                window.GameStorage.unlockLevel('CT', curLevel + 1);
            }
        }
        
        setTimeout(() => {
            if (window.UI) {
                window.UI.showResultPopup(stars, this.score, coins, () => {
                    window.UI.showScreen('screen-menu-cuci-tangan');
                });
            }
        }, 500);
    }

    cleanup() {
        this.container.innerHTML = '';
        // Note: global mouseup/touchend might leak, but okay for this prototype
    }
}
