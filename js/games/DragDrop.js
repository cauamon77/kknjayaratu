class DragDropGame {
    constructor(container, category) {
        this.container = container;
        this.category = category; // 'AB' or 'CT'
        
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        
        if (this.category === 'AB') {
            this.zones = [
                { id: 'good', name: '✅ Sikap Baik' },
                { id: 'bad', name: '❌ Bullying' }
            ];
            this.items = [
                { id: 'i1', text: 'Menolong Teman', target: 'good' },
                { id: 'i2', text: 'Mengejek', target: 'bad' },
                { id: 'i3', text: 'Berbagi Bekal', target: 'good' },
                { id: 'i4', text: 'Memukul', target: 'bad' },
                { id: 'i5', text: 'Minta Maaf', target: 'good' },
                { id: 'i6', text: 'Merebut Mainan', target: 'bad' }
            ];
        } else {
            this.zones = [
                { id: 'step1', name: 'Langkah 1' },
                { id: 'step2', name: 'Langkah 2' },
                { id: 'step3', name: 'Langkah 3' },
                { id: 'step4', name: 'Langkah 4' }
            ];
            this.items = [
                { id: 'i1', text: 'Basahi & Sabun', target: 'step1' },
                { id: 'i2', text: 'Gosok Punggung Tangan', target: 'step2' },
                { id: 'i3', text: 'Gosok Sela Jari', target: 'step3' },
                { id: 'i4', text: 'Bilas & Keringkan', target: 'step4' }
            ];
        }
        
        // Shuffle items
        this.items.sort(() => Math.random() - 0.5);
        this.placedCount = 0;
    }

    init() {
        this.container.innerHTML = `
            <div style="text-align:center; margin-bottom:10px; font-weight:bold; color:var(--primary-color);">
                📺 Klik item, lalu klik tempat tujuannya!
            </div>
            <div class="drop-zone-container" id="drop-zones"></div>
            <div class="drag-items-container" id="drag-items"></div>
        `;
        
        const dropZonesEl = document.getElementById('drop-zones');
        const dragItemsEl = document.getElementById('drag-items');
        
        this.selectedItemId = null;
        
        this.zones.forEach(zone => {
            const z = document.createElement('div');
            z.className = 'drop-zone';
            z.setAttribute('data-id', zone.id);
            z.innerHTML = `<h3>${zone.name}</h3>`;
            z.style.cursor = 'pointer';
            
            // Smart TV compatible click event
            const onZoneClick = () => {
                if (this.isGameOver || !this.selectedItemId) return;
                this.handlePlacement(this.selectedItemId, zone.id);
            };
            
            z.addEventListener('mousedown', onZoneClick);
            z.addEventListener('touchstart', (e) => { e.preventDefault(); onZoneClick(); }, {passive: false});
            
            dropZonesEl.appendChild(z);
        });
        
        this.items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'draggable';
            el.setAttribute('data-id', item.id);
            el.textContent = item.text;
            el.style.cursor = 'pointer';
            
            const onItemClick = () => {
                if (this.isGameOver) return;
                // Deselect others
                document.querySelectorAll('.draggable').forEach(d => {
                    d.style.transform = 'scale(1)';
                    d.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
                    d.style.borderColor = 'white';
                });
                
                // Select this one
                this.selectedItemId = item.id;
                el.style.transform = 'scale(1.1)';
                el.style.boxShadow = '0 0 15px var(--primary-color)';
                el.style.borderColor = 'var(--primary-color)';
            };
            
            el.addEventListener('mousedown', onItemClick);
            el.addEventListener('touchstart', (e) => { e.preventDefault(); onItemClick(); }, {passive: false});
            
            dragItemsEl.appendChild(el);
        });
        
        this.updateUI();
    }

    handlePlacement(itemId, zoneId) {
        if (this.isGameOver) return;
        
        const item = this.items.find(i => i.id === itemId);
        const el = document.querySelector(`.draggable[data-id="${itemId}"]`);
        
        if (!item || !el) return;
        
        if (item.target === zoneId) {
            // Correct
            if (window.GameAudio) window.GameAudio.playCoin();
            this.score += 50;
            this.placedCount++;
            
            // Move element
            const zoneEl = document.querySelector(`.drop-zone[data-id="${zoneId}"]`);
            zoneEl.appendChild(el);
            
            // Disable further clicks
            el.style.cursor = 'default';
            el.style.boxShadow = 'none';
            el.style.borderColor = 'var(--success-color)';
            el.style.transform = 'scale(1)';
            el.style.pointerEvents = 'none';
            
            this.selectedItemId = null;
            
            if (this.placedCount >= this.items.length) {
                this.endGame(true);
            }
        } else {
            // Wrong
            if (window.GameAudio) window.GameAudio.playError();
            this.health -= 20;
            
            // Shake animation
            el.style.animation = 'shake 0.5s';
            setTimeout(() => {
                el.style.animation = '';
            }, 500);
            
            if (this.health <= 0) {
                this.endGame(false);
            }
        }
        
        this.updateUI();
    }

    update() {}
    draw() {}

    updateUI() {
        const scoreEl = document.getElementById('game-score');
        const timerEl = document.getElementById('game-timer');
        if (scoreEl) scoreEl.textContent = `Skor: ${this.score}`;
        if (timerEl) timerEl.textContent = '∞'; // No timer for drag drop
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
