class CheerUpGame {
    constructor(container) {
        this.container = container;
        this.container.style.position = 'relative';
        
        this.timeLeft = 30; // 30 seconds game
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        
        this.holes = [];
        this.moles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.2; // Spawn every 1.2s
    }

    init() {
        this.container.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; height:100%; justify-content:center;">
                <div id="whack-grid" style="
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 15px; 
                    background: rgba(255,255,255,0.7);
                    padding: 20px;
                    border-radius: 20px;
                    border: 4px solid var(--primary-color);
                "></div>
            </div>
        `;
        
        const grid = document.getElementById('whack-grid');
        
        // Create 9 holes
        for (let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            hole.style.cssText = `
                width: 100px; height: 100px; 
                background: #bdc3c7; 
                border-radius: 50%;
                border: 5px solid #7f8c8d;
                position: relative;
                overflow: hidden;
                display: flex; justify-content: center; align-items: flex-end;
            `;
            
            const mole = document.createElement('div');
            mole.style.cssText = `
                font-size: 4rem;
                position: absolute;
                bottom: -100px; /* hidden initially */
                transition: bottom 0.3s ease-out;
                cursor: pointer;
                user-select: none;
            `;
            
            // Interaction
            mole.addEventListener('mousedown', () => this.whack(i));
            mole.addEventListener('touchstart', (e) => { e.preventDefault(); this.whack(i); }, {passive: false});
            
            hole.appendChild(mole);
            grid.appendChild(hole);
            
            this.holes.push(hole);
            this.moles.push({ el: mole, active: false, type: '', timer: 0 });
        }
        
        this.updateUI();
    }

    whack(index) {
        if (this.isGameOver) return;
        
        const mole = this.moles[index];
        if (!mole.active) return;
        
        if (mole.type === 'sad') {
            // Success: cheer up friend
            mole.el.textContent = '😊';
            this.spawnHeart(this.holes[index]);
            if (window.GameAudio) window.GameAudio.playCoin();
            this.score += 15;
            
            // Hide early
            mole.active = false;
            setTimeout(() => {
                mole.el.style.bottom = '-100px';
            }, 500);
            
        } else if (mole.type === 'bully') {
            // Fail: clicked the bully
            mole.el.textContent = '🤬';
            mole.el.style.animation = 'shake 0.3s';
            if (window.GameAudio) window.GameAudio.playError();
            this.health -= 15;
            
            if (this.health <= 0) {
                this.endGame(false);
            }
        }
        
        this.updateUI();
    }

    spawnHeart(parent) {
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.cssText = `
            position: absolute; font-size: 2rem;
            animation: bounceIn 0.8s ease forwards;
            pointer-events: none; z-index: 10;
            bottom: 40px;
        `;
        parent.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
    }

    update(dt) {
        if (this.isGameOver) return;
        
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.endGame(true);
            return;
        }
        
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval;
            this.spawnRandom();
        }
        
        // Update active moles timer
        this.moles.forEach((mole, index) => {
            if (mole.active) {
                mole.timer -= dt;
                if (mole.timer <= 0) {
                    // Time's up, hide
                    mole.active = false;
                    mole.el.style.bottom = '-100px';
                }
            }
        });
        
        this.updateUI();
    }
    
    spawnRandom() {
        // Find empty hole
        const emptyIndices = [];
        this.moles.forEach((m, i) => { if (!m.active) emptyIndices.push(i); });
        
        if (emptyIndices.length === 0) return;
        
        const randomHole = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const mole = this.moles[randomHole];
        
        // 75% chance sad friend (good to click), 25% bully (bad to click)
        const isSad = Math.random() < 0.75;
        
        mole.type = isSad ? 'sad' : 'bully';
        mole.el.textContent = isSad ? '😢' : '😡';
        mole.el.style.animation = 'none'; // reset shake
        
        mole.active = true;
        mole.timer = 2.0; // Stays up for 2 seconds (very easy)
        
        mole.el.style.bottom = '10px';
    }

    draw() {}

    updateUI() {
        const scoreEl = document.getElementById('game-score');
        const timerEl = document.getElementById('game-timer');
        if (scoreEl) scoreEl.textContent = `Skor: ${this.score}`;
        if (timerEl) timerEl.textContent = Math.ceil(Math.max(0, this.timeLeft)) + 's';
        if (window.UI) window.UI.updateHealthBar(this.health);
    }

    endGame(isWin) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        // Hide all
        this.moles.forEach(m => m.el.style.bottom = '-100px');
        
        let stars = 0; let coins = 0;
        
        if (isWin) {
            stars = this.health >= 90 ? 3 : (this.health >= 60 ? 2 : 1);
            coins = Math.floor(this.score / 2);
            
            if (window.GameStorage) {
                window.GameStorage.addCoins(coins);
                window.GameStorage.addStars(stars);
                
                const curLevel = parseInt(this.gameId.split('-')[1]);
                window.GameStorage.unlockLevel('AB', curLevel + 1);
            }
        }
        
        setTimeout(() => {
            if (window.UI) {
                window.UI.showResultPopup(stars, this.score, coins, () => {
                    window.UI.showScreen('screen-menu-anti-bullying');
                });
            }
        }, 500);
    }

    cleanup() {
        this.container.innerHTML = '';
    }
}
