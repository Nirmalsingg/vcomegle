class VComingleApp {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.socket = null;
        this.currentRoom = null;
        this.isConnected = false;
        this.textOnly = false;
        this.isInitiator = false;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.updateOnlineCount();
    }

    initializeElements() {
        // Screens
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatScreen = document.getElementById('chatScreen');
        this.connectingScreen = document.getElementById('connectingScreen');
        this.disconnectedScreen = document.getElementById('disconnectedScreen');

        // Video elements
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');

        // Chat elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendMessageBtn = document.getElementById('sendMessage');

        // Controls
        this.startChatBtn = document.getElementById('startChat');
        this.nextBtn = document.getElementById('nextButton');
        this.stopBtn = document.getElementById('stopButton');
        this.reportBtn = document.getElementById('reportButton');
        this.toggleVideoBtn = document.getElementById('toggleVideo');
        this.toggleAudioBtn = document.getElementById('toggleAudio');
        this.findNewBtn = document.getElementById('findNew');
        this.goHomeBtn = document.getElementById('goHome');

        // Preferences
        this.textOnlyCheckbox = document.getElementById('textOnly');
        this.interestsInput = document.getElementById('interests');

        // Other
        this.onlineCount = document.getElementById('onlineCount');
    }

    initializeEventListeners() {
        // Start chat
        this.startChatBtn.addEventListener('click', () => this.startChat());

        // Message sending
        this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Controls
        this.nextBtn.addEventListener('click', () => this.nextChat());
        this.stopBtn.addEventListener('click', () => this.stopChat());
        this.reportBtn.addEventListener('click', () => this.reportUser());
        this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());

        // Disconnected screen
        this.findNewBtn.addEventListener('click', () => this.startChat());
        this.goHomeBtn.addEventListener('click', () => this.goHome());

        // Preferences
        this.textOnlyCheckbox.addEventListener('change', (e) => {
            this.textOnly = e.target.checked;
        });
    }

    async startChat() {
        this.showScreen('connectingScreen');
        this.textOnly = this.textOnlyCheckbox.checked;
        
        try {
            // Initialize local media
            if (!this.textOnly) {
                await this.initializeLocalMedia();
            }
            
            // Connect to signaling server
            await this.connectToSignalingServer();
            
            // Start looking for a match
            this.findMatch();
            
        } catch (error) {
            console.error('Error starting chat:', error);
            this.addSystemMessage('Failed to start chat. Please check your camera/microphone permissions.');
            this.goHome();
        }
    }

    async initializeLocalMedia() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            };
            
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localVideo.srcObject = this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }

    async connectToSignalingServer() {
        // Connect to real Socket.io server
        return new Promise((resolve, reject) => {
            try {
                // Use the current domain for Socket.io connection
                const socketUrl = "https://vcomegle-backend.onrender.com";
                this.socket = io(socketUrl);
                
                this.socket.on('connect', () => {
                    console.log('Connected to signaling server');
                    resolve();
                });
                
                this.socket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    // Fallback to demo mode if server unavailable
                    this.fallbackToDemoMode();
                    resolve();
                });
                
                // Handle match found
                this.socket.on('match-found', (data) => {
                    this.currentRoom = data.roomId;
                    this.isInitiator = data.isInitiator;
                    console.log('Match found! Room:', data.roomId, 'Initiator:', data.isInitiator);
                    this.onMatchFound();
                });
                
                // Handle waiting
                this.socket.on('waiting', () => {
                    // Already in connecting screen
                });
                
                // Handle WebRTC signaling
                this.socket.on('offer', (data) => {
                    this.handleOffer(data.offer);
                });
                
                this.socket.on('answer', (data) => {
                    this.handleAnswer(data.answer);
                });
                
                this.socket.on('ice-candidate', (data) => {
                    this.handleIceCandidate(data.candidate);
                });
                
                // Handle chat messages
                this.socket.on('chat-message', (data) => {
                    this.addMessage(data.message, 'stranger');
                });
                
                // Handle disconnection
                this.socket.on('stranger-disconnected', () => {
                    this.onStrangerDisconnected();
                });
                
                this.socket.on('disconnected', () => {
                    this.goHome();
                });
                
            } catch (error) {
                console.error('Error connecting to server:', error);
                this.fallbackToDemoMode();
                resolve();
            }
        });
    }

    findMatch() {
        // Request match from server
        if (this.socket && this.socket.connected) {
            this.socket.emit('find-match', {
                textOnly: this.textOnly,
                interests: this.interestsInput.value
            });
        } else {
            // Fallback to demo mode
            this.fallbackToDemoMode();
        }
    }

    fallbackToDemoMode() {
        console.log('Using demo mode - server not available');
        this.socket = {
            send: (data) => console.log('Demo mode - Socket send:', data),
            emit: (event, data) => console.log('Demo mode - Socket emit:', event, data),
            connected: false
        };
        
        // Simulate finding a match
        setTimeout(() => {
            this.onMatchFound();
        }, 2000 + Math.random() * 3000);
    }

    handleOffer(offer) {
        console.log('Received offer:', offer);
        if (this.peerConnection) {
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => {
                    console.log('Remote description set for offer');
                    this.createAndSendAnswer();
                })
                .catch(error => {
                    console.error('Error setting remote description for offer:', error);
                });
        }
    }

    handleAnswer(answer) {
        console.log('Received answer:', answer);
        if (this.peerConnection) {
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                .then(() => {
                    console.log('Remote description set for answer');
                })
                .catch(error => {
                    console.error('Error setting remote description for answer:', error);
                });
        }
    }

    handleIceCandidate(candidate) {
        console.log('Received ICE candidate:', candidate);
        if (this.peerConnection) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                .then(() => {
                    console.log('ICE candidate added successfully');
                })
                .catch(error => {
                    console.error('Error adding ICE candidate:', error);
                });
        }
    }

    async createAndSendAnswer() {
        if (!this.peerConnection) return;
        
        try {
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            if (this.socket && this.socket.connected && this.currentRoom) {
                this.socket.emit('answer', { roomId: this.currentRoom, answer });
            }
        } catch (error) {
            console.error('Error creating answer:', error);
        }
    }

    onMatchFound() {
        this.createPeerConnection();
        this.showScreen('chatScreen');
        this.isConnected = true;
        this.addSystemMessage('Connected to a stranger. Say hello!');
        
        // Simulate remote stream for demo
        if (!this.textOnly) {
            this.simulateRemoteVideo();
        }
    }

    async createPeerConnection() {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream
        if (this.localStream && !this.textOnly) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }
        
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event.track);
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                this.remoteVideo.srcObject = this.remoteStream;
            }
        };
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Generated ICE candidate:', event.candidate);
                // Send candidate to peer via signaling server
                if (this.socket && this.socket.connected && this.currentRoom) {
                    this.socket.emit('ice-candidate', { 
                        roomId: this.currentRoom, 
                        candidate: event.candidate 
                    });
                } else {
                    console.log('ICE candidate (demo mode):', event.candidate);
                }
            }
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'connected') {
                this.addSystemMessage('Video connection established!');
            } else if (this.peerConnection.connectionState === 'failed') {
                this.addSystemMessage('Connection failed. Trying to reconnect...');
            }
        };
        
        // Create and send offer only if we're the initiator
        if (this.socket && this.socket.connected && this.currentRoom && this.isInitiator) {
            try {
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                console.log('Created and sent offer:', offer);
                this.socket.emit('offer', { roomId: this.currentRoom, offer });
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        } else {
            console.log('Not initiator, waiting for offer...');
        }
    }

    simulateRemoteVideo() {
        // For demo purposes, create a canvas with animation
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        let time = 0;
        const animate = () => {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw animated circles
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.sin(time + i) * 100 + canvas.width / 2,
                    Math.cos(time + i) * 100 + canvas.height / 2,
                    20 + Math.sin(time * 2 + i) * 10,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = `hsl(${(time * 50 + i * 60) % 360}, 70%, 50%)`;
                ctx.fill();
            }
            
            time += 0.02;
            requestAnimationFrame(animate);
        };
        
        animate();
        
        const stream = canvas.captureStream(30);
        this.remoteVideo.srcObject = stream;
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'you');
        this.messageInput.value = '';
        
        // Send message via signaling server
        if (this.socket && this.socket.connected && this.currentRoom) {
            this.socket.emit('chat-message', { 
                roomId: this.currentRoom, 
                message: message 
            });
        } else {
            // Simulate response for demo
            setTimeout(() => {
                const responses = [
                    'Hello there!',
                    'How are you?',
                    'Nice to meet you!',
                    'Where are you from?',
                    'What do you like to do?',
                    'That\'s interesting!',
                    'Tell me more.',
                    'Cool! 😊'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addMessage(randomResponse, 'stranger');
            }, 1000 + Math.random() * 2000);
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `<span class="message-text">${text}</span>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.innerHTML = `<span class="message-text">${text}</span>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    nextChat() {
        this.cleanup();
        this.showScreen('connectingScreen');
        this.addSystemMessage('Finding someone new...');
        
        // Request next match from server
        if (this.socket && this.socket.connected) {
            this.socket.emit('next');
        } else {
            // Fallback to demo mode
            setTimeout(() => {
                this.findMatch();
            }, 1500);
        }
    }

    stopChat() {
        // Notify server
        if (this.socket && this.socket.connected) {
            this.socket.emit('stop');
        }
        this.cleanup();
        this.goHome();
    }

    reportUser() {
        if (confirm('Are you sure you want to report this user?')) {
            this.addSystemMessage('User reported. Finding someone new...');
            
            // Notify server
            if (this.socket && this.socket.connected && this.currentRoom) {
                this.socket.emit('report', { roomId: this.currentRoom });
            }
            
            this.nextChat();
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.toggleVideoBtn.style.opacity = videoTrack.enabled ? '1' : '0.5';
            }
        }
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.toggleAudioBtn.style.opacity = audioTrack.enabled ? '1' : '0.5';
            }
        }
    }

    cleanup() {
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Clear video elements
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Clear chat messages
        this.chatMessages.innerHTML = '';
        
        this.isConnected = false;
    }

    goHome() {
        this.cleanup();
        this.showScreen('welcomeScreen');
    }

    showScreen(screenId) {
        const screens = [this.welcomeScreen, this.chatScreen, this.connectingScreen, this.disconnectedScreen];
        screens.forEach(screen => {
            if (screen.id === screenId) {
                screen.classList.remove('hidden');
            } else {
                screen.classList.add('hidden');
            }
        });
    }

    updateOnlineCount() {
        // Simulate online count
        const count = 1000 + Math.floor(Math.random() * 5000);
        this.onlineCount.textContent = count.toLocaleString();
        
        // Update every 30 seconds
        setTimeout(() => this.updateOnlineCount(), 30000);
    }

    // Simulate stranger disconnect
    simulateDisconnect() {
        if (this.isConnected && Math.random() < 0.1) { // 10% chance every 30 seconds
            setTimeout(() => {
                if (this.isConnected) {
                    this.onStrangerDisconnected();
                }
            }, 30000);
        }
    }

    onStrangerDisconnected() {
        this.cleanup();
        this.showScreen('disconnectedScreen');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new VComingleApp();
    
    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && app.isConnected) {
            app.simulateDisconnect();
        }
    });
    
    // Handle window close
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
