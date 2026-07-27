class TapKindnessGame {
    constructor(container) {
        this.container = container;
        this.container.style.position = 'relative';
        
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        this.round = 0;
        this.totalRounds = 8;
        
        this.goodActions = [
            { emoji: '🤝', text: 'Berjabat Tangan' },
            { emoji: '❤️', text: 'Menyayangi' },
            { emoji: '😊', text: 'Tersenyum' },
            { emoji: '🎁', text: 'Berbagi' },
            { emoji: '👏', text: 'Memuji Teman' },
            { emoji: '🫂', text: 'Memeluk' },
            { emoji: '✋', text: 'Menyapa' },
            { emoji: '🙏', text: 'Berterima Kasih' }
        ];
        
        this.badActions = [
            { emoji: '👊', text: 'Memukul' },
            { emoji: '💢', text: 'Marah' },
            { emoji: '😡', text: 'Mengejek' },
            { emoji: '🤬', text: 'Berkata Kasar' },
            { emoji: '😤', text: 'Memarahi' }
        ];
    }

    init() {
        this.container.innerHTML = `
            <div style="text-align:center; padding: 10px;">
                <h2 style="font-size:1.5rem; margin-bottom:5px; color:#2C3E50;">Mana yang KEBAIKAN? Klik yang benar! 👇</h2>
                <div id="tap-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; padding:10px;"></div>
            </div>
        `;
        this.showRound();
        this.updateUI();
    }

    showRound() {
        if (this.round >= this.totalRounds) {
            this.endGame(true);
            return;
        }
        
        const grid = document.getElementById('tap-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        // Pick 1 good and 2 bad, shuffle them
        const good = this.goodActions[this.round % this.goodActions.length];
        const bad1 = this.badActions[Math.floor(Math.random() * this.badActions.length)];
        let bad2 = this.badActions[Math.floor(Math.random() * this.badActions.length)];
        while (bad2.text === bad1.text) {
            bad2 = this.badActions[Math.floor(Math.random() * this.badActions.length)];
        }
        
        const options = [
            { ...good, isGood: true },
            { ...bad1, isGood: false },
            { ...bad2, isGood: false }
        ].sort(() => Math.random() - 0.5);
        
        options.forEach(opt => {
            const card = document.createElement('button');
            card.style.cssText = `
                width: 160px; height: 160px; border-radius: 20px; border: 5px solid #ddd;
                background: white; cursor: pointer; display: flex; flex-direction: column;
                justify-content: center; align-items: center; gap: 8px;
                font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
                box-shadow: 0 6px 0 #ccc; transition: all 0.2s;
            `;
            card.innerHTML = `<span style="font-size:4rem;">${opt.emoji}</span><span>${opt.text}</span>`;
            
            card.addEventListener('click', () => {
                if (this.isGameOver) return;
                
                if (opt.isGood) {
                    card.style.borderColor = '#2ecc71';
                    card.style.background = '#d5f5e3';
                    if (window.GameAudio) window.GameAudio.playCoin();
                    this.score += 15;
                    this.round++;
                    
                    setTimeout(() => this.showRound(), 600);
                } else {
                    card.style.borderColor = '#e74c3c';
                    card.style.background = '#fadbd8';
                    card.style.animation = 'shake 0.5s';
                    if (window.GameAudio) window.GameAudio.playError();
                    this.health -= 30;
                    
                    if (this.health <= 0) {
                        this.endGame(false);
                    }
                }
                this.updateUI();
            });
            
            grid.appendChild(card);
        });
    }

    update() {}
    draw() {}

    updateUI() {
        const scoreEl = document.getElementById('game-score');
        const timerEl = document.getElementById('game-timer');
        if (scoreEl) scoreEl.textContent = `Skor: ${this.score}`;
        if (timerEl) timerEl.textContent = `${this.round}/${this.totalRounds}`;
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
