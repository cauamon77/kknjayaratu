class MazeGame {
    constructor(container) {
        this.container = container;
        
        this.isGameOver = false;
        this.score = 0;
        this.health = 100;
        
        this.gridSize = 10;
        this.cellSize = 40;
        
        this.player = { x: 0, y: 0 };
        this.goal = { x: 9, y: 9 };
        
        // 5 Enemies patrolling
        this.enemies = [
            { x: 3, y: 0, dirX: 1, dirY: 0 },
            { x: 2, y: 5, dirX: 0, dirY: 1 },
            { x: 5, y: 9, dirX: 1, dirY: 0 },
            { x: 9, y: 6, dirX: 0, dirY: 1 },
            { x: 6, y: 4, dirX: 1, dirY: 0 }
        ];
        
        // Complex 10x10 maze walls
        this.walls = [
            '1,0', '1,1', '1,2', '1,3', '1,4', 
            '3,1', '4,1', '5,1', '6,1', '7,1', '8,1',
            '3,3', '3,4', '3,5', '3,6', '3,7',
            '5,3', '6,3', '7,3', '8,3', '9,3',
            '5,5', '5,6', '5,7', '5,8',
            '1,6', '1,7', '1,8', '1,9',
            '7,5', '7,6', '7,7', '8,7',
            '8,5', '9,5'
        ];
        
        this.keys = {};
        this.moveCooldown = 0;
        this.enemyTimer = 0;
    }

    init() {
        this.container.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
                <div class="maze-grid" id="maze-grid" style="margin-bottom: 20px;"></div>
                
                <!-- Virtual D-Pad for Smart TV / Touch -->
                <div class="virtual-dpad" style="
                    display: grid; 
                    grid-template-columns: 60px 60px 60px; 
                    grid-template-rows: 60px 60px; 
                    gap: 10px;
                    margin-top: 10px;
                ">
                    <div style="grid-column: 2;">
                        <button id="btn-up" class="dpad-btn" style="width:100%; height:100%; font-size:2rem; border-radius:10px; border:3px solid #333; background:white; cursor:pointer;">⬆️</button>
                    </div>
                    <div style="grid-column: 1; grid-row: 2;">
                        <button id="btn-left" class="dpad-btn" style="width:100%; height:100%; font-size:2rem; border-radius:10px; border:3px solid #333; background:white; cursor:pointer;">⬅️</button>
                    </div>
                    <div style="grid-column: 2; grid-row: 2;">
                        <button id="btn-down" class="dpad-btn" style="width:100%; height:100%; font-size:2rem; border-radius:10px; border:3px solid #333; background:white; cursor:pointer;">⬇️</button>
                    </div>
                    <div style="grid-column: 3; grid-row: 2;">
                        <button id="btn-right" class="dpad-btn" style="width:100%; height:100%; font-size:2rem; border-radius:10px; border:3px solid #333; background:white; cursor:pointer;">➡️</button>
                    </div>
                </div>
            </div>
        `;
        
        // Keyboard Support (Remote Control arrows)
        document.addEventListener('keydown', e => this.keys[e.key] = true);
        document.addEventListener('keyup', e => this.keys[e.key] = false);
        
        // D-Pad Touch/Mouse Support (Air Mouse)
        const setupBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('mousedown', () => this.keys[key] = true);
            btn.addEventListener('mouseup', () => this.keys[key] = false);
            btn.addEventListener('mouseleave', () => this.keys[key] = false);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[key] = true; }, {passive: false});
            btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[key] = false; }, {passive: false});
        };
        
        setupBtn('btn-up', 'ArrowUp');
        setupBtn('btn-down', 'ArrowDown');
        setupBtn('btn-left', 'ArrowLeft');
        setupBtn('btn-right', 'ArrowRight');
        
        this.renderGrid();
    }

    renderGrid() {
        const grid = document.getElementById('maze-grid');
        if (!grid) return;
        
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        grid.innerHTML = '';
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                
                const posStr = `${x},${y}`;
                if (this.walls.includes(posStr)) {
                    cell.classList.add('maze-wall');
                } else if (this.player.x === x && this.player.y === y) {
                    cell.textContent = '🦊'; // Player
                } else if (this.goal.x === x && this.goal.y === y) {
                    cell.textContent = '😢'; // Crying friend
                } else {
                    let hasEnemy = false;
                    this.enemies.forEach(e => {
                        if (e.x === x && e.y === y) {
                            cell.textContent = '😡';
                            hasEnemy = true;
                        }
                    });
                }
                
                grid.appendChild(cell);
            }
        }
    }

    update(dt) {
        if (this.isGameOver) return;
        
        this.moveCooldown -= dt;
        
        if (this.moveCooldown <= 0) {
            let dx = 0; let dy = 0;
            if (this.keys['ArrowUp'] || this.keys['w']) dy = -1;
            else if (this.keys['ArrowDown'] || this.keys['s']) dy = 1;
            else if (this.keys['ArrowLeft'] || this.keys['a']) dx = -1;
            else if (this.keys['ArrowRight'] || this.keys['d']) dx = 1;
            
            if (dx !== 0 || dy !== 0) {
                const nx = this.player.x + dx;
                const ny = this.player.y + dy;
                
                if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize && !this.walls.includes(`${nx},${ny}`)) {
                    this.player.x = nx;
                    this.player.y = ny;
                    if (window.GameAudio) window.GameAudio.playPop();
                    this.moveCooldown = 0.15; // 150ms delay between grid moves
                    this.renderGrid();
                }
            }
        }
        
        // Move enemies slowly
        this.enemyTimer -= dt;
        if (this.enemyTimer <= 0) {
            this.enemies.forEach(e => {
                let nx = e.x + e.dirX;
                let ny = e.y + e.dirY;
                
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize || this.walls.includes(`${nx},${ny}`)) {
                    e.dirX *= -1;
                    e.dirY *= -1;
                    nx = e.x + e.dirX;
                    ny = e.y + e.dirY;
                }
                e.x = nx;
                e.y = ny;
            });
            this.enemyTimer = 0.35;
            this.renderGrid();
        }
        
        // Collision check
        this.enemies.forEach(e => {
            if (e.x === this.player.x && e.y === this.player.y) {
                this.health -= 50;
                if (window.GameAudio) window.GameAudio.playError();
                
                // Reset player pos
                this.player.x = 0; this.player.y = 0;
                this.renderGrid();
                
                if (this.health <= 0) this.endGame(false);
            }
        });
        
        if (this.player.x === this.goal.x && this.player.y === this.goal.y) {
            this.score = 100;
            this.endGame(true);
        }
        
        this.updateUI();
    }

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
            stars = this.health >= 100 ? 3 : (this.health >= 50 ? 2 : 1);
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
