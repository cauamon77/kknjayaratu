class UIManager {
    constructor() {
        this.currentScreen = 'screen-main-menu';
        
        // Navigation Buttons
        document.querySelectorAll('[data-target]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.showScreen(`screen-${target}`);
            });
        });

        // Home button
        document.getElementById('btn-home').addEventListener('click', () => {
            if (window.Engine && window.Engine.currentGame) {
                window.Engine.stopGame();
            }
            this.showScreen('screen-main-menu');
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        
        this.currentScreen = screenId;
        
        const homeBtn = document.getElementById('btn-home');
        homeBtn.style.display = (screenId === 'screen-main-menu') ? 'none' : 'block';
    }
    
    showInstructions(title, text, onStart) {
        const overlay = document.getElementById('game-instruction-overlay');
        const titleEl = document.getElementById('instruction-title');
        const textEl = document.getElementById('instruction-text');
        const btnStart = document.getElementById('btn-start-game');
        
        titleEl.textContent = title;
        textEl.textContent = text;
        
        overlay.classList.remove('hidden');
        
        // Replace listener
        const newBtn = btnStart.cloneNode(true);
        btnStart.parentNode.replaceChild(newBtn, btnStart);
        
        newBtn.addEventListener('click', () => {
            overlay.classList.add('hidden');
            if(onStart) onStart();
        });
    }

    showResultPopup(stars, score, coinsEarned, nextLevelFn) {
        const popup = document.getElementById('screen-result');
        const starsEl = document.getElementById('result-stars');
        const scoreEl = document.getElementById('result-score');
        const rewardEl = document.getElementById('result-reward');
        
        let starsStr = '';
        for(let i=0; i<3; i++) {
            starsStr += i < stars ? '⭐' : '☆';
        }
        starsEl.textContent = starsStr;
        
        scoreEl.textContent = `Skor: ${score}`;
        rewardEl.textContent = `+${coinsEarned} 🪙 Koin`;
        
        popup.classList.add('active');
        
        this.createConfetti();
        if (window.GameAudio && stars > 0) window.GameAudio.playWin();
        if (window.GameAudio && stars === 0) window.GameAudio.playError();

        const btnNext = document.getElementById('btn-next-level');
        const btnRetry = document.getElementById('btn-retry');
        
        const newBtnNext = btnNext.cloneNode(true);
        const newBtnRetry = btnRetry.cloneNode(true);
        btnNext.parentNode.replaceChild(newBtnNext, btnNext);
        btnRetry.parentNode.replaceChild(newBtnRetry, btnRetry);
        
        newBtnNext.addEventListener('click', () => {
            popup.classList.remove('active');
            if(nextLevelFn) nextLevelFn();
        });
        
        newBtnRetry.addEventListener('click', () => {
            popup.classList.remove('active');
            if (window.Engine && window.Engine.currentGame) {
                // To restart we have to relaunch using main.js launchGame
                const gameId = window.Engine.currentGame.gameId;
                if(gameId && typeof launchGame !== 'undefined') {
                    launchGame(gameId);
                }
            }
        });
    }

    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#2ECC71', '#9B59B6'];
        for (let i = 0; i < 50; i++) {
            const conf = document.createElement('div');
            conf.classList.add('confetti');
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            document.body.appendChild(conf);
            
            setTimeout(() => conf.remove(), 4000);
        }
    }

    updateHealthBar(percentage) {
        const fill = document.getElementById('health-fill');
        if (fill) {
            fill.style.width = Math.max(0, Math.min(100, percentage)) + '%';
            fill.style.backgroundColor = (percentage < 30) ? 'var(--danger-color)' : 'var(--success-color)';
        }
    }
}

window.UI = new UIManager();
