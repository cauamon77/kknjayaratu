class GameEngine {
    constructor() {
        this.currentGame = null;
        this.animationFrameId = null;
        this.lastTime = 0;
        this.isPaused = false;
        
        // Setup Pause Button
        const btnPause = document.getElementById('btn-pause');
        if (btnPause) {
            btnPause.addEventListener('click', () => this.togglePause());
        }
    }

    startGame(gameInstance) {
        if (this.currentGame) {
            this.stopGame();
        }
        
        this.currentGame = gameInstance;
        this.isPaused = false;
        
        // Ensure AudioContext is running (requires user interaction first)
        if (window.GameAudio && window.GameAudio.ctx.state === 'suspended') {
            window.GameAudio.ctx.resume();
        }
        
        if (this.currentGame.init) {
            this.currentGame.init();
        }
        
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stopGame() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.currentGame && this.currentGame.cleanup) {
            this.currentGame.cleanup();
        }
        this.currentGame = null;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const btnPause = document.getElementById('btn-pause');
        if (btnPause) {
            btnPause.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        }
        
        if (!this.isPaused && this.currentGame) {
            this.lastTime = performance.now();
            this.loop(this.lastTime);
        }
    }

    loop(timestamp) {
        if (this.isPaused || !this.currentGame) return;

        const deltaTime = (timestamp - this.lastTime) / 1000; // in seconds
        this.lastTime = timestamp;

        if (this.currentGame.update) {
            this.currentGame.update(deltaTime);
        }
        
        if (this.currentGame.draw) {
            this.currentGame.draw();
        }

        this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
    }
}

window.Engine = new GameEngine();
