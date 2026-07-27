class FindBullyGame {
    constructor(container) {
        this.container = container;
        this.container.style.position = 'relative';
        
        this.timeLeft = 30;
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        
        this.chars = [];
        this.goodEmojis = ['😊', '😇', '🤓', '🤠', '😎', '👧', '👦'];
        this.badEmoji = '😡'; // The bully
        
        this.charCount = 15;
    }

    init() {
        this.container.innerHTML = `<div class="find-bully-container" id="find-bg"></div>`;
        const bg = document.getElementById('find-bg');
        
        // Spawn good characters
        for (let i = 0; i < this.charCount; i++) {
            this.spawnChar(bg, this.goodEmojis[Math.floor(Math.random() * this.goodEmojis.length)], false);
        }
        
        // Spawn the bully
        this.spawnChar(bg, this.badEmoji, true);
        
        this.updateUI();
    }

    spawnChar(bg, emoji, isBully) {
        const charEl = document.createElement('div');
        charEl.className = 'find-char';
        charEl.textContent = emoji;
        
        // Random position within container (600x400)
        let x = Math.random() * 500 + 20;
        let y = Math.random() * 300 + 20;
        
        charEl.style.left = x + 'px';
        charEl.style.top = y + 'px';
        
        charEl.addEventListener('click', () => {
            if (this.isGameOver) return;
            
            if (isBully) {
                charEl.style.transform = 'scale(2)';
                charEl.textContent = '😭'; // Found him!
                if (window.GameAudio) window.GameAudio.playWin();
                this.score = 100;
                setTimeout(() => this.endGame(true), 1000);
            } else {
                if (window.GameAudio) window.GameAudio.playError();
                this.health -= 20;
                charEl.style.opacity = '0.3';
                this.updateUI();
                
                if (this.health <= 0) {
                    this.endGame(false);
                }
            }
        });
        
        bg.appendChild(charEl);
    }

    update(dt) {
        if (this.isGameOver) return;
        
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.health = 0;
            this.endGame(false);
            return;
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
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        let stars = 0; let coins = 0;
        
        if (isWin) {
            stars = this.health >= 100 ? 3 : (this.health >= 60 ? 2 : 1);
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
