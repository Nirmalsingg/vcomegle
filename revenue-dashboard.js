class VComingleRevenueDashboard {
    constructor() {
        this.revenueData = {
            ads: {
                daily: 0,
                monthly: 0,
                total: 0,
                cpm: 0.50, // Cost per 1000 impressions
                impressions: 0
            },
            subscriptions: {
                premium: 0,
                vip: 0,
                monthlyRevenue: 0,
                yearlyRevenue: 0
            },
            virtualGifts: {
                daily: 0,
                monthly: 0,
                total: 0,
                averageValue: 0
            },
            total: {
                daily: 0,
                monthly: 0,
                total: 0
            }
        };
        
        this.bankAccount = {
            accountNumber: '37921905794',
            bankName: 'SBI',
            ifsc: 'SBIN0006816',
            accountHolder: 'VComingle Payments',
            balance: 0,
            pendingWithdrawals: 0
        };
        
        this.loadRevenueData();
        this.initializeDashboard();
    }

    // Load revenue data from localStorage
    loadRevenueData() {
        const saved = localStorage.getItem('vcomingle_revenue');
        if (saved) {
            this.revenueData = JSON.parse(saved);
        }
    }

    // Save revenue data to localStorage
    saveRevenueData() {
        localStorage.setItem('vcomingle_revenue', JSON.stringify(this.revenueData));
    }

    // Initialize dashboard
    initializeDashboard() {
        this.createRevenueDashboard();
        this.createBankSection();
        this.setupRealTimeUpdates();
    }

    // Create revenue dashboard
    createRevenueDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'revenue-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h2>💰 Revenue Dashboard</h2>
                <div class="revenue-summary">
                    <div class="summary-card">
                        <h3>Today's Revenue</h3>
                        <div class="amount">₹${this.revenueData.total.daily.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h3>This Month</h3>
                        <div class="amount">₹${this.revenueData.total.monthly.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Total Revenue</h3>
                        <div class="amount">₹${this.revenueData.total.total.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div class="revenue-breakdown">
                <h3>📊 Revenue Sources</h3>
                <div class="revenue-sources">
                    <div class="source-card">
                        <h4>📺 Advertisement Revenue</h4>
                        <div class="source-details">
                            <div class="metric">
                                <span>Daily:</span>
                                <span>₹${this.revenueData.ads.daily.toFixed(2)}</span>
                            </div>
                            <div class="metric">
                                <span>Monthly:</span>
                                <span>₹${this.revenueData.ads.monthly.toFixed(2)}</span>
                            </div>
                            <div class="metric">
                                <span>Impressions:</span>
                                <span>${this.revenueData.ads.impressions.toLocaleString()}</span>
                            </div>
                            <div class="metric">
                                <span>CPM:</span>
                                <span>₹${this.revenueData.ads.cpm.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="source-card">
                        <h4>💳 Subscription Revenue</h4>
                        <div class="source-details">
                            <div class="metric">
                                <span>Premium Users:</span>
                                <span>${this.revenueData.subscriptions.premium}</span>
                            </div>
                            <div class="metric">
                                <span>VIP Users:</span>
                                <span>${this.revenueData.subscriptions.vip}</span>
                            </div>
                            <div class="metric">
                                <span>Monthly Revenue:</span>
                                <span>₹${this.revenueData.subscriptions.monthlyRevenue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="source-card">
                        <h4>🎁 Virtual Gifts Revenue</h4>
                        <div class="source-details">
                            <div class="metric">
                                <span>Daily:</span>
                                <span>₹${this.revenueData.virtualGifts.daily.toFixed(2)}</span>
                            </div>
                            <div class="metric">
                                <span>Monthly:</span>
                                <span>₹${this.revenueData.virtualGifts.monthly.toFixed(2)}</span>
                            </div>
                            <div class="metric">
                                <span>Total Gifts:</span>
                                <span>${this.revenueData.virtualGifts.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bank-section">
                <h3>🏦 Bank Account</h3>
                <div class="bank-info">
                    <div class="bank-details">
                        <div class="detail">
                            <span>Account Number:</span>
                            <span>XXXX-XXXX-XXXX-${this.bankAccount.accountNumber.slice(-4)}</span>
                        </div>
                        <div class="detail">
                            <span>Bank:</span>
                            <span>${this.bankAccount.bankName}</span>
                        </div>
                        <div class="detail">
                            <span>IFSC:</span>
                            <span>${this.bankAccount.ifsc}</span>
                        </div>
                        <div class="detail">
                            <span>Account Holder:</span>
                            <span>${this.bankAccount.accountHolder}</span>
                        </div>
                    </div>
                    
                    <div class="balance-section">
                        <div class="balance-card">
                            <h4>Available Balance</h4>
                            <div class="balance">₹${this.bankAccount.balance.toFixed(2)}</div>
                        </div>
                        
                        <div class="withdrawal-section">
                            <h4>Withdraw Funds</h4>
                            <div class="withdrawal-form">
                                <input type="number" id="withdrawAmount" placeholder="Enter amount" min="100" step="100">
                                <button onclick="revenueDashboard.withdrawFunds()">Withdraw to Bank</button>
                            </div>
                            <div class="withdrawal-info">
                                <p>Minimum withdrawal: ₹100</p>
                                <p>Processing time: 1-2 business days</p>
                                <p>Your bank account: ${this.bankAccount.accountNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions-section">
                <h3>📈 Revenue Actions</h3>
                <div class="action-buttons">
                    <button onclick="revenueDashboard.trackAdImpression()" class="action-btn">
                        📺 Track Ad Impression
                    </button>
                    <button onclick="revenueDashboard.trackSubscription('premium')" class="action-btn">
                        💳 Track Premium Sale
                    </button>
                    <button onclick="revenueDashboard.trackSubscription('vip')" class="action-btn">
                        👑 Track VIP Sale
                    </button>
                    <button onclick="revenueDashboard.trackVirtualGift()" class="action-btn">
                        🎁 Track Virtual Gift
                    </button>
                    <button onclick="revenueDashboard.exportReport()" class="action-btn">
                        📊 Export Report
                    </button>
                </div>
            </div>
        `;

        // Add dashboard to page if not exists
        if (!document.querySelector('.revenue-dashboard')) {
            document.body.appendChild(dashboard);
        }
    }

    // Create bank section
    createBankSection() {
        // Bank section is already included in main dashboard
        this.updateBankBalance();
    }

    // Setup real-time updates
    setupRealTimeUpdates() {
        // Update revenue every 30 seconds
        setInterval(() => {
            this.updateRevenueCalculations();
        }, 30000);

        // Update bank balance every minute
        setInterval(() => {
            this.updateBankBalance();
        }, 60000);
    }

    // Track ad impression
    trackAdImpression() {
        this.revenueData.ads.impressions++;
        this.revenueData.ads.daily += this.revenueData.ads.cpm / 1000;
        this.revenueData.ads.monthly += this.revenueData.ads.cpm / 1000;
        this.updateTotalRevenue();
        this.saveRevenueData();
        this.showNotification('📺 Ad impression tracked!', 'success');
    }

    // Track subscription
    trackSubscription(type) {
        const amount = type === 'premium' ? 830 : 1660; // INR amounts
        if (type === 'premium') {
            this.revenueData.subscriptions.premium++;
        } else {
            this.revenueData.subscriptions.vip++;
        }
        
        this.revenueData.subscriptions.monthlyRevenue += amount;
        this.revenueData.subscriptions.yearlyRevenue += amount * 12;
        this.updateTotalRevenue();
        this.saveRevenueData();
        this.showNotification(`💳 ${type} subscription tracked! +₹${amount}`, 'success');
    }

    // Track virtual gift
    trackVirtualGift() {
        const giftValue = 50; // Average gift value in INR
        this.revenueData.virtualGifts.daily += giftValue;
        this.revenueData.virtualGifts.monthly += giftValue;
        this.revenueData.virtualGifts.total++;
        this.revenueData.virtualGifts.averageValue = 
            this.revenueData.virtualGifts.total > 0 
                ? (this.revenueData.virtualGifts.monthly / this.revenueData.virtualGifts.total) 
                : 0;
        
        this.updateTotalRevenue();
        this.saveRevenueData();
        this.showNotification('🎁 Virtual gift tracked! +₹50', 'success');
    }

    // Update total revenue
    updateTotalRevenue() {
        this.revenueData.total.daily = 
            this.revenueData.ads.daily + 
            (this.revenueData.subscriptions.monthlyRevenue / 30) + 
            this.revenueData.virtualGifts.daily;
        
        this.revenueData.total.monthly = 
            this.revenueData.ads.monthly + 
            this.revenueData.subscriptions.monthlyRevenue + 
            this.revenueData.virtualGifts.monthly;
        
        this.revenueData.total.total = 
            this.revenueData.ads.total + 
            (this.revenueData.subscriptions.yearlyRevenue) + 
            (this.revenueData.virtualGifts.total * 50); // Assuming ₹50 average gift value
    }

    // Update bank balance
    updateBankBalance() {
        // Simulate bank balance updates (in real app, this would connect to bank API)
        const totalRevenue = this.revenueData.total.total;
        const withdrawn = this.bankAccount.pendingWithdrawals;
        
        this.bankAccount.balance = totalRevenue - withdrawn;
        this.updateBankDisplay();
    }

    // Update bank display
    updateBankDisplay() {
        const balanceElement = document.querySelector('.balance');
        if (balanceElement) {
            balanceElement.textContent = `₹${this.bankAccount.balance.toFixed(2)}`;
        }
    }

    // Withdraw funds
    withdrawFunds() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        
        if (!amount || amount < 100) {
            this.showNotification('❌ Minimum withdrawal amount is ₹100', 'error');
            return;
        }
        
        if (amount > this.bankAccount.balance) {
            this.showNotification('❌ Insufficient balance', 'error');
            return;
        }

        // Process withdrawal
        this.bankAccount.pendingWithdrawals += amount;
        this.bankAccount.balance -= amount;
        
        this.showNotification(`✅ Withdrawal of ₹${amount} initiated!`, 'success');
        this.showNotification(`🏦 Funds will be transferred to ${this.bankAccount.accountNumber}`, 'info');
        
        // Clear form
        document.getElementById('withdrawAmount').value = '';
        
        // In real app, this would call bank API
        this.processBankWithdrawal(amount);
    }

    // Process bank withdrawal (simulated)
    processBankWithdrawal(amount) {
        // Simulate bank API call
        setTimeout(() => {
            this.bankAccount.pendingWithdrawals -= amount;
            this.showNotification('✅ Withdrawal completed! Funds transferred to bank account', 'success');
            this.saveRevenueData();
        }, 2000); // 2 seconds processing time
    }

    // Export report
    exportReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            revenue: this.revenueData,
            bankAccount: {
                ...this.bankAccount,
                accountNumber: 'XXXX-XXXX-XXXX-' + this.bankAccount.accountNumber.slice(-4)
            }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vcomingle-revenue-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('📊 Revenue report exported!', 'success');
    }

    // Update revenue calculations
    updateRevenueCalculations() {
        // Reset daily at midnight
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            this.revenueData.total.daily = 0;
            this.revenueData.ads.daily = 0;
            this.revenueData.virtualGifts.daily = 0;
        }
        
        // Reset monthly at first of month
        if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
            this.revenueData.total.monthly = 0;
            this.revenueData.ads.monthly = 0;
            this.revenueData.virtualGifts.monthly = 0;
            this.revenueData.subscriptions.monthlyRevenue = 0;
        }
        
        this.updateTotalRevenue();
        this.saveRevenueData();
        this.updateDashboardDisplay();
    }

    // Update dashboard display
    updateDashboardDisplay() {
        const elements = {
            dailyRevenue: document.querySelector('.summary-card:nth-child(1) .amount'),
            monthlyRevenue: document.querySelector('.summary-card:nth-child(2) .amount'),
            totalRevenue: document.querySelector('.summary-card:nth-child(3) .amount'),
            balance: document.querySelector('.balance')
        };

        if (elements.dailyRevenue) {
            elements.dailyRevenue.textContent = `₹${this.revenueData.total.daily.toFixed(2)}`;
        }
        if (elements.monthlyRevenue) {
            elements.monthlyRevenue.textContent = `₹${this.revenueData.total.monthly.toFixed(2)}`;
        }
        if (elements.totalRevenue) {
            elements.totalRevenue.textContent = `₹${this.revenueData.total.total.toFixed(2)}`;
        }
        if (elements.balance) {
            elements.balance.textContent = `₹${this.bankAccount.balance.toFixed(2)}`;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `revenue-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add dashboard styles
    addDashboardStyles() {
        if (document.getElementById('revenue-dashboard-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'revenue-dashboard-styles';
        styles.textContent = `
            .revenue-dashboard {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 10000;
                overflow-y: auto;
                padding: 20px;
            }
            
            .dashboard-content {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                padding: 30px;
            }
            
            .dashboard-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .dashboard-header h2 {
                color: #333;
                margin-bottom: 20px;
            }
            
            .revenue-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .summary-card {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
            }
            
            .summary-card h3 {
                margin-bottom: 10px;
                font-size: 14px;
            }
            
            .amount {
                font-size: 24px;
                font-weight: 700;
            }
            
            .revenue-breakdown {
                margin-bottom: 30px;
            }
            
            .revenue-sources {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .source-card {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                border: 1px solid #e9ecef;
            }
            
            .source-card h4 {
                color: #333;
                margin-bottom: 15px;
            }
            
            .source-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            
            .metric span:first-child {
                color: #666;
            }
            
            .metric span:last-child {
                font-weight: 600;
                color: #333;
            }
            
            .bank-section {
                background: #e8f5e8;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .bank-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            
            .bank-details .detail {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #d1d5db;
            }
            
            .balance-section {
                background: #d4edda;
                border-radius: 8px;
                padding: 20px;
            }
            
            .balance {
                font-size: 28px;
                font-weight: 700;
                color: #155724;
                margin-bottom: 20px;
            }
            
            .withdrawal-form {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .withdrawal-form input {
                flex: 1;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 6px;
            }
            
            .withdrawal-form button {
                padding: 10px 20px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .actions-section {
                text-align: center;
            }
            
            .action-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .action-btn {
                padding: 15px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            }
            
            .revenue-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10001;
                font-weight: 600;
            }
            
            .revenue-notification.success {
                background: #d4edda;
                color: #155724;
            }
            
            .revenue-notification.error {
                background: #f8d7da;
                color: #721c24;
            }
            
            .revenue-notification.info {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            @media (max-width: 768px) {
                .revenue-summary {
                    grid-template-columns: 1fr;
                }
                
                .revenue-sources {
                    grid-template-columns: 1fr;
                }
                
                .bank-info {
                    grid-template-columns: 1fr;
                }
                
                .action-buttons {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize revenue dashboard
const revenueDashboard = new VComingleRevenueDashboard();
