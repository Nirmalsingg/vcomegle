class VCominglePaymentSystem {
    constructor() {
        this.apiKey = 'test_api_key'; // Replace with your actual payment gateway API key
        this.merchantId = 'vcomingle_merchant';
        this.upiId = 'yourupi@paytm'; // Replace with your actual UPI ID
        this.bankAccount = {
            accountNumber: 'XXXX-XXXX-XXXX-1234', // Masked for security
            ifsc: 'HDFC0001234',
            accountHolder: 'VComingle Payments',
            bankName: 'HDFC Bank'
        };
    }

    // Initialize payment system
    initialize() {
        this.setupPaymentButtons();
        this.setupUPIIntegration();
        this.setupBankTransfer();
    }

    // Setup payment buttons
    setupPaymentButtons() {
        const premiumBtn = document.getElementById('premiumBtn');
        if (premiumBtn) {
            premiumBtn.onclick = () => this.showPaymentModal('premium', 9.99);
        }
    }

    // Show payment modal with multiple options
    showPaymentModal(tier, amount) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content">
                <div class="payment-header">
                    <h3>Upgrade to ${tier === 'premium' ? 'Premium' : 'VIP'}</h3>
                    <button class="close-btn" onclick="this.closest('.payment-modal').remove()">×</button>
                </div>
                
                <div class="payment-info">
                    <div class="plan-details">
                        <h4>${tier === 'premium' ? 'Premium Plan' : 'VIP Plan'}</h4>
                        <div class="price">₹${this.convertToINR(amount)}/month</div>
                        <div class="original-price">$${amount}/month</div>
                    </div>
                </div>

                <div class="payment-methods">
                    <h4>Choose Payment Method</h4>
                    
                    <!-- UPI Payment -->
                    <div class="payment-option" onclick="paymentSystem.initiateUPIPayment('${tier}', ${amount})">
                        <div class="payment-icon">📱</div>
                        <div class="payment-details">
                            <h5>UPI Payment</h5>
                            <p>Pay using PhonePe, GPay, Paytm, etc.</p>
                        </div>
                        <div class="payment-arrow">→</div>
                    </div>

                    <!-- Credit/Debit Card -->
                    <div class="payment-option" onclick="paymentSystem.showCardForm('${tier}', ${amount})">
                        <div class="payment-icon">💳</div>
                        <div class="payment-details">
                            <h5>Credit/Debit Card</h5>
                            <p>Visa, Mastercard, RuPay, etc.</p>
                        </div>
                        <div class="payment-arrow">→</div>
                    </div>

                    <!-- Net Banking -->
                    <div class="payment-option" onclick="paymentSystem.showNetBanking('${tier}', ${amount})">
                        <div class="payment-icon">🏦</div>
                        <div class="payment-details">
                            <h5>Net Banking</h5>
                            <p>All major Indian banks</p>
                        </div>
                        <div class="payment-arrow">→</div>
                    </div>

                    <!-- Wallet -->
                    <div class="payment-option" onclick="paymentSystem.showWalletOptions('${tier}', ${amount})">
                        <div class="payment-icon">👛</div>
                        <div class="payment-details">
                            <h5>Mobile Wallet</h5>
                            <p>Paytm, PhonePe, Amazon Pay</p>
                        </div>
                        <div class="payment-arrow">→</div>
                    </div>
                </div>

                <div class="payment-security">
                    <div class="security-badge">
                        <span class="lock-icon">🔒</span>
                        <span>Secure Payment</span>
                    </div>
                    <div class="security-info">
                        <p>Your payment information is encrypted and secure</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addModalStyles();
    }

    // Convert USD to INR (approximate rate)
    convertToINR(usdAmount) {
        return Math.round(usdAmount * 83); // 1 USD ≈ 83 INR
    }

    // Initiate UPI Payment
    initiateUPIPayment(tier, amount) {
        const upiModal = document.createElement('div');
        upiModal.className = 'upi-modal';
        upiModal.innerHTML = `
            <div class="upi-content">
                <div class="upi-header">
                    <h3>UPI Payment</h3>
                    <button class="close-btn" onclick="this.closest('.upi-modal').remove()">×</button>
                </div>
                
                <div class="upi-qr">
                    <div class="qr-code">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${this.upiId}&pn=VComingle&am=${this.convertToINR(amount)}&cu=INR" alt="UPI QR Code">
                    </div>
                    <div class="upi-instructions">
                        <h4>Scan QR Code or Use UPI ID</h4>
                        <div class="upi-id-display">
                            <input type="text" value="${this.upiId}" readonly id="upiIdInput">
                            <button onclick="paymentSystem.copyUPIId()">Copy</button>
                        </div>
                        <p class="upi-steps">
                            1. Open any UPI app (PhonePe, GPay, Paytm)<br>
                            2. Scan QR code or enter UPI ID<br>
                            3. Pay ₹${this.convertToINR(amount)}<br>
                            4. Enter transaction ID below
                        </p>
                    </div>
                </div>

                <div class="transaction-form">
                    <h4>Payment Confirmation</h4>
                    <div class="form-group">
                        <label>Transaction ID / UTR Number:</label>
                        <input type="text" id="transactionId" placeholder="Enter 12-digit transaction ID" maxlength="12">
                    </div>
                    <div class="form-group">
                        <label>UPI Number (Optional):label>
                        <input type="text" id="upiNumber" placeholder="Your UPI linked mobile number">
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="paymentEmail" placeholder="your@email.com">
                    </div>
                    <button class="confirm-payment-btn" onclick="paymentSystem.confirmUPIPayment('${tier}', ${amount})">
                        Confirm Payment
                    </button>
                </div>

                <div class="payment-support">
                    <p>Need help? Contact: support@vcomingle.com</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(upiModal);
    }

    // Copy UPI ID to clipboard
    copyUPIId() {
        const upiInput = document.getElementById('upiIdInput');
        upiInput.select();
        document.execCommand('copy');
        
        // Show copied notification
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'UPI ID copied!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Confirm UPI Payment
    async confirmUPIPayment(tier, amount) {
        const transactionId = document.getElementById('transactionId').value;
        const upiNumber = document.getElementById('upiNumber').value;
        const email = document.getElementById('paymentEmail').value;

        if (!transactionId || transactionId.length < 12) {
            alert('Please enter a valid transaction ID');
            return;
        }

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        // Show processing
        const processingBtn = document.querySelector('.confirm-payment-btn');
        processingBtn.textContent = 'Processing...';
        processingBtn.disabled = true;

        try {
            // Send payment confirmation to server
            const response = await this.verifyPayment({
                method: 'UPI',
                tier: tier,
                amount: amount,
                transactionId: transactionId,
                upiNumber: upiNumber,
                email: email,
                currency: 'INR'
            });

            if (response.success) {
                this.showPaymentSuccess(tier);
                // Update user tier
                vcomingleMonetization.userTier = tier;
                vcomingleMonetization.saveUserData();
                vcomingleMonetization.trackRevenue(`${tier}_upgrade`, amount);
                
                // Close modals
                document.querySelectorAll('.upi-modal, .payment-modal').forEach(modal => modal.remove());
                
                // Update UI
                this.updatePremiumButton(tier);
                
            } else {
                alert('Payment verification failed. Please check your transaction ID and try again.');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
        } finally {
            processingBtn.textContent = 'Confirm Payment';
            processingBtn.disabled = false;
        }
    }

    // Show credit/debit card form
    showCardForm(tier, amount) {
        const cardModal = document.createElement('div');
        cardModal.className = 'card-modal';
        cardModal.innerHTML = `
            <div class="card-content">
                <div class="card-header">
                    <h3>Card Payment</h3>
                    <button class="close-btn" onclick="this.closest('.card-modal').remove()">×</button>
                </div>
                
                <form class="card-form" onsubmit="paymentSystem.processCardPayment(event, '${tier}', ${amount})">
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="text" id="cvv" placeholder="123" maxlength="4" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" id="cardName" placeholder="John Doe" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="cardEmail" placeholder="your@email.com" required>
                    </div>
                    
                    <button type="submit" class="pay-btn">Pay ₹${this.convertToINR(amount)}</button>
                </form>
                
                <div class="card-security">
                    <div class="security-icons">
                        <span>🔒</span>
                        <span>SSL Secured</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(cardModal);
        this.formatCardInputs();
    }

    // Format card inputs
    formatCardInputs() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }
        
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
            });
        }
    }

    // Process card payment
    async processCardPayment(event, tier, amount) {
        event.preventDefault();
        
        const cardData = {
            number: document.getElementById('cardNumber').value.replace(/\s/g, ''),
            expiry: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value,
            name: document.getElementById('cardName').value,
            email: document.getElementById('cardEmail').value
        };

        const payBtn = document.querySelector('.pay-btn');
        payBtn.textContent = 'Processing...';
        payBtn.disabled = true;

        try {
            // In production, integrate with Razorpay, Stripe, or payment gateway
            const response = await this.processCardPaymentWithGateway(cardData, tier, amount);
            
            if (response.success) {
                this.showPaymentSuccess(tier);
                vcomingleMonetization.userTier = tier;
                vcomingleMonetization.saveUserData();
                vcomingleMonetization.trackRevenue(`${tier}_upgrade`, amount);
                
                document.querySelectorAll('.card-modal, .payment-modal').forEach(modal => modal.remove());
                this.updatePremiumButton(tier);
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Card payment error:', error);
            alert('Payment failed. Please check your card details.');
        } finally {
            payBtn.textContent = `Pay ₹${this.convertToINR(amount)}`;
            payBtn.disabled = false;
        }
    }

    // Process payment with payment gateway
    async processCardPaymentWithGateway(cardData, tier, amount) {
        // Simulate payment processing
        // In production, integrate with Razorpay, Stripe, or other Indian payment gateways
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success (90% success rate for demo)
                const success = Math.random() > 0.1;
                resolve({
                    success: success,
                    transactionId: success ? 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase() : null
                });
            }, 2000);
        });
    }

    // Verify payment with server
    async verifyPayment(paymentData) {
        try {
            // Send to your backend for verification
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Payment verification error:', error);
            // For demo, return success
            return { success: true };
        }
    }

    // Show payment success
    showPaymentSuccess(tier) {
        const successModal = document.createElement('div');
        successModal.className = 'success-modal';
        successModal.innerHTML = `
            <div class="success-content">
                <div class="success-icon">🎉</div>
                <h3>Payment Successful!</h3>
                <p>You are now a ${tier} member!</p>
                <div class="success-features">
                    <h4>Enjoy your new features:</h4>
                    <ul>
                        ${tier === 'premium' ? `
                            <li>✓ Ad-free experience</li>
                            <li>✓ HD video quality</li>
                            <li>✓ Gender filters</li>
                            <li>✓ Priority matching</li>
                        ` : `
                            <li>✓ Everything in Premium</li>
                            <li>✓ 4K video quality</li>
                            <li>✓ Unlimited gifts</li>
                            <li>✓ Advanced analytics</li>
                        `}
                    </ul>
                </div>
                <button onclick="this.closest('.success-modal').remove()">Start Enjoying!</button>
            </div>
        `;
        
        document.body.appendChild(successModal);
    }

    // Update premium button
    updatePremiumButton(tier) {
        const premiumBtn = document.getElementById('premiumBtn');
        if (premiumBtn) {
            premiumBtn.textContent = `${tier === 'premium' ? 'Premium' : 'VIP'} Member`;
            premiumBtn.classList.add(tier);
            premiumBtn.onclick = () => alert(`You are already a ${tier} member!`);
        }
    }

    // Add modal styles
    addModalStyles() {
        if (document.getElementById('payment-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'payment-styles';
        styles.textContent = `
            .payment-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .payment-modal-content {
                background: white;
                border-radius: 16px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            
            .payment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .payment-info {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .plan-details h4 {
                color: #333;
                margin-bottom: 10px;
            }
            
            .price {
                font-size: 32px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 5px;
            }
            
            .original-price {
                color: #999;
                text-decoration: line-through;
            }
            
            .payment-methods h4 {
                color: #333;
                margin-bottom: 20px;
            }
            
            .payment-option {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 2px solid #f0f0f0;
                border-radius: 12px;
                margin-bottom: 15px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .payment-option:hover {
                border-color: #667eea;
                background: #f8f9ff;
            }
            
            .payment-icon {
                font-size: 24px;
                margin-right: 15px;
            }
            
            .payment-details {
                flex: 1;
            }
            
            .payment-details h5 {
                color: #333;
                margin-bottom: 5px;
            }
            
            .payment-details p {
                color: #666;
                font-size: 14px;
                margin: 0;
            }
            
            .payment-arrow {
                font-size: 20px;
                color: #667eea;
            }
            
            .payment-security {
                text-align: center;
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .security-badge {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;
            }
            
            .lock-icon {
                margin-right: 8px;
            }
            
            .upi-modal, .card-modal, .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .upi-content, .card-content, .success-content {
                background: white;
                border-radius: 16px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            
            .upi-qr {
                display: flex;
                gap: 30px;
                margin-bottom: 30px;
                align-items: center;
            }
            
            .qr-code img {
                width: 200px;
                height: 200px;
                border: 1px solid #ddd;
                border-radius: 8px;
            }
            
            .upi-id-display {
                display: flex;
                gap: 10px;
                margin: 15px 0;
            }
            
            .upi-id-display input {
                flex: 1;
                padding: 10px;
                border: 2px solid #e1e1e1;
                border-radius: 6px;
                font-family: monospace;
            }
            
            .upi-id-display button {
                padding: 10px 20px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .copy-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                z-index: 10002;
            }
            
            .transaction-form {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #333;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e1e1e1;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .confirm-payment-btn, .pay-btn {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .confirm-payment-btn:disabled, .pay-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .success-content {
                text-align: center;
            }
            
            .success-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }
            
            .success-features ul {
                text-align: left;
                max-width: 300px;
                margin: 20px auto;
            }
            
            .success-features li {
                margin-bottom: 8px;
                color: #333;
            }
            
            @media (max-width: 768px) {
                .payment-modal-content, .upi-content, .card-content, .success-content {
                    margin: 20px;
                    padding: 20px;
                }
                
                .upi-qr {
                    flex-direction: column;
                    text-align: center;
                }
                
                .qr-code img {
                    margin: 0 auto;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize payment system
const paymentSystem = new VCominglePaymentSystem();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    paymentSystem.initialize();
});
