const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const PaymentAPI = require('./payment-api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname)));

// Store connected users and rooms
const users = new Map();
const rooms = new Map();
const waitingUsers = [];

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User looking for a match
    socket.on('find-match', (data) => {
        const { textOnly, interests } = data;
        const user = {
            id: socket.id,
            textOnly,
            interests: interests ? interests.split(',').map(i => i.trim()) : [],
            socket: socket
        };

        users.set(socket.id, user);

        // Find a matching user
        const match = findMatch(user);
        
        if (match) {
            // Create a room for the matched users
            const roomId = generateRoomId();
            const room = {
                id: roomId,
                users: [user, match],
                createdAt: new Date()
            };
            
            rooms.set(roomId, room);
            
            // Remove from waiting list
            const waitingIndex = waitingUsers.indexOf(match);
            if (waitingIndex > -1) {
                waitingUsers.splice(waitingIndex, 1);
            }
            
            // Notify both users with their roles
            // First user (user) becomes the initiator
            socket.emit('match-found', { roomId, strangerId: match.id, isInitiator: true });
            // Second user (match) becomes the receiver
            match.socket.emit('match-found', { roomId, strangerId: user.id, isInitiator: false });
            
            console.log(`Matched users ${user.id} (initiator) and ${match.id} (receiver) in room ${roomId}`);
        } else {
            // Add to waiting list
            waitingUsers.push(user);
            socket.emit('waiting');
            console.log(`User ${socket.id} added to waiting list`);
        }
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
        const { roomId, offer } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            const otherUser = room.users.find(u => u.id !== socket.id);
            if (otherUser) {
                console.log(`Forwarding offer from ${socket.id} to ${otherUser.id}`);
                otherUser.socket.emit('offer', { offer, from: socket.id });
            } else {
                console.log('No other user found in room for offer');
            }
        } else {
            console.log('Room not found for offer:', roomId);
        }
    });

    socket.on('answer', (data) => {
        const { roomId, answer } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            const otherUser = room.users.find(u => u.id !== socket.id);
            if (otherUser) {
                console.log(`Forwarding answer from ${socket.id} to ${otherUser.id}`);
                otherUser.socket.emit('answer', { answer, from: socket.id });
            } else {
                console.log('No other user found in room for answer');
            }
        } else {
            console.log('Room not found for answer:', roomId);
        }
    });

    socket.on('ice-candidate', (data) => {
        const { roomId, candidate } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            const otherUser = room.users.find(u => u.id !== socket.id);
            if (otherUser) {
                console.log(`Forwarding ICE candidate from ${socket.id} to ${otherUser.id}`);
                otherUser.socket.emit('ice-candidate', { candidate, from: socket.id });
            } else {
                console.log('No other user found in room for ICE candidate');
            }
        } else {
            console.log('Room not found for ICE candidate:', roomId);
        }
    });

    // Chat messages
    socket.on('chat-message', (data) => {
        const { roomId, message } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            const otherUser = room.users.find(u => u.id !== socket.id);
            if (otherUser) {
                otherUser.socket.emit('chat-message', { message, from: socket.id });
            }
        }
    });

    // User actions
    socket.on('next', () => {
        leaveRoom(socket.id);
        socket.emit('disconnected');
        
        // Try to find a new match
        const user = users.get(socket.id);
        if (user) {
            const match = findMatch(user);
            
            if (match) {
                const roomId = generateRoomId();
                const room = {
                    id: roomId,
                    users: [user, match],
                    createdAt: new Date()
                };
                
                rooms.set(roomId, room);
                
                const waitingIndex = waitingUsers.indexOf(match);
                if (waitingIndex > -1) {
                    waitingUsers.splice(waitingIndex, 1);
                }
                
                socket.emit('match-found', { roomId, strangerId: match.id });
                match.socket.emit('match-found', { roomId, strangerId: user.id });
                
                console.log(`Re-matched users ${user.id} and ${match.id} in room ${roomId}`);
            } else {
                waitingUsers.push(user);
                socket.emit('waiting');
            }
        }
    });

    socket.on('stop', () => {
        leaveRoom(socket.id);
        socket.emit('disconnected');
    });

    socket.on('report', (data) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            const otherUser = room.users.find(u => u.id !== socket.id);
            if (otherUser) {
                console.log(`User ${socket.id} reported user ${otherUser.id}`);
                // In production, you'd log this for moderation
            }
        }
        
        leaveRoom(socket.id);
        socket.emit('disconnected');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        const user = users.get(socket.id);
        if (user) {
            leaveRoom(socket.id);
            
            // Remove from waiting list
            const waitingIndex = waitingUsers.indexOf(user);
            if (waitingIndex > -1) {
                waitingUsers.splice(waitingIndex, 1);
            }
            
            users.delete(socket.id);
        }
    });
});

// Helper functions
function findMatch(user) {
    // Find a user with similar preferences
    for (let i = 0; i < waitingUsers.length; i++) {
        const candidate = waitingUsers[i];
        
        // Check if both users want the same mode (text/video)
        if (candidate.textOnly === user.textOnly) {
            // Check for shared interests (if any)
            if (user.interests.length > 0 && candidate.interests.length > 0) {
                const sharedInterests = user.interests.filter(interest => 
                    candidate.interests.includes(interest)
                );
                
                // Prioritize users with shared interests
                if (sharedInterests.length > 0) {
                    return candidate;
                }
            } else {
                // No interests specified, match anyway
                return candidate;
            }
        }
    }
    
    // No specific match found, return first available user with same mode preference
    return waitingUsers.find(candidate => candidate.textOnly === user.textOnly);
}

function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

function leaveRoom(userId) {
    // Find and remove user from any room
    for (const [roomId, room] of rooms.entries()) {
        const userIndex = room.users.findIndex(u => u.id === userId);
        
        if (userIndex > -1) {
            const otherUser = room.users.find(u => u.id !== userId);
            
            if (otherUser) {
                otherUser.socket.emit('stranger-disconnected');
                // Add other user back to waiting list
                waitingUsers.push(otherUser);
            }
            
            rooms.delete(roomId);
            console.log(`User ${userId} left room ${roomId}`);
            break;
        }
    }
}

// Clean up old rooms periodically
setInterval(() => {
    const now = new Date();
    for (const [roomId, room] of rooms.entries()) {
        // Remove rooms older than 1 hour
        if (now - room.createdAt > 3600000) {
            rooms.delete(roomId);
            console.log(`Cleaned up old room ${roomId}`);
        }
    }
}, 300000); // Check every 5 minutes

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        users: users.size,
        rooms: rooms.size,
        waiting: waitingUsers.length
    });
});

const PORT = process.env.PORT || 3000;

// Initialize payment API
const paymentAPI = new PaymentAPI();

server.listen(PORT, () => {
    console.log(`VComingle server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
    
    // Start payment API on separate port
    paymentAPI.start(3001);
    console.log(`Payment API server running on port 3001`);
});
