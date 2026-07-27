class SpotCleanGame {
    constructor(container) {
        this.container = container;
        this.container.style.position = 'relative';
        
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        this.round = 0;
        this.totalRounds = 6;
        
        this.scenarios = [
            {
                question: "Mana yang BERSIH dan HIGIENIS?",
                options: [
                    { emoji: '🧼', text: 'Tangan bersabun', isCorrect: true },
                    { emoji: '🤢', text: 'Tangan kotor', isCorrect: false },
                    { emoji: '🦠', text: 'Kuman di jari', isCorrect: false }
                ]
            },
            {
                question: "Pakai apa untuk cuci tangan?",
                options: [
                    { emoji: '🧴', text: 'Sabun Cair', isCorrect: true },
                    { emoji: '🍫', text: 'Cokelat', isCorrect: false },
                    { emoji: '🖍️', text: 'Krayon', isCorrect: false }
                ]
            },
            {
                question: "Kapan harus cuci tangan?",
                options: [
                    { emoji: '🍽️', text: 'Sebelum Makan', isCorrect: true },
                    { emoji: '😴', text: 'Saat Tidur', isCorrect: false },
                    { emoji: '📺', text: 'Nonton TV', isCorrect: false }
                ]
            },
            {
                question: "Keringkan tangan pakai apa?",
                options: [
                    { emoji: '🧻', text: 'Handuk Bersih', isCorrect: true },
                    { emoji: '👖', text: 'Celana', isCorrect: false },
                    { emoji: '🐶', text: 'Bulu Hewan', isCorrect: false }
                ]
            },
            {
                question: "Berapa lama cuci tangan yang baik?",
                options: [
                    { emoji: '⏱️', text: '20 Detik', isCorrect: true },
                    { emoji: '⚡', text: '1 Detik', isCorrect: false },
                    { emoji: '😵', text: '1 Jam', isCorrect: false }
                ]
            },
            {
                question: "Bagian tangan mana yang harus digosok?",
                options: [
                    { emoji: '🤲', text: 'Semua Bagian', isCorrect: true },
                    { emoji: '☝️', text: 'Jari Telunjuk Saja', isCorrect: false },
                    { emoji: '✊', text: 'Kepalan Saja', isCorrect: false }
                ]
            }
        ];
    }

    init() {
        this.container.innerHTML = `
            <div style="text-align:center; padding:10px;">
                <h2 id="spot-question" style="font-size:1.4rem; margin-bottom:10px; color:#2C3E50; background:rgba(255,255,255,0.8); padding:10px; border-radius:15px;">Pertanyaan</h2>
                <div id="spot-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; padding:10px;"></div>
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
        
        const scenario = this.scenarios[this.round];
        const questionEl = document.getElementById('spot-question');
        const grid = document.getElementById('spot-grid');
        if (!questionEl || !grid) return;
        
        questionEl.textContent = scenario.question;
        grid.innerHTML = '';
        
        const shuffled = [...scenario.options].sort(() => Math.random() - 0.5);
        
        shuffled.forEach(opt => {
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
                
                if (opt.isCorrect) {
                    card.style.borderColor = '#2ecc71';
                    card.style.background = '#d5f5e3';
                    if (window.GameAudio) window.GameAudio.playCoin();
                    this.score += 20;
                    this.round++;
                    
                    setTimeout(() => this.showRound(), 600);
                } else {
                    card.style.borderColor = '#e74c3c';
                    card.style.background = '#fadbd8';
                    card.style.animation = 'shake 0.5s';
                    if (window.GameAudio) window.GameAudio.playError();
                    this.health -= 25;
                    
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
