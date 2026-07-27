class MemoryGame {
    constructor(container) {
        this.container = container;
        
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        
        this.items = ['🧼', '🧼', '💧', '💧', '🦠', '🦠', '🧻', '🧻'];
        // Shuffle
        this.items.sort(() => Math.random() - 0.5);
        
        this.cards = [];
        this.flippedCards = [];
        this.matches = 0;
    }

    init() {
        this.container.innerHTML = `<div class="memory-grid" id="memory-grid"></div>`;
        const grid = document.getElementById('memory-grid');
        
        this.items.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            
            const back = document.createElement('div');
            back.className = 'back';
            back.textContent = '❓';
            
            const front = document.createElement('div');
            front.className = 'emoji';
            front.textContent = emoji;
            
            card.appendChild(back);
            card.appendChild(front);
            
            card.addEventListener('click', () => this.flipCard(card, emoji, index));
            
            grid.appendChild(card);
            this.cards.push({ el: card, emoji, index, isMatched: false, isFlipped: false });
        });
        
        this.updateUI();
    }

    flipCard(cardEl, emoji, index) {
        if (this.isGameOver || this.flippedCards.length >= 2) return;
        
        const cardObj = this.cards[index];
        if (cardObj.isMatched || cardObj.isFlipped) return;
        
        if (window.GameAudio) window.GameAudio.playPop();
        
        cardObj.isFlipped = true;
        cardEl.classList.add('flipped');
        
        this.flippedCards.push(cardObj);
        
        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const [c1, c2] = this.flippedCards;
        
        if (c1.emoji === c2.emoji) {
            // Match
            if (window.GameAudio) window.GameAudio.playCoin();
            this.score += 25;
            this.matches++;
            
            setTimeout(() => {
                c1.isMatched = true; c2.isMatched = true;
                c1.el.classList.add('matched'); c2.el.classList.add('matched');
                this.flippedCards = [];
                
                if (this.matches >= this.items.length / 2) {
                    this.endGame(true);
                }
            }, 500);
            
        } else {
            // No match
            this.health -= 15;
            if (window.GameAudio) window.GameAudio.playError();
            
            setTimeout(() => {
                c1.isFlipped = false; c2.isFlipped = false;
                c1.el.classList.remove('flipped'); c2.el.classList.remove('flipped');
                this.flippedCards = [];
                
                if (this.health <= 0) {
                    this.endGame(false);
                }
            }, 1000);
        }
        
        this.updateUI();
    }

    update() {}
    draw() {}

    updateUI() {
        const scoreEl = document.getElementById('game-score');
        const timerEl = document.getElementById('game-timer');
        if (scoreEl) scoreEl.textContent = `Skor: ${this.score}`;
        if (timerEl) timerEl.textContent = '∞';
        if (window.UI) window.UI.updateHealthBar(this.health);
    }

    endGame(isWin) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        let stars = 0; let coins = 0;
        
        if (isWin) {
            stars = this.health >= 100 ? 3 : (this.health >= 70 ? 2 : 1);
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
