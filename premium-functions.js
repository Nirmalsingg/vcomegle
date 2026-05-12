// Premium Features Functions

function showPremiumUpgrade() {
    window.open('premium-features.html', '_blank');
}

function sendGift(giftType) {
    if (vcomingleMonetization.sendVirtualGift(giftType, 'current_stranger')) {
        console.log(`Gift sent: ${giftType}`);
    }
}

function toggleRevenueDashboard() {
    const dashboard = document.getElementById('revenueDashboard');
    dashboard.classList.toggle('show');
    
    if (dashboard.classList.contains('show')) {
        updateRevenueDashboard();
    }
}

function updateRevenueDashboard() {
    const stats = vcomingleMonetization.getRevenueStats();
    
    document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
    document.getElementById('premiumUsers').textContent = stats.premiumUpgrades;
    document.getElementById('vipUsers').textContent = stats.vipUpgrades;
    document.getElementById('giftsRevenue').textContent = `$${stats.virtualGiftsRevenue.toFixed(2)}`;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
}

function initializePremiumFeatures() {
    // Update premium button based on user tier
    const premiumBtn = document.getElementById('premiumBtn');
    
    if (vcomingleMonetization.userTier === 'premium') {
        premiumBtn.textContent = 'Premium Member';
        premiumBtn.classList.add('premium');
        premiumBtn.onclick = () => alert('You are already a Premium member!');
    } else if (vcomingleMonetization.userTier === 'vip') {
        premiumBtn.textContent = 'VIP Member';
        premiumBtn.classList.add('vip');
        premiumBtn.onclick = () => alert('You are already a VIP member!');
    }
    
    // Show virtual gifts panel for premium users
    if (vcomingleMonetization.hasVirtualGifts()) {
        setTimeout(() => {
            document.getElementById('virtualGiftsPanel').classList.add('show');
        }, 5000);
    }
    
    // Show ads for free users
    if (!vcomingleMonetization.isAdFree()) {
        setInterval(() => {
            vcomingleMonetization.showAd();
        }, 300000); // Every 5 minutes
    }
    
    // Add revenue dashboard toggle for admin
    if (vcomingleMonetization.userTier === 'vip') {
        const adminBtn = document.createElement('button');
        adminBtn.textContent = '📊 Revenue';
        adminBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: #333;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            z-index: 1000;
        `;
        adminBtn.onclick = toggleRevenueDashboard;
        document.body.appendChild(adminBtn);
    }
}

// Enhanced VComingleApp with Monetization
class VComingleAppWithMonetization extends VComingleApp {
    constructor() {
        super();
        this.initializeMonetizationFeatures();
    }
    
    initializeMonetizationFeatures() {
        // Track revenue for chat sessions
        this.trackChatSession();
        
        // Show premium upgrade prompts
        this.showPremiumPrompts();
        
        // Enable premium features
        this.enablePremiumFeatures();
    }
    
    trackChatSession() {
        // Track when users start chatting
        const originalStartChat = this.startChat.bind(this);
        this.startChat = () => {
            originalStartChat();
            vcomingleMonetization.trackRevenue('chat_session_started');
        };
    }
    
    showPremiumPrompts() {
        // Show upgrade prompts after certain actions
        setTimeout(() => {
            if (vcomingleMonetization.userTier === 'free') {
                this.showUpgradePrompt();
            }
        }, 120000); // After 2 minutes
    }
    
    showUpgradePrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'upgrade-prompt';
        prompt.innerHTML = `
            <div class="upgrade-prompt-content">
                <h3>🚀 Upgrade Your Experience</h3>
                <p>Remove ads, get HD video, and unlock premium features!</p>
                <button onclick="vcomingleMonetization.upgradeToPremium()">Upgrade Now</button>
                <button onclick="this.parentElement.parentElement.remove()">Maybe Later</button>
            </div>
        `;
        document.body.appendChild(prompt);
        
        setTimeout(() => {
            if (prompt.parentElement) {
                prompt.remove();
            }
        }, 10000);
    }
    
    enablePremiumFeatures() {
        // Enable HD video for premium users
        if (vcomingleMonetization.hasHDVideo()) {
            this.enableHDVideo();
        }
        
        // Enable 4K video for VIP users
        if (vcomingleMonetization.has4KVideo()) {
            this.enable4KVideo();
        }
        
        // Enable priority matching
        if (vcomingleMonetization.hasPriorityMatching()) {
            this.enablePriorityMatching();
        }
    }
    
    enableHDVideo() {
        // Set higher video constraints for premium users
        this.hdConstraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 }
            },
            audio: true
        };
    }
    
    enable4KVideo() {
        // Set 4K video constraints for VIP users
        this.vipConstraints = {
            video: {
                width: { ideal: 3840 },
                height: { ideal: 2160 },
                frameRate: { ideal: 60 }
            },
            audio: true
        };
    }
    
    enablePriorityMatching() {
        // Add priority flag to matchmaking request
        const originalFindMatch = this.findMatch.bind(this);
        this.findMatch = () => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('find-match', {
                    textOnly: this.textOnly,
                    interests: this.interestsInput.value,
                    priority: vcomingleMonetization.hasPriorityMatching()
                });
            } else {
                this.fallbackToDemoMode();
            }
        };
    }
    
    async initializeLocalMedia() {
        // Use enhanced video constraints based on user tier
        let constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        };
        
        if (vcomingleMonetization.has4KVideo() && this.vipConstraints) {
            constraints = this.vipConstraints;
        } else if (vcomingleMonetization.hasHDVideo() && this.hdConstraints) {
            constraints = this.hdConstraints;
        }
        
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localVideo.srcObject = this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }
}

// CSS for upgrade prompts
const upgradePromptCSS = `
.upgrade-prompt {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 1000;
    text-align: center;
    max-width: 350px;
}

.upgrade-prompt-content h3 {
    color: #333;
    margin-bottom: 10px;
}

.upgrade-prompt-content p {
    color: #666;
    margin-bottom: 15px;
}

.upgrade-prompt-content button {
    margin: 5px;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.upgrade-prompt-content button:first-of-type {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.upgrade-prompt-content button:last-of-type {
    background: #f0f0f0;
    color: #333;
}
`;

// Add CSS to page
const styleSheet = document.createElement('style');
styleSheet.textContent = upgradePromptCSS;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Use enhanced app with monetization
    window.vcomingleApp = new VComingleAppWithMonetization();
    
    // Initialize premium features
    initializePremiumFeatures();
    
    // Update revenue dashboard every 30 seconds
    setInterval(updateRevenueDashboard, 30000);
});
