class ShopManager {
    constructor() {
        this.items = [
            { id: 'mascot_fox', type: 'mascot', name: 'Rubah Cerdas', icon: '🦊', price: 0 },
            { id: 'mascot_cat', type: 'mascot', name: 'Kucing Imut', icon: '🐱', price: 100 },
            { id: 'mascot_dog', type: 'mascot', name: 'Anjing Setia', icon: '🐶', price: 150 },
            { id: 'mascot_robot', type: 'mascot', name: 'Robot Pintar', icon: '🤖', price: 300 },
            { id: 'mascot_alien', type: 'mascot', name: 'Alien Lucu', icon: '👽', price: 500 }
        ];
        
        // Ensure default items are in inventory
        if (window.GameStorage && !window.GameStorage.state.inventory.includes('mascot_fox')) {
            window.GameStorage.state.inventory.push('mascot_fox');
            window.GameStorage.saveState();
        }
    }

    renderShop() {
        const container = document.getElementById('shop-items');
        if (!container || !window.GameStorage) return;
        
        container.innerHTML = '';
        
        const state = window.GameStorage.state;
        
        this.items.forEach(item => {
            const isOwned = state.inventory.includes(item.id);
            const isEquipped = state.equippedMascot === item.icon;
            
            const card = document.createElement('div');
            card.className = 'menu-card';
            
            card.innerHTML = `
                <div class="card-icon">${item.icon}</div>
                <h2>${item.name}</h2>
                <p>${isOwned ? 'Sudah Dimiliki' : '🪙 ' + item.price}</p>
                <button class="btn-action ${isOwned ? (isEquipped ? '' : 'primary') : 'btn-buy'}">
                    ${isEquipped ? 'Dipakai' : (isOwned ? 'Pakai' : 'Beli')}
                </button>
            `;
            
            const btn = card.querySelector('button');
            
            if (isEquipped) {
                btn.disabled = true;
                btn.style.opacity = 0.5;
            } else if (isOwned) {
                btn.addEventListener('click', () => {
                    window.GameStorage.state.equippedMascot = item.icon;
                    window.GameStorage.saveState();
                    if (window.GameMascot) {
                        window.GameMascot.setMascot(item.icon);
                    }
                    this.renderShop(); // re-render
                });
            } else {
                btn.addEventListener('click', () => {
                    if (window.GameStorage.buyItem(item)) {
                        if (window.GameAudio) window.GameAudio.playCoin();
                        this.renderShop();
                    } else {
                        if (window.GameAudio) window.GameAudio.playError();
                        // Shake effect for insufficient coins
                        card.style.animation = 'shake 0.5s';
                        setTimeout(() => card.style.animation = '', 500);
                    }
                });
            }
            
            container.appendChild(card);
        });
    }
}

// Add CSS for shake inline or just rely on simple style
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
`;
document.head.appendChild(style);

window.Shop = new ShopManager();
