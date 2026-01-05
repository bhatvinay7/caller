# WebRTC Caller Application - Docker Setup

A complete WebRTC video calling application with signaling server, HTTP backend, and Next.js frontend. This guide covers local development with Cloudflare Tunnel for HTTPS testing.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **MongoDB** (or use MongoDB Atlas)
- **Cloudflare Account** (free tier works)
- **Metered.ca Account** (for TURN/STUN servers)

## 📁 Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js frontend
│   ├── http-server/            # Express backend API
│   └── signaling-server/       # WebSocket signaling server
├── docker-compose.dev.yaml
├── docker-compose.tunnel.yaml
└── README.md
```

## 🌍 Environment Setup

### 1. Get TURN/STUN Credentials from Metered.ca

1. Sign up at [metered.ca](https://www.metered.ca/)
2. Create a new application
3. Copy your STUN/TURN server credentials

### 2. Environment Variables

#### **apps/web/.env**

```env
# Cloudflare Tunnel URLs (update after tunnel creation)
NEXT_PUBLIC_SOCKET_URL=https://your-signaling-tunnel.trycloudflare.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-tunnel.trycloudflare.com

# Metered.ca STUN/TURN Servers
NEXT_PUBLIC_STUN_URL=stun:stun.relay.metered.ca:80
NEXT_PUBLIC_TURN_URL=turn:turn.relay.metered.ca:80
NEXT_PUBLIC_TURN_USERNAME=your_metered_username
NEXT_PUBLIC_TURN_PASSWORD=your_metered_password
```

#### **apps/http-server/.env**

```env
# Frontend URL (Cloudflare Tunnel)
NEXT_PUBLIC_FRONTEND_URL=https://your-web-tunnel.trycloudflare.com

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/webrtc_caller
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/webrtc_caller
```

#### **apps/signaling-server/.env**

```env
# Frontend URL (Cloudflare Tunnel)
NEXT_PUBLIC_FRONTEND_URL=https://your-web-tunnel.trycloudflare.com

# JWT Secret (must match http-server)
JWT_SECRET=your_super_secret_jwt_key_change_this
```

## 📦 Installation

### Install pnpm

**Windows (PowerShell):**
```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**Or via npm:**
```bash
npm install -g pnpm
```

**Verify installation:**
```bash
pnpm --version
```

### Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

## 🐳 Docker Setup

### Dockerfile for Each Service

#### **apps/web/Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY apps/web ./apps/web

# Set working directory to web app
WORKDIR /app/apps/web

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
```

#### **apps/http-server/Dockerfile**

```dockerfile
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/http-server/package.json ./apps/http-server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY apps/http-server ./apps/http-server

# Set working directory to http-server
WORKDIR /app/apps/http-server

# Expose port
EXPOSE 3002

# Start the application
CMD ["pnpm", "start"]
```

#### **apps/signaling-server/Dockerfile**

```dockerfile
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/signaling-server/package.json ./apps/signaling-server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY apps/signaling-server ./apps/signaling-server

# Set working directory to signaling-server
WORKDIR /app/apps/signaling-server

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]
```

### Docker Compose Files

#### **docker-compose.dev.yml** (Local Development)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: webrtc_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=webrtc_caller
    networks:
      - webrtc_network

  http-server:
    build:
      context: .
      dockerfile: apps/http-server/Dockerfile
    container_name: webrtc_http_server
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - PORT=3002
      - MONGO_URI=mongodb://mongodb:27017/webrtc_caller
    env_file:
      - apps/http-server/.env
    depends_on:
      - mongodb
    networks:
      - webrtc_network
    restart: unless-stopped

  signaling-server:
    build:
      context: .
      dockerfile: apps/signaling-server/Dockerfile
    container_name: webrtc_signaling_server
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - PORT=8080
    env_file:
      - apps/signaling-server/.env
    networks:
      - webrtc_network
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: webrtc_web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    env_file:
      - apps/web/.env
    depends_on:
      - http-server
      - signaling-server
    networks:
      - webrtc_network
    restart: unless-stopped

networks:
  webrtc_network:
    driver: bridge

volumes:
  mongodb_data:
```

#### **docker-compose.tunnel.yml** (With Cloudflare Tunnel)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: webrtc_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=webrtc_caller
    networks:
      - webrtc_network

  http-server:
    build:
      context: .
      dockerfile: apps/http-server/Dockerfile
    container_name: webrtc_http_server
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - MONGO_URI=mongodb://mongodb:27017/webrtc_caller
    env_file:
      - apps/http-server/.env
    depends_on:
      - mongodb
    networks:
      - webrtc_network
    restart: unless-stopped

  signaling-server:
    build:
      context: .
      dockerfile: apps/signaling-server/Dockerfile
    container_name: webrtc_signaling_server
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    env_file:
      - apps/signaling-server/.env
    networks:
      - webrtc_network
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: webrtc_web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - apps/web/.env
    depends_on:
      - http-server
      - signaling-server
    networks:
      - webrtc_network
    restart: unless-stopped

  # Cloudflare Tunnel for Web Frontend
  cloudflared-web:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared_web
    command: tunnel --no-autoupdate --url http://web:3000
    depends_on:
      - web
    networks:
      - webrtc_network
    restart: unless-stopped

  # Cloudflare Tunnel for HTTP Server
  cloudflared-http:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared_http
    command: tunnel --no-autoupdate --url http://http-server:3002
    depends_on:
      - http-server
    networks:
      - webrtc_network
    restart: unless-stopped

  # Cloudflare Tunnel for Signaling Server
  cloudflared-signaling:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared_signaling
    command: tunnel --no-autoupdate --url http://signaling-server:8080
    depends_on:
      - signaling-server
    networks:
      - webrtc_network
    restart: unless-stopped

networks:
  webrtc_network:
    driver: bridge

volumes:
  mongodb_data:
```

## 🌐 Cloudflare Tunnel Setup

### What is Cloudflare Tunnel?

Cloudflare Tunnel creates a secure outbound connection from your local machine to Cloudflare's network:

```
User → Cloudflare Edge → Tunnel → localhost:3000
```

**Benefits:**
- ✅ No direct connections to your machine
- ✅ Your IP stays hidden
- ✅ WebSockets work automatically
- ✅ Automatic HTTPS

### Installation

**Windows:**
```powershell
winget install --id Cloudflare.cloudflared
```

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin
```

**Verify:**
```bash
cloudflared --version
```

### Quick Tunnel Setup (Temporary URLs)

This is the fastest way to get HTTPS URLs for testing:

```bash
# Terminal 1 - Web Frontend
cloudflared tunnel --url http://localhost:3000

# Terminal 2 - HTTP Server
cloudflared tunnel --url http://localhost:3002

# Terminal 3 - Signaling Server
cloudflared tunnel --url http://localhost:8080
```

Each command will output a URL like:
```
https://random-name-xyz.trycloudflare.com
```

**📝 Important:** Copy these URLs and update your `.env` files accordingly!

### Permanent Tunnel Setup (Optional)

For production use with a custom domain:

1. **Login to Cloudflare:**
```bash
cloudflared tunnel login
```

2. **Create a tunnel:**
```bash
cloudflared tunnel create webrtc-caller
```

3. **Create config file `~/.cloudflared/config.yml`:**
```yaml
tunnel: <tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: app.yourdomain.com
    service: http://localhost:3000
  - hostname: api.yourdomain.com
    service: http://localhost:3002
  - hostname: signal.yourdomain.com
    service: http://localhost:8080
  - service: http_status:404
```

4. **Route DNS:**
```bash
cloudflared tunnel route dns webrtc-caller app.yourdomain.com
cloudflared tunnel route dns webrtc-caller api.yourdomain.com
cloudflared tunnel route dns webrtc-caller signal.yourdomain.com
```

5. **Run tunnel:**
```bash
cloudflared tunnel run webrtc-caller
```

## 🚀 Running the Application

### Option 1: Local Development (Without Docker)

```bash
# Start MongoDB locally or use MongoDB Atlas

# Terminal 1 - HTTP Server
cd apps/http-server
pnpm install
pnpm dev

# Terminal 2 - Signaling Server
cd apps/signaling-server
pnpm install
pnpm dev

# Terminal 3 - Web Frontend
cd apps/web
pnpm install
pnpm dev

# Terminal 4, 5, 6 - Cloudflare Tunnels (run after services start)
cloudflared tunnel --url http://localhost:3000
cloudflared tunnel --url http://localhost:3002
cloudflared tunnel --url http://localhost:8080
```

### Option 2: Docker Development

```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up --build

# In separate terminals, create tunnels
cloudflared tunnel --url http://localhost:3000
cloudflared tunnel --url http://localhost:3002
cloudflared tunnel --url http://localhost:8080
```

### Option 3: Docker with Integrated Tunnels

```bash
# Start all services with integrated Cloudflare tunnels
docker-compose -f docker-compose.tunnel.yml up --build

# Check logs for tunnel URLs
docker logs cloudflared_web
docker logs cloudflared_http
docker logs cloudflared_signaling
```

**⚠️ Update Environment Variables:** After getting tunnel URLs, update all `.env` files and restart services.

## 📱 Usage Guide

### Step 1: Create Two Accounts

1. **Account 1:**
   - Open the web app: `https://your-web-tunnel.trycloudflare.com`
   - Click "Sign Up"
   - Enter username and password
   - Complete registration

2. **Account 2:**
   - Open app in incognito window or different browser
   - Repeat registration process with different credentials

### Step 2: Create a Room (Host)

1. Login with Account 1
2. Navigate to `/chatRoom` route
3. Click "Create Room" button
4. Copy the generated Room ID (e.g., `room-abc123`)

### Step 3: Join the Room (Guest)

1. Login with Account 2 (in separate browser/incognito)
2. Navigate to "Join Room" page
3. Paste the Room ID from Step 2
4. Click "Join Room"

### Step 4: Start Video Call

- Both users should now see each other's video feeds
- Camera and microphone will be requested for permission
- Use the controls to:
  - 🎤 Mute/unmute microphone
  - 📹 Enable/disable video
  - 📞 End call

## 🔍 Troubleshooting

### WebRTC Connection Issues

**Problem:** Video not connecting or black screen

**Solutions:**
- Verify TURN/STUN credentials in `apps/web/.env`
- Check Cloudflare tunnels are running and accessible
- Open browser console (F12) and check for ICE connection errors
- Ensure browser has camera/microphone permissions
- Try different browsers (Chrome, Firefox, Safari)

### CORS Errors

**Problem:** CORS policy blocking requests

**Solutions:**
- Ensure `NEXT_PUBLIC_FRONTEND_URL` exactly matches your web tunnel URL
- Check that all services use HTTPS URLs from Cloudflare (not HTTP)
- Verify no trailing slashes in environment variables
- Restart all services after changing CORS settings

### MongoDB Connection

**Problem:** Cannot connect to MongoDB

**Solutions:**
- Check MongoDB is running: `docker ps | grep mongo`
- Verify `MONGO_URI` in environment variables
- For local MongoDB: ensure port 27017 is not in use
- For MongoDB Atlas: 
  - Whitelist all IPs (0.0.0.0/0) during development
  - Check username/password are correct
  - Verify cluster is running

### Environment Variables Not Loading

**Problem:** Services can't read environment variables

**Solutions:**
- Ensure `.env` files exist in correct directories:
  - `apps/web/.env`
  - `apps/http-server/.env`
  - `apps/signaling-server/.env`
- Restart Docker containers after changing `.env`
- Check for typos in variable names (case-sensitive)
- Verify no spaces around `=` in `.env` files

### Cloudflare Tunnel Disconnects

**Problem:** Tunnel URLs stop working or become inaccessible

**Solutions:**
- Quick tunnels are temporary - URLs change on restart
- Use permanent tunnels for stable testing
- Check `cloudflared` logs for errors
- Ensure stable internet connection
- Try restarting the tunnel

### JWT Authentication Errors

**Problem:** Token validation fails

**Solutions:**
- Ensure `JWT_SECRET` is identical in both:
  - `apps/http-server/.env`
  - `apps/signaling-server/.env`
- Clear browser cookies and local storage
- Re-login to generate new tokens

## 📝 Development Tips

1. **Use Docker for consistency** - Same environment across all team members
2. **MongoDB Atlas for production** - Easier than managing local MongoDB
3. **Permanent tunnels for team testing** - Stable URLs for shared development
4. **Environment variable checklist** - Double-check all `.env` files before starting
5. **Browser DevTools** - Monitor WebRTC connections in Chrome's `chrome://webrtc-internals`
6. **Test with multiple browsers** - Verify cross-browser compatibility

## 🛠️ Useful Commands

### Docker Commands

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Remove all volumes (fresh start)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild specific service
docker-compose -f docker-compose.dev.yml up --build web

# View logs
docker logs webrtc_web -f
docker logs webrtc_http_server -f
docker logs webrtc_signaling_server -f

# Check running containers
docker ps

# Execute command in container
docker exec -it webrtc_web sh
```

### Development Commands

```bash
# Install dependencies
pnpm install

# Run specific service
cd apps/web && pnpm dev
cd apps/http-server && pnpm dev
cd apps/signaling-server && pnpm dev

# Build for production
pnpm build

# Clean install
rm -rf node_modules
pnpm install --frozen-lockfile
```

## 🔒 Security Considerations

- **Never commit `.env` files** - Add them to `.gitignore`
- **Use strong JWT secrets** - Generate random strings (32+ characters)
- **MongoDB security** - Use authentication in production
- **TURN server credentials** - Rotate regularly
- **Rate limiting** - Implement on signaling server for production

## 📊 Architecture Overview

```
┌─────────────────┐
│   Web Browser   │
│   (Next.js)     │
└────────┬────────┘
         │
         ├──── HTTP ────► ┌──────────────────┐
         │                │  HTTP Server     │
         │                │  (Express API)   │
         │                └────────┬─────────┘
         │                         │
         └── WebSocket ──► ┌───────▼─────────┐
                           │ Signaling Server│
                           │  (Socket.io)    │
                           └────────┬────────┘
                                    │
                            ┌───────▼────────┐
                            │    MongoDB     │
                            └────────────────┘
```

## 📚 Additional Resources

- [WebRTC Documentation](https://webrtc.org/getting-started/overview)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Next.js Documentation](https://nextjs.org/docs)
- [pnpm Documentation](https://pnpm.io/)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
