class VComingleMonetization {
    constructor() {
        this.userTier = 'free'; // free, premium, vip
        this.userId = this.getUserId();
        this.virtualCoins = 0;
        this.initializeMonetization();
    }

    getUserId() {
        // Generate or retrieve user ID
        let userId = localStorage.getItem('vcomingle_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('vcomingle_user_id', userId);
        }
        return userId;
    }

    initializeMonetization() {
        // Load user data from localStorage
        const userData = localStorage.getItem('vcomingle_user_data');
        if (userData) {
            const data = JSON.parse(userData);
            this.userTier = data.tier || 'free';
            this.virtualCoins = data.coins || 0;
        }
    }

    saveUserData() {
        localStorage.setItem('vcomingle_user_data', JSON.stringify({
            tier: this.userTier,
            coins: this.virtualCoins,
            userId: this.userId
        }));
    }

    // Premium Features Check
    isAdFree() {
        return this.userTier === 'premium' || this.userTier === 'vip';
    }

    hasGenderFilter() {
        return this.userTier === 'premium' || this.userTier === 'vip';
    }

    hasLocationFilter() {
        return this.userTier === 'premium' || this.userTier === 'vip';
    }

    hasPriorityMatching() {
        return this.userTier === 'premium' || this.userTier === 'vip';
    }

    hasVirtualGifts() {
        return this.userTier === 'premium' || this.userTier === 'vip';
    }

    hasHDVideo() {
        return this.userTier === 'premium' || this.userTier === 'vip';
    }

    has4KVideo() {
        return this.userTier === 'vip';
    }

    hasAdvancedAnalytics() {
        return this.userTier === 'vip';
    }

    hasCustomThemes() {
        return this.userTier === 'premium' || this.userTier === 'vip';
    }

    // Subscription Management
    async upgradeToPremium() {
        try {
            // In production, integrate with Stripe/PayPal
            const success = await this.processPayment('premium', 9.99);
            if (success) {
                this.userTier = 'premium';
                this.saveUserData();
                this.showUpgradeSuccess('Premium');
                return true;
            }
        } catch (error) {
            console.error('Premium upgrade failed:', error);
        }
        return false;
    }

    async upgradeToVIP() {
        try {
            const success = await this.processPayment('vip', 19.99);
            if (success) {
                this.userTier = 'vip';
                this.saveUserData();
                this.showUpgradeSuccess('VIP');
                return true;
            }
        } catch (error) {
            console.error('VIP upgrade failed:', error);
        }
        return false;
    }

    processPayment(tier, amount) {
        return new Promise((resolve) => {
            // Simulate payment processing
            // In production, integrate with Stripe, PayPal, or other payment gateway
            console.log(`Processing ${tier} payment: $${amount}`);
            
            // Simulate payment success
            setTimeout(() => {
                resolve(true);
            }, 2000);
        });
    }

    showUpgradeSuccess(tier) {
        const message = document.createElement('div');
        message.className = 'upgrade-success-message';
        message.innerHTML = `
            <div class="upgrade-content">
                <h3>🎉 Welcome to ${tier}!</h3>
                <p>Your account has been upgraded successfully.</p>
                <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;
        document.body.appendChild(message);
    }

    // Virtual Gifts System
    sendVirtualGift(giftType, recipientId) {
        if (!this.hasVirtualGifts()) {
            alert('Virtual gifts require Premium or VIP membership');
            return false;
        }

        const gifts = {
            heart: { cost: 10, icon: '❤️', name: 'Heart' },
            rose: { cost: 25, icon: '🌹', name: 'Rose' },
            star: { cost: 50, icon: '⭐', name: 'Star' },
            diamond: { cost: 100, icon: '💎', name: 'Diamond' },
            crown: { cost: 200, icon: '👑', name: 'Crown' }
        };

        const gift = gifts[giftType];
        if (!gift) return false;

        if (this.virtualCoins < gift.cost) {
            alert(`Not enough coins! You need ${gift.cost} coins for a ${gift.name}`);
            return false;
        }

        this.virtualCoins -= gift.cost;
        this.saveUserData();

        // Send gift to recipient
        this.sendGiftToRecipient(gift, recipientId);
        return true;
    }

    sendGiftToRecipient(gift, recipientId) {
        // In production, send via WebSocket to recipient
        console.log(`Gift sent: ${gift.icon} ${gift.name} to ${recipientId}`);
        
        // Show gift animation
        this.showGiftAnimation(gift);
    }

    showGiftAnimation(gift) {
        const animation = document.createElement('div');
        animation.className = 'gift-animation';
        animation.innerHTML = `
            <div class="gift-content">
                <div class="gift-icon">${gift.icon}</div>
                <div class="gift-name">${gift.name}</div>
            </div>
        `;
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 3000);
    }

    // Ad System
    shouldShowAd() {
        if (this.isAdFree()) return false;
        
        // Show ads every 5 minutes for free users
        const lastAdTime = localStorage.getItem('vcomingle_last_ad_time');
        const now = Date.now();
        
        if (!lastAdTime || now - parseInt(lastAdTime) > 300000) {
            localStorage.setItem('vcomingle_last_ad_time', now.toString());
            return true;
        }
        
        return false;
    }

    showAd() {
        if (!this.shouldShowAd()) return;

        const adContainer = document.createElement('div');
        adContainer.className = 'ad-overlay';
        adContainer.innerHTML = `
            <div class="ad-content">
                <div class="ad-close" onclick="this.parentElement.parentElement.remove()">×</div>
                <div class="ad-body">
                    <h3>Upgrade to Premium</h3>
                    <p>Remove ads and unlock amazing features!</p>
                    <button onclick="vcomingleMonetization.upgradeToPremium()">Upgrade Now</button>
                </div>
            </div>
        `;
        document.body.appendChild(adContainer);
    }

    // Analytics for Revenue Tracking
    trackRevenue(action, amount = 0) {
        const revenueData = {
            userId: this.userId,
            tier: this.userTier,
            action: action,
            amount: amount,
            timestamp: new Date().toISOString()
        };

        // In production, send to analytics server
        console.log('Revenue tracked:', revenueData);
        
        // Store locally for demo
        const analytics = JSON.parse(localStorage.getItem('vcomingle_analytics') || '[]');
        analytics.push(revenueData);
        localStorage.setItem('vcomingle_analytics', JSON.stringify(analytics));
    }

    getRevenueStats() {
        const analytics = JSON.parse(localStorage.getItem('vcomingle_analytics') || '[]');
        
        const stats = {
            totalRevenue: 0,
            premiumUpgrades: 0,
            vipUpgrades: 0,
            virtualGiftsRevenue: 0,
            totalUsers: new Set(analytics.map(a => a.userId)).size
        };

        analytics.forEach(event => {
            if (event.action === 'premium_upgrade') {
                stats.premiumUpgrades++;
                stats.totalRevenue += event.amount;
            } else if (event.action === 'vip_upgrade') {
                stats.vipUpgrades++;
                stats.totalRevenue += event.amount;
            } else if (event.action === 'virtual_gift') {
                stats.virtualGiftsRevenue += event.amount;
                stats.totalRevenue += event.amount;
            }
        });

        return stats;
    }
}

// Initialize monetization system
const vcomingleMonetization = new VComingleMonetization();
