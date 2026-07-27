class QuizGame {
    constructor(container, category) {
        this.container = container;
        this.category = category;
        
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        
        this.questions = [
            {
                q: "Ada teman barumu yang sendirian di jam istirahat. Apa yang kamu lakukan?",
                options: [
                    { text: "Mengajaknya bermain bersama", isCorrect: true },
                    { text: "Mengejeknya karena tidak punya teman", isCorrect: false },
                    { text: "Meninggalkannya sendiri", isCorrect: false }
                ]
            },
            {
                q: "Temanmu tidak sengaja menjatuhkan bekalmu. Apa responmu?",
                options: [
                    { text: "Marah besar dan memukulnya", isCorrect: false },
                    { text: "Memaafkannya jika ia meminta maaf", isCorrect: true },
                    { text: "Membuang bekalnya juga", isCorrect: false }
                ]
            },
            {
                q: "Kamu melihat seseorang dibully oleh anak lain. Apa tindakan terbaik?",
                options: [
                    { text: "Ikut menertawakan", isCorrect: false },
                    { text: "Pura-pura tidak melihat", isCorrect: false },
                    { text: "Segera melapor ke guru", isCorrect: true }
                ]
            }
        ];
        
        this.currentQuestion = 0;
    }

    init() {
        this.container.innerHTML = `
            <div class="quiz-container" id="quiz-box">
                <div class="quiz-question" id="q-text"></div>
                <div class="quiz-options" id="q-options"></div>
            </div>
        `;
        
        this.renderQuestion();
        this.updateUI();
    }

    renderQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame(true);
            return;
        }
        
        const qData = this.questions[this.currentQuestion];
        document.getElementById('q-text').textContent = qData.q;
        
        const optsContainer = document.getElementById('q-options');
        optsContainer.innerHTML = '';
        
        // Shuffle options
        const shuffled = [...qData.options].sort(() => Math.random() - 0.5);
        
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.textContent = opt.text;
            
            btn.addEventListener('click', () => {
                if (opt.isCorrect) {
                    if (window.GameAudio) window.GameAudio.playCoin();
                    this.score += 50;
                    this.currentQuestion++;
                    this.renderQuestion();
                } else {
                    if (window.GameAudio) window.GameAudio.playError();
                    this.health -= 35;
                    btn.style.backgroundColor = 'var(--danger-color)';
                    btn.style.color = 'white';
                    
                    if (this.health <= 0) {
                        this.endGame(false);
                    }
                }
                this.updateUI();
            });
            
            optsContainer.appendChild(btn);
        });
    }

    update() {}
    draw() {}

    updateUI() {
        const scoreEl = document.getElementById('game-score');
        const timerEl = document.getElementById('game-timer');
        if (scoreEl) scoreEl.textContent = `Skor: ${this.score}`;
        if (timerEl) timerEl.textContent = `${this.currentQuestion}/${this.questions.length}`;
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
                window.GameStorage.unlockLevel(this.category, curLevel + 1);
            }
        }
        
        setTimeout(() => {
            if (window.UI) {
                const screen = this.category === 'AB' ? 'screen-menu-anti-bullying' : 'screen-menu-cuci-tangan';
                window.UI.showResultPopup(stars, this.score, coins, () => {
                    window.UI.showScreen(screen);
                });
            }
        }, 500);
    }

    cleanup() {
        this.container.innerHTML = '';
    }
}
