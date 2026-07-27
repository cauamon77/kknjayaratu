class BubblePopGame {
    constructor(container) {
        this.container = container;
        this.container.style.position = 'relative';
        
        this.timeLeft = 25;
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        
        this.bubbles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 0.5; // Every 0.5s spawn a bubble
        
        this.germEmojis = ['🦠', '👾'];
        this.cleanEmojis = ['💧', '🧼'];
    }

    init() {
        this.updateUI();
    }

    spawnBubble() {
        if (this.isGameOver) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const isGerm = Math.random() > 0.4;
        const emojiList = isGerm ? this.germEmojis : this.cleanEmojis;
        const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        
        bubble.textContent = emoji;
        
        let x = Math.random() * (this.container.clientWidth - 80);
        let y = this.container.clientHeight + 80; // Start below screen
        
        bubble.style.left = x + 'px';
        bubble.style.top = y + 'px';
        
        this.container.appendChild(bubble);
        
        const bObj = { el: bubble, x, y, isGerm, speed: Math.random() * 150 + 100, popped: false };
        this.bubbles.push(bObj);
        
        const popHandler = (e) => {
            e.preventDefault();
            this.popBubble(bObj);
        };
        
        bubble.addEventListener('mousedown', popHandler);
        bubble.addEventListener('touchstart', popHandler, {passive: false});
    }

    popBubble(bObj) {
        if (bObj.popped || this.isGameOver) return;
        
        bObj.popped = true;
        bObj.el.classList.add('popped');
        
        if (bObj.isGerm) {
            if (window.GameAudio) window.GameAudio.playPop();
            this.score += 15;
        } else {
            if (window.GameAudio) window.GameAudio.playError();
            this.health -= 25; // Don't pop clean water/soap!
        }
        
        setTimeout(() => {
            if (bObj.el.parentNode) bObj.el.parentNode.removeChild(bObj.el);
        }, 200);
        
        this.updateUI();
        
        if (this.health <= 0) {
            this.endGame(false);
        }
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
            this.spawnBubble();
            this.spawnTimer = this.spawnInterval;
        }
        
        // Move bubbles up
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            let b = this.bubbles[i];
            if (b.popped) continue;
            
            b.y -= b.speed * dt;
            b.el.style.top = b.y + 'px';
            
            // Wobble
            b.x += Math.sin(b.y / 20) * 2;
            b.el.style.left = b.x + 'px';
            
            // Penalty if germ reaches top
            if (b.y < -80) {
                if (b.isGerm) {
                    this.health -= 10; // Missed a germ
                    if (window.GameAudio) window.GameAudio.playError();
                }
                
                if (b.el.parentNode) b.el.parentNode.removeChild(b.el);
                this.bubbles.splice(i, 1);
                
                if (this.health <= 0) {
                    this.endGame(false);
                    return;
                }
            }
        }
        
        this.updateUI();
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
        this.isGameOver = true;
        let stars = 0; let coins = 0;
        
        if (isWin && this.health > 0) {
            stars = this.health >= 80 ? 3 : (this.health >= 50 ? 2 : 1);
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
    }
}
