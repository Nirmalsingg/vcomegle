# VComingle - Random Video Chat Platform

A modern Omegle-like video chat application built with WebRTC technology. Connect with random people around the world through video and text chat.

## Features

- **Random Video Chat**: Connect with strangers via WebRTC video calls
- **Text Chat Mode**: Option to chat via text only
- **Real-time Messaging**: Instant text messaging during video calls
- **User Controls**: Start/stop chat, next stranger, report users
- **Media Controls**: Toggle camera and microphone during calls
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, gradient-based design with smooth animations

## Demo Features

This version includes simulated functionality for demonstration:
- Simulated random matching
- Animated placeholder video for the stranger
- Automated chat responses for testing
- Random disconnect simulation

## Getting Started

### Prerequisites

- Modern web browser with WebRTC support
- HTTPS connection required for camera/microphone access
- Node.js (for server setup, optional)

### Quick Start

1. **Clone or download the project files**
2. **Open `index.html` in your browser**
3. **Allow camera/microphone permissions** (if using video mode)
4. **Click "Start Chatting"** to begin

### Local Development

For local development with camera access, you'll need to serve the files via HTTPS:

#### Option 1: Using Python
```bash
# Install dependencies
pip install flask

# Run the server
python server.py
```

#### Option 2: Using Node.js
```bash
# Install dependencies
npm install

# Run the server
npm start
```

#### Option 3: Using Live Server (VS Code)
1. Install the Live Server extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Project Structure

```
vcomegle/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js              # JavaScript application logic
├── server.py           # Python Flask server (optional)
├── package.json        # Node.js configuration (optional)
└── README.md           # This file
```

## How It Works

### Frontend
- **HTML5 Structure**: Semantic markup with accessibility in mind
- **CSS3 Styling**: Modern design with gradients, animations, and responsive layout
- **JavaScript ES6+**: WebRTC implementation, DOM manipulation, and event handling

### WebRTC Implementation
- **Peer Connection**: RTCPeerConnection for direct P2P communication
- **Media Streams**: getUserMedia API for camera/microphone access
- **ICE Candidates**: STUN server for NAT traversal
- **Signaling**: WebSocket connection for peer discovery (simulated)

### User Interface
- **Welcome Screen**: Preferences and rules display
- **Connecting Screen**: Loading animation during matching
- **Chat Screen**: Video feeds, chat messages, and controls
- **Disconnected Screen**: Options to reconnect or return home

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## Security Considerations

- **HTTPS Required**: Camera/microphone access requires secure connection
- **User Privacy**: No data storage or tracking
- **Content Moderation**: Report functionality for inappropriate behavior
- **Age Restriction**: 18+ warning displayed

## Customization

### Theming
Edit `styles.css` to customize colors and design:
```css
/* Primary gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Server Configuration
For production deployment, configure a signaling server:
1. Set up WebSocket server (Node.js, Python, etc.)
2. Update `connectToSignalingServer()` in `app.js`
3. Implement room management and peer matching logic

### Features to Add
- User authentication
- Interest-based matching
- Language preferences
- Video filters
- Screen sharing
- File transfer
- Voice-only mode

## Troubleshooting

### Camera/Microphone Not Working
1. Check browser permissions
2. Ensure HTTPS connection
3. Try different browser
4. Check device settings

### Connection Issues
1. Check internet connection
2. Disable VPN/firewall
3. Clear browser cache
4. Update browser

### Mobile Issues
1. Use mobile browser (not app)
2. Allow motion sensors if needed
3. Check mobile data settings

## License

This project is for educational purposes. Use responsibly and comply with local laws regarding random chat services.

## Contributing

Feel free to submit issues and enhancement requests!

---

**Disclaimer**: This is a demonstration project. For production use, implement proper security measures, content moderation, and legal compliance.
