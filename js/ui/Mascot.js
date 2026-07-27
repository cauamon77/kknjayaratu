class Mascot {
    constructor() {
        this.container = document.getElementById('mascot-container');
        this.dialogueText = document.getElementById('dialogue-text');
        this.avatar = document.getElementById('mascot-avatar');
        this.btnNext = document.getElementById('btn-dialogue-next');
        
        this.queue = [];
        this.isSpeaking = false;
        
        if (this.btnNext) {
            this.btnNext.addEventListener('click', () => this.nextDialogue());
        }
    }

    setMascot(emoji) {
        if (this.avatar) {
            this.avatar.textContent = emoji;
        }
    }

    say(textArray, onComplete = null) {
        if (!Array.isArray(textArray)) {
            textArray = [textArray];
        }
        
        this.queue = textArray;
        this.onComplete = onComplete;
        this.isSpeaking = true;
        
        this.container.classList.remove('hidden');
        this.container.classList.add('show');
        
        this.showNext();
    }

    showNext() {
        if (this.queue.length > 0) {
            const text = this.queue.shift();
            this.dialogueText.textContent = text;
            
            if (window.GameAudio) {
                window.GameAudio.playPop();
            }
            
            if (this.queue.length === 0) {
                this.btnNext.textContent = 'Tutup ✖️';
            } else {
                this.btnNext.textContent = 'Lanjut 👉';
            }
        } else {
            this.hide();
        }
    }

    nextDialogue() {
        this.showNext();
    }

    hide() {
        this.container.classList.remove('show');
        setTimeout(() => {
            this.container.classList.add('hidden');
            this.isSpeaking = false;
            if (this.onComplete) {
                this.onComplete();
                this.onComplete = null;
            }
        }, 500); // Wait for transition
    }
}

window.GameMascot = new Mascot();
