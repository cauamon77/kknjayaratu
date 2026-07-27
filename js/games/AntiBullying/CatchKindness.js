class CatchKindnessGame {
    constructor(container, config) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.difficulty = config.difficulty || 1; // 1 to 3
        this.timeLeft = config.duration || 30; 
        
        this.player = {
            x: this.canvas.width / 2, y: this.canvas.height - 100,
            width: 120, height: 120, speed: 700, emoji: '🦊'
        };
        
        this.items = [];
        this.score = 0;
        this.health = 100;
        
        // Difficulty modifiers (much easier now)
        this.spawnInterval = 1.0;
        this.itemSpeedBase = 80;
        this.badItemChance = 0.2;
        
        this.goodEmojis = ['❤️', '🤝', '😊', '🎁'];
        this.badEmojis = ['💢', '👊', '😡', '😢'];
        
        this.keys = {};
        this.spawnTimer = 0;
        this.isGameOver = false;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    init() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, {passive: false});
        this.canvas.addEventListener('touchmove', this.handleTouchMove, {passive: false});
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.updateUI();
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.remove();
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        if (this.player) this.player.y = this.canvas.height - 80;
    }

    handleKeyDown(e) { this.keys[e.key] = true; }
    handleKeyUp(e) { this.keys[e.key] = false; }
    
    handleTouchStart(e) { e.preventDefault(); this.touchX = e.touches[0].clientX - this.canvas.getBoundingClientRect().left; }
    handleTouchMove(e) { e.preventDefault(); this.touchX = e.touches[0].clientX - this.canvas.getBoundingClientRect().left; }
    handleTouchEnd(e) { this.touchX = null; }

    spawnItem() {
        const isBad = Math.random() < this.badItemChance;
        const emojiList = isBad ? this.badEmojis : this.goodEmojis;
        const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        
        this.items.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -50,
            emoji: emoji,
            isBad: isBad,
            speed: Math.random() * 100 + this.itemSpeedBase
        });
    }

    update(dt) {
        if (this.isGameOver) return;

        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.endGame(true);
            return;
        }

        if (this.keys['ArrowLeft'] || this.keys['a']) this.player.x -= this.player.speed * dt;
        if (this.keys['ArrowRight'] || this.keys['d']) this.player.x += this.player.speed * dt;
        
        if (this.touchX !== undefined && this.touchX !== null) {
            if (this.touchX < this.player.x - 20) this.player.x -= this.player.speed * dt;
            else if (this.touchX > this.player.x + 20) this.player.x += this.player.speed * dt;
        }

        this.player.x = Math.max(40, Math.min(this.canvas.width - 40, this.player.x));

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnItem();
            this.spawnTimer = this.spawnInterval;
        }

        for (let i = this.items.length - 1; i >= 0; i--) {
            let item = this.items[i];
            item.y += item.speed * dt;

            if (Math.abs(item.x - this.player.x) < 50 && Math.abs(item.y - this.player.y) < 50) {
                if (!item.isBad) {
                    this.score += 10;
                    if (window.GameAudio) window.GameAudio.playPop();
                } else {
                    this.health -= 25;
                    if (window.GameAudio) window.GameAudio.playError();
                }
                this.items.splice(i, 1);
                this.updateUI();
                
                if (this.health <= 0) this.endGame(false);
                continue;
            }

            if (item.y > this.canvas.height + 50) this.items.splice(i, 1);
        }
        this.updateUI();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = '70px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.player.emoji, this.player.x, this.player.y);
        
        this.ctx.font = '50px Arial';
        this.items.forEach(item => {
            this.ctx.fillText(item.emoji, item.x, item.y);
        });
    }

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
            stars = this.health >= 100 ? 3 : (this.health >= 50 ? 2 : 1);
            coins = Math.floor(this.score / 2);
            
            if (window.GameStorage) {
                window.GameStorage.addCoins(coins);
                window.GameStorage.addStars(stars);
                
                // Unlock next level
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
}
