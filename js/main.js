document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    window.GameStorage.updateUI();
    
    // Add listeners to level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('locked')) {
                if (window.GameAudio) window.GameAudio.playError();
                return;
            }
            
            const gameId = btn.getAttribute('data-game');
            if (gameId) {
                if (window.GameAudio) window.GameAudio.playCoin();
                launchGame(gameId);
            }
        });
    });
});

function launchGame(gameId) {
    // Transition to game screen
    window.UI.showScreen('screen-game');
    
    // Clear game area
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    
    // Stop any running game
    if (window.Engine.currentGame) {
        window.Engine.stopGame();
    }
    
    let gameInstance = null;
    let instructions = { title: "", text: "" };
    
    // Launch specific game based on ID
    switch(gameId) {
        case 'AB-1': // Tap Kindness
            gameInstance = new TapKindnessGame(gameArea);
            instructions = { title: "Pilih Kebaikan!", text: "Ada 3 kartu emoji. Klik kartu yang menunjukkan perbuatan BAIK! Jangan klik yang buruk ya!" };
            break;
        case 'AB-2': // Drag Drop Sikap
            gameInstance = new DragDropGame(gameArea, 'AB');
            instructions = { title: "Sikap Baik vs Buruk", text: "Seret kotak ke tempat yang benar! Pisahkan mana yang perbuatan baik dan mana yang bullying." };
            break;
        case 'AB-3': // Cheer Up Game (Whack a mole style)
            gameInstance = new CheerUpGame(gameArea);
            instructions = { title: "Hibur Teman!", text: "Banyak teman yang sedang sedih 😢! Cepat klik mereka untuk memberikan pelukan dan membuat mereka tersenyum 😊! Jangan klik anak yang sedang marah 😡 ya!" };
            break;
        case 'AB-4': // Quiz Cerita
            gameInstance = new QuizGame(gameArea, 'AB');
            instructions = { title: "Cerita Interaktif", text: "Baca ceritanya dan pilih tindakan yang paling tepat untuk membantu temanmu!" };
            break;
        case 'AB-5': // Maze
            gameInstance = new MazeGame(gameArea);
            instructions = { title: "Labirin Persahabatan", text: "Gunakan panah (Atas/Bawah/Kiri/Kanan) untuk menolong teman yang menangis (😢). Hindari pembully (😡) di jalan!" };
            break;
            
        case 'CT-1': // Kill Germs L1
            gameInstance = new KillGermsGame(gameArea, { difficulty: 1, duration: 20 });
            instructions = { title: "Kill The Germs", text: "Klik atau sentuh kuman nakal untuk membasminya dengan sabun!" };
            break;
        case 'CT-2': // Drag Drop Cuci Tangan
            gameInstance = new DragDropGame(gameArea, 'CT');
            instructions = { title: "Urutkan Langkah", text: "Seret dan urutkan langkah-langkah mencuci tangan yang benar dari kiri ke kanan!" };
            break;
        case 'CT-3': // Memory Game
            gameInstance = new MemoryGame(gameArea);
            instructions = { title: "Kartu Ingatan", text: "Buka kartu dan cari pasangannya (Sabun, Air, Handuk)!" };
            break;
        case 'CT-4': // Spot Clean
            gameInstance = new SpotCleanGame(gameArea);
            instructions = { title: "Tebak yang Bersih!", text: "Pilih jawaban yang paling benar tentang kebersihan dan cuci tangan!" };
            break;
        case 'CT-5': // Washing Simulator
            gameInstance = new WashingSimulatorGame(gameArea);
            instructions = { title: "Simulasi Cuci Tangan", text: "Usap dan gosok-gosok tangan kotor yang ada di layar menggunakan jari/kursor sampai berbusa dan bersih!" };
            break;
            
        default:
            console.error("Unknown game ID:", gameId);
            return;
    }
    
    if (gameInstance) {
        // We inject the gameId so we know what level to unlock next when winning
        gameInstance.gameId = gameId; 
        window.UI.showInstructions(instructions.title, instructions.text, () => {
            window.Engine.startGame(gameInstance);
        });
    }
}
