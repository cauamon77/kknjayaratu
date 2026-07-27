class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
        
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.connect(this.ctx.destination);
        this.masterVolume.gain.value = 0.3;
        
        this.bgmVolume = this.ctx.createGain();
        this.bgmVolume.connect(this.masterVolume);
        this.bgmVolume.gain.value = 0.2;
        
        this.bgmOscillator = null;
        this.isPlayingBGM = false;
        
        // Setup mute button
        const btnSound = document.getElementById('btn-sound');
        if (btnSound) {
            btnSound.addEventListener('click', () => this.toggleMute());
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.masterVolume.gain.value = this.isMuted ? 0 : 0.3;
        const btnSound = document.getElementById('btn-sound');
        if (btnSound) {
            btnSound.textContent = this.isMuted ? '🔇' : '🔊';
        }
        
        if (!this.isMuted && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        if (!this.isMuted && !this.isPlayingBGM) {
            this.playBGM();
        }
    }

    playBGM() {
        if (this.isPlayingBGM || this.isMuted) return;
        
        // Twinkle Twinkle Little Star melody
        // C C G G A A G, F F E E D D C
        const notes = [
            {f: 261.63, d: 1}, {f: 261.63, d: 1}, {f: 392.00, d: 1}, {f: 392.00, d: 1}, 
            {f: 440.00, d: 1}, {f: 440.00, d: 1}, {f: 392.00, d: 2},
            {f: 349.23, d: 1}, {f: 349.23, d: 1}, {f: 329.63, d: 1}, {f: 329.63, d: 1}, 
            {f: 293.66, d: 1}, {f: 293.66, d: 1}, {f: 261.63, d: 2}
        ];
        let noteIndex = 0;
        const baseSpeed = 400; // ms per beat
        
        const playNextNote = () => {
            if (this.isMuted) {
                this.isPlayingBGM = false;
                return;
            }
            this.isPlayingBGM = true;
            
            const note = notes[noteIndex];
            const durationMs = note.d * baseSpeed;
            const durationSec = durationMs / 1000;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine'; // softer for kids
            osc.frequency.setValueAtTime(note.f, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + durationSec * 0.9);
            
            osc.connect(gain);
            gain.connect(this.bgmVolume);
            
            osc.start();
            osc.stop(this.ctx.currentTime + durationSec);
            
            noteIndex = (noteIndex + 1) % notes.length;
            
            this.bgmTimeout = setTimeout(playNextNote, durationMs);
        };
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(playNextNote);
        } else {
            playNextNote();
        }
    }

    stopBGM() {
        this.isPlayingBGM = false;
        clearTimeout(this.bgmTimeout);
    }

    playTone(frequency, type, duration, vol = 1) {
        if (this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playCoin() { this.playTone(880, 'sine', 0.1, 0.4); setTimeout(() => this.playTone(1320, 'sine', 0.2, 0.4), 100); }
    playError() { this.playTone(150, 'sawtooth', 0.3, 0.5); }
    playWin() { [440, 554, 659, 880].forEach((freq, i) => setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.4), i * 150)); }
    playPop() { this.playTone(800, 'sine', 0.05, 0.3); }
}

window.GameAudio = new AudioManager();

// Auto-start BGM on first user interaction
document.addEventListener('click', function startBGMOnce() {
    if (window.GameAudio && !window.GameAudio.isPlayingBGM && !window.GameAudio.isMuted) {
        window.GameAudio.playBGM();
    }
    document.removeEventListener('click', startBGMOnce);
}, { once: true });

document.addEventListener('touchstart', function startBGMOnceTouch() {
    if (window.GameAudio && !window.GameAudio.isPlayingBGM && !window.GameAudio.isMuted) {
        window.GameAudio.playBGM();
    }
    document.removeEventListener('touchstart', startBGMOnceTouch);
}, { once: true });
