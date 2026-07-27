class KillGermsGame {
    constructor(container, config) {
        this.container = container;
        this.container.style.position = 'relative';
        
        this.difficulty = config.difficulty || 1;
        this.timeLeft = config.duration || 20;
        
        this.germs = [];
        this.germCount = 8;
        this.germsAlive = this.germCount;
        this.isGameOver = false;
        
        this.score = 0;
        this.health = 100;
        
        this.baseSpeed = 60;
        
        this.germEmojis = ['🦠', '👾', '🐛'];
    }

    init() {
        this.updateUI();
        this.spawnGerms();
    }

    spawnGerms() {
        for (let i = 0; i < this.germCount; i++) {
            const germ = document.createElement('div');
            germ.className = 'germ';
            germ.textContent = this.germEmojis[Math.floor(Math.random() * this.germEmojis.length)];
            
            // Adjust size based on difficulty (harder = smaller, but much bigger base now)
            const scale = 1.5;
            germ.style.transform = `scale(${scale})`;
            
            let x = Math.random() * (this.container.clientWidth - 80);
            let y = Math.random() * (this.container.clientHeight - 80);
            
            germ.style.left = x + 'px';
            germ.style.top = y + 'px';
            
            const vx = (Math.random() - 0.5) * this.baseSpeed;
            const vy = (Math.random() - 0.5) * this.baseSpeed;
            
            this.container.appendChild(germ);
            
            const germObj = { el: germ, x, y, vx, vy, isDead: false };
            this.germs.push(germObj);
            
            const killHandler = (e) => {
                e.preventDefault();
                this.killGerm(germObj);
            };
            
            germ.addEventListener('mousedown', killHandler);
            germ.addEventListener('touchstart', killHandler, {passive: false});
        }
    }

    killGerm(germObj) {
        if (germObj.isDead || this.isGameOver) return;
        
        germObj.isDead = true;
        germObj.el.classList.add('dead');
        
        this.score += 20;
        this.germsAlive--;
        
        if (window.GameAudio) window.GameAudio.playPop();
        
        setTimeout(() => {
            if (germObj.el.parentNode) germObj.el.parentNode.removeChild(germObj.el);
        }, 300);
        
        this.updateUI();
        if (this.germsAlive <= 0) this.endGame(true);
    }

    update(dt) {
        if (this.isGameOver) return;
        
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.health = 0;
            this.endGame(false);
            return;
        }
        
        this.germs.forEach(germ => {
            if (germ.isDead) return;
            
            germ.x += germ.vx * dt;
            germ.y += germ.vy * dt;
            
            if (germ.x < 0 || germ.x > this.container.clientWidth - 60) {
                germ.vx *= -1;
                germ.x = Math.max(0, Math.min(this.container.clientWidth - 60, germ.x));
            }
            if (germ.y < 0 || germ.y > this.container.clientHeight - 60) {
                germ.vy *= -1;
                germ.y = Math.max(0, Math.min(this.container.clientHeight - 60, germ.y));
            }
            
            germ.el.style.left = germ.x + 'px';
            germ.el.style.top = germ.y + 'px';
        });
        
        this.updateUI();
    }
    
    draw() {}

    updateUI() {
        const scoreEl = document.getElementById('game-score');
        const timerEl = document.getElementById('game-timer');
        if (scoreEl) scoreEl.textContent = `Sisa: ${this.germsAlive}`;
        if (timerEl) timerEl.textContent = Math.ceil(Math.max(0, this.timeLeft)) + 's';
        if (window.UI) window.UI.updateHealthBar(this.health);
    }

    endGame(isWin) {
        this.isGameOver = true;
        let stars = 0; let coins = 0;
        
        if (isWin) {
            stars = this.timeLeft >= 10 ? 3 : (this.timeLeft >= 5 ? 2 : 1);
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
