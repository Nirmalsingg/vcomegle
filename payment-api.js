// Payment API Backend for VComingle
const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

class PaymentAPI {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS for payment processing
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });
    }

    setupRoutes() {
        // Verify payment endpoint
        this.app.post('/api/verify-payment', this.verifyPayment.bind(this));
        
        // Get payment status
        this.app.get('/api/payment-status/:transactionId', this.getPaymentStatus.bind(this));
        
        // Bank account details
        this.app.get('/api/bank-details', this.getBankDetails.bind(this));
        
        // UPI verification
        this.app.post('/api/verify-upi', this.verifyUPIPayment.bind(this));
        
        // Webhook for payment gateway
        this.app.post('/api/payment-webhook', this.paymentWebhook.bind(this));
        
        // Email receipt
        this.app.post('/api/send-receipt', this.sendReceipt.bind(this));
    }

    // Verify payment from UPI or other methods
    async verifyPayment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
            }

            const { method, tier, amount, transactionId, email, upiNumber } = req.body;

            // Log payment attempt
            console.log(`Payment verification attempt:`, {
                method,
                tier,
                amount,
                transactionId,
                email,
                timestamp: new Date().toISOString()
            });

            // Validate transaction ID format
            if (method === 'UPI' && !this.validateUPItransactionId(transactionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid UPI transaction ID format'
                });
            }

            // Check if transaction already processed
            const existingPayment = await this.getTransaction(transactionId);
            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction already processed'
                });
            }

            // For demo purposes, auto-approve UPI payments
            // In production, integrate with actual payment gateway
            let paymentVerified = false;
            
            if (method === 'UPI') {
                // Simulate UPI verification (95% success rate for demo)
                paymentVerified = Math.random() > 0.05;
            } else if (method === 'CARD') {
                // Simulate card verification (95% success rate)
                paymentVerified = Math.random() > 0.05;
            }

            if (paymentVerified) {
                // Save payment record
                await this.savePayment({
                    transactionId,
                    method,
                    tier,
                    amount,
                    email,
                    upiNumber,
                    status: 'verified',
                    verifiedAt: new Date().toISOString()
                });

                // Update user subscription
                await this.updateUserSubscription(email, tier);

                // Send confirmation email
                await this.sendPaymentConfirmation(email, {
                    tier,
                    amount,
                    transactionId,
                    method
                });

                return res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    transactionId,
                    tier
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed. Please check your transaction details.'
                });
            }

        } catch (error) {
            console.error('Payment verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Validate UPI transaction ID
    validateUPItransactionId(transactionId) {
        // UPI transaction IDs are typically 12-18 characters alphanumeric
        const upiRegex = /^[A-Za-z0-9]{12,18}$/;
        return upiRegex.test(transactionId);
    }

    // Get payment status
    async getPaymentStatus(req, res) {
        try {
            const { transactionId } = req.params;
            const payment = await this.getTransaction(transactionId);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            return res.json({
                success: true,
                payment: {
                    transactionId: payment.transactionId,
                    status: payment.status,
                    method: payment.method,
                    amount: payment.amount,
                    tier: payment.tier,
                    verifiedAt: payment.verifiedAt
                }
            });
        } catch (error) {
            console.error('Get payment status error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get bank account details for direct transfer
    async getBankDetails(req, res) {
        try {
            const bankDetails = {
                accountName: 'VComingle Payments',
                accountNumber: 'XXXX-XXXX-XXXX-1234', // Masked for security
                bankName: 'HDFC Bank',
                branch: 'Mumbai Main Branch',
                ifsc: 'HDFC0001234',
                accountType: 'Current Account',
                upiId: 'vcomingle@paytm',
                supportedApps: [
                    'PhonePe',
                    'Google Pay',
                    'Paytm',
                    'Amazon Pay',
                    'BHIM'
                ],
                instructions: {
                    step1: 'Open any UPI app',
                    step2: 'Enter UPI ID: vcomingle@paytm',
                    step3: 'Enter amount and proceed',
                    step4: 'Note transaction ID for verification'
                }
            };

            return res.json({
                success: true,
                bankDetails
            });
        } catch (error) {
            console.error('Get bank details error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Verify UPI payment specifically
    async verifyUPIPayment(req, res) {
        try {
            const { upiId, transactionId, amount } = req.body;

            // In production, integrate with UPI payment gateway APIs
            // For demo, simulate verification
            
            const verificationResult = {
                success: true,
                transactionId,
                status: 'completed',
                verifiedAt: new Date().toISOString(),
                amount: amount
            };

            return res.json(verificationResult);
        } catch (error) {
            console.error('UPI verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'UPI verification failed'
            });
        }
    }

    // Payment webhook for real-time updates
    async paymentWebhook(req, res) {
        try {
            const webhookData = req.body;
            
            // Verify webhook signature (in production)
            const signature = req.headers['x-webhook-signature'];
            if (!this.verifyWebhookSignature(webhookData, signature)) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }

            // Process webhook data
            console.log('Payment webhook received:', webhookData);

            // Update payment status
            if (webhookData.status === 'success') {
                await this.updatePaymentStatus(webhookData.transactionId, 'completed');
                await this.updateUserSubscription(webhookData.email, webhookData.tier);
            }

            return res.json({ success: true });
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({
                success: false,
                message: 'Webhook processing failed'
            });
        }
    }

    // Send payment receipt via email
    async sendReceipt(req, res) {
        try {
            const { email, transactionId, tier, amount } = req.body;

            const receiptData = {
                to: email,
                subject: `VComingle ${tier} Subscription Receipt`,
                html: this.generateReceiptHTML(transactionId, tier, amount)
            };

            await this.sendEmail(receiptData);

            return res.json({
                success: true,
                message: 'Receipt sent successfully'
            });
        } catch (error) {
            console.error('Send receipt error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send receipt'
            });
        }
    }

    // Generate receipt HTML
    generateReceiptHTML(transactionId, tier, amount) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>VComingle Payment Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                    .receipt { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; color: #667eea; }
                    .receipt-details { margin-bottom: 30px; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                    .total { font-size: 18px; font-weight: bold; color: #667eea; }
                    .footer { text-align: center; margin-top: 30px; color: #666; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <div class="logo">VComingle</div>
                        <h2>Payment Receipt</h2>
                    </div>
                    
                    <div class="receipt-details">
                        <div class="detail-row">
                            <span>Transaction ID:</span>
                            <span>${transactionId}</span>
                        </div>
                        <div class="detail-row">
                            <span>Plan:</span>
                            <span>${tier} Subscription</span>
                        </div>
                        <div class="detail-row">
                            <span>Amount:</span>
                            <span>₹${Math.round(amount * 83)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Date:</span>
                            <span>${new Date().toLocaleDateString()}</span>
                        </div>
                        <div class="detail-row total">
                            <span>Total Paid:</span>
                            <span>₹${Math.round(amount * 83)}</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for choosing VComingle!</p>
                        <p>For support, contact: support@vcomingle.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Send email
    async sendEmail(emailData) {
        // Configure nodemailer (use your email service)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your email service
            auth: {
                user: 'your-email@gmail.com', // replace with your email
                pass: 'your-app-password' // replace with your app password
            }
        });

        const mailOptions = {
            from: 'VComingle <noreply@vcomingle.com>',
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html
        };

        await transporter.sendMail(mailOptions);
    }

    // Database operations (simplified for demo)
    async savePayment(paymentData) {
        // In production, save to database
        console.log('Saving payment:', paymentData);
        return true;
    }

    async getTransaction(transactionId) {
        // In production, fetch from database
        return null; // Demo: return null for new transactions
    }

    async updateUserSubscription(email, tier) {
        // In production, update user in database
        console.log(`Updating subscription for ${email} to ${tier}`);
        return true;
    }

    async updatePaymentStatus(transactionId, status) {
        // In production, update payment status in database
        console.log(`Updating payment ${transactionId} to ${status}`);
        return true;
    }

    async sendPaymentConfirmation(email, paymentData) {
        try {
            const confirmationData = {
                to: email,
                subject: `VComingle ${paymentData.tier} Subscription Confirmed!`,
                html: this.generateConfirmationHTML(paymentData)
            };
            
            await this.sendEmail(confirmationData);
        } catch (error) {
            console.error('Send confirmation error:', error);
        }
    }

    generateConfirmationHTML(paymentData) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>VComingle Subscription Confirmed</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                    .confirmation { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                    .success-icon { font-size: 48px; margin-bottom: 20px; }
                    .title { color: #4CAF50; margin-bottom: 20px; }
                    .details { text-align: left; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .features { text-align: left; margin: 20px 0; }
                    .features h4 { margin-bottom: 10px; }
                    .features ul { list-style: none; padding: 0; }
                    .features li { margin-bottom: 8px; color: #333; }
                    .cta { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="confirmation">
                    <div class="success-icon">🎉</div>
                    <h1 class="title">Subscription Confirmed!</h1>
                    <p>Welcome to VComingle ${paymentData.tier}!</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span>Plan:</span>
                            <span>${paymentData.tier}</span>
                        </div>
                        <div class="detail-row">
                            <span>Amount:</span>
                            <span>₹${Math.round(paymentData.amount * 83)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Transaction ID:</span>
                            <span>${paymentData.transactionId}</span>
                        </div>
                        <div class="detail-row">
                            <span>Payment Method:</span>
                            <span>${paymentData.method}</span>
                        </div>
                    </div>
                    
                    <div class="features">
                        <h4>Enjoy Your New Features:</h4>
                        <ul>
                            ${paymentData.tier === 'premium' ? `
                                <li>✓ Ad-free experience</li>
                                <li>✓ HD video quality</li>
                                <li>✓ Gender filters</li>
                                <li>✓ Priority matching</li>
                                <li>✓ Virtual gifts</li>
                            ` : `
                                <li>✓ Everything in Premium</li>
                                <li>✓ 4K video quality</li>
                                <li>✓ Unlimited virtual gifts</li>
                                <li>✓ Advanced analytics</li>
                                <li>✓ Priority support</li>
                            `}
                        </ul>
                    </div>
                    
                    <button class="cta" onclick="window.location.href='https://your-vercel-app.vercel.app'">
                        Start Using VComingle
                    </button>
                </div>
            </body>
            </html>
        `;
    }

    // Verify webhook signature
    verifyWebhookSignature(data, signature) {
        // In production, implement actual signature verification
        return true; // Demo: always return true
    }

    // Start the payment API server
    start(port = 3001) {
        this.app.listen(port, () => {
            console.log(`Payment API server running on port ${port}`);
        });
    }
}

// Export for use in main server
module.exports = PaymentAPI;
