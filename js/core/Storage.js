class StorageManager {
    constructor() {
        this.prefix = 'edukasi_game_v2_';
        this.defaultState = {
            coins: 0,
            stars: 0,
            unlockedLevels: {
                AB: 1, // Anti Bullying
                CT: 1  // Cuci Tangan
            }
        };
        this.state = this.loadState();
    }

    loadState() {
        try {
            const saved = localStorage.getItem(this.prefix + 'save');
            if (saved) {
                return { ...this.defaultState, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Gagal memuat save data:', e);
        }
        return this.defaultState;
    }

    saveState() {
        try {
            localStorage.setItem(this.prefix + 'save', JSON.stringify(this.state));
            this.updateUI();
        } catch (e) {
            console.error('Gagal menyimpan data:', e);
        }
    }

    addCoins(amount) {
        this.state.coins += amount;
        this.saveState();
    }

    addStars(amount) {
        this.state.stars += amount;
        this.saveState();
    }

    unlockLevel(category, levelNum) {
        if (this.state.unlockedLevels[category] < levelNum) {
            this.state.unlockedLevels[category] = levelNum;
            this.saveState();
        }
    }

    updateUI() {
        const coinEl = document.getElementById('coin-count');
        const starEl = document.getElementById('star-count');
        
        if (coinEl) coinEl.textContent = this.state.coins;
        if (starEl) starEl.textContent = this.state.stars;

        // Unlock buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            const gameId = btn.getAttribute('data-game');
            if (!gameId) return;
            
            const category = gameId.split('-')[0];
            const levelStr = gameId.split('-')[1];
            
            if (category && levelStr) {
                const level = parseInt(levelStr);
                const unlocked = this.state.unlockedLevels[category];
                
                if (level <= unlocked) {
                    btn.classList.remove('locked');
                    let p = btn.querySelector('p');
                    p.textContent = p.textContent.replace('🔒', '').trim();
                } else {
                    btn.classList.add('locked');
                    let p = btn.querySelector('p');
                    if (!p.textContent.includes('🔒')) {
                        p.textContent += ' 🔒';
                    }
                }
            }
        });
    }
}

window.GameStorage = new StorageManager();
