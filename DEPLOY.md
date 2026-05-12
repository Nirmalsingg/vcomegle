# Deploy VComingle to Vercel

## Quick Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from project directory**
```bash
cd "c:/Users/kamal and nirmal/OneDrive/Desktop/vcomegle"
vercel
```

4. **Follow the prompts**
   - Set up and deploy
   - Choose "Vercel" as the framework preset
   - Confirm settings

### Method 2: Using GitHub Integration

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial VComingle deployment"
git branch -M main
git remote add origin https://github.com/yourusername/vcomegle.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Deploy automatically

### Method 3: Direct Upload

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Upload files directly**
4. **Drag and drop all project files**

## Deployment Configuration

The project is already configured with:
- ✅ `vercel.json` - Serverless function routing
- ✅ `package.json` - Dependencies and build scripts
- ✅ `server.js` - Production-ready signaling server
- ✅ Updated `app.js` - Production WebRTC implementation

## What Gets Deployed

- **Frontend**: Static HTML, CSS, JavaScript files
- **Backend**: Node.js serverless function for signaling
- **WebRTC**: Peer-to-peer video streaming
- **Socket.io**: Real-time communication

## Post-Deployment

1. **Test the deployed app**
   - Visit your Vercel URL
   - Test video chat functionality
   - Verify text messaging works

2. **HTTPS is automatic**
   - Vercel provides free SSL certificates
   - WebRTC requires HTTPS for camera access

3. **Monitor usage**
   - Check Vercel analytics
   - Monitor serverless function usage

## Environment Variables (Optional)

Add these in Vercel dashboard if needed:
```
NODE_ENV=production
PORT=3000
```

## Troubleshooting

### Camera Not Working
- Ensure HTTPS is enabled (automatic on Vercel)
- Check browser permissions
- Try different browser

### Connection Issues
- Check server logs in Vercel dashboard
- Verify Socket.io connection
- Test with different users

### Deployment Errors
- Check `vercel.json` syntax
- Verify `package.json` dependencies
- Ensure all files are uploaded

## Features Available on Deployment

- ✅ Real random matching
- ✅ WebRTC video streaming
- ✅ Text messaging
- ✅ User controls (Next, Stop, Report)
- ✅ Mobile responsive
- ✅ HTTPS secure connection
- ✅ Global CDN distribution

## Production vs Demo Mode

The app automatically detects if the signaling server is available:
- **Production Mode**: Real WebRTC connections with other users
- **Demo Mode**: Simulated connections when server unavailable

Your Vercel deployment will run in full production mode with real user connections!
