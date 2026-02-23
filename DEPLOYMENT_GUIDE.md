# 🚀 Deployment Guide - Property Manager

Complete guide for deploying the Property Manager application across all platforms.

## 📋 Quick Links

- **Web App**: Next.js web application
- **iOS App**: React Native iOS application  
- **Android App**: React Native Android application
- **Database**: PostgreSQL database

## 🎯 Quick Start (Windows)

### One-Command Deploy All

```batch
DEPLOY.bat
```

This master script will:
1. Start PostgreSQL database
2. Launch web app at http://localhost:3000
3. Prepare mobile apps for testing
4. Open all necessary terminals

### Individual Deployments

```batch
REM Web Application
deploy_web.bat

REM iOS App (via Expo Go)
deploy_ios.bat

REM Android APK
deploy_android.bat
```

---

## 🌐 Web Application Deployment

### What It Does
- Starts PostgreSQL database (Docker)
- Installs all dependencies
- Sets up database schema
- Seeds demo data
- Starts Next.js dev server

### Access
- **URL**: http://localhost:3000
- **Database**: localhost:5432

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@property.ro | admin123 |
| Manager | manager@property.ro | manager123 |
| Renter | chirias@property.ro | chirias123 |

### Manual Steps

```bash
# Navigate to web folder
cd web

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npm run db:seed

# Start development server
npm run dev
```

### Stop Server
- Press `Ctrl+C` in the terminal
- Or close the command window

---

## 📱 iOS App Deployment

### Methods Available

#### Method 1: Expo Go (Recommended for Testing)
**Fastest - No build required**

1. Run: `deploy_ios.bat`
2. Select option 1 (Expo Go)
3. Install "Expo Go" from App Store on iPhone
4. Scan QR code or enter: `exp://YOUR_IP:8081`
5. App loads instantly on iPhone

**Requirements:**
- iPhone with Expo Go app
- Same WiFi network as computer

#### Method 2: Cloud Build (For Distribution)
**Creates IPA file for App Store**

1. Run: `deploy_ios.bat`
2. Select option 2 (Cloud Build)
3. Create Expo account at https://expo.dev
4. Follow prompts to configure
5. Wait 10-15 minutes for cloud build
6. Download IPA from email

**Requirements:**
- Apple Developer account ($99/year)
- Expo account
- macOS (for final submission)

#### Method 3: Local Build (macOS Only)
**Requires Mac with Xcode**

```bash
# On macOS
./deploy_ios.sh
# Select option 1 (Simulator) or 2 (Archive)
```

**Requirements:**
- macOS
- Xcode installed
- iOS Simulator or physical device

### Network Testing

When deploying over network, the app is accessible via:

```
Local IP:  192.168.x.x (your computer's IP)
Port:      8081
URL:       exp://192.168.x.x:8081
```

**To find your IP:**
- Windows: `ipconfig`
- macOS: `ipconfig getifaddr en0`

---

## 🤖 Android APK Deployment

### Methods Available

#### Method 1: Expo Cloud Build (Recommended)
**Best for production APK**

1. Run: `deploy_android.bat`
2. Select option 1 (APK via Expo)
3. Wait 10-15 minutes
4. Download APK from: `apk_output/property-manager.apk`
5. Transfer to Android device and install

**Output:** Production-ready APK

#### Method 2: Network Testing (Fastest)
**Test without building**

1. Run: `deploy_android.bat`
2. Select option 2 (Deploy over network)
3. Install "Expo Go" from Google Play
4. Scan QR code or enter: `exp://YOUR_IP:8081`
5. App loads instantly

**Best for:** Quick testing during development

#### Method 3: Debug APK (Local Build)
**Faster build, larger file**

1. Run: `deploy_android.bat`
2. Select option 3 (Debug APK)
3. APK created in: `apk_output/property-manager-debug.apk`
4. Install via USB or transfer

**Requirements:**
- Android SDK (optional)
- Java JDK

### Install APK on Android

#### Method A: Direct Transfer
1. Copy APK to device (USB, email, cloud)
2. Open file manager on device
3. Tap APK file
4. Allow "Install from Unknown Sources"
5. Tap Install

#### Method B: ADB (USB Debugging)
```bash
# Enable USB debugging on device
# Connect via USB
adb install apk_output/property-manager.apk
```

#### Method C: Network Share
1. Host APK on local web server
2. Download on device via browser
3. Install downloaded APK

### APK Output Location

```
property-qwen/
└── apk_output/
    ├── property-manager.apk (production)
    └── property-manager-debug.apk (debug)
```

---

## 🐳 Database Deployment

### Start Database

```bash
# Using Docker
docker run -d \
  --name postgres-property \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=property_manager_db \
  -p 5432:5432 \
  postgres:15
```

### Stop Database

```bash
docker stop postgres-property
docker start postgres-property  # Restart later
```

### Access Database

- **Host**: localhost
- **Port**: 5432
- **Database**: property_manager_db
- **User**: postgres
- **Password**: postgres

### Tools

- **Prisma Studio**: `npm run db:studio` (in web folder)
- **pgAdmin**: Connect via GUI
- **psql**: `psql -U postgres -h localhost`

---

## 🔧 Troubleshooting

### Web App Won't Start

**Problem**: Port 3000 already in use

```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

**Problem**: PostgreSQL not running

```bash
# Check if running
docker ps | grep postgres

# Start if stopped
docker start postgres-property

# Check logs
docker logs postgres-property
```

### Mobile App Can't Connect

**Problem**: Device can't reach computer

**Solutions:**
1. Ensure same WiFi network
2. Check firewall settings
3. Use correct IP address (not localhost)
4. Try USB tethering

### APK Build Fails

**Problem**: Build errors

**Try:**
1. Clear cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Update Expo: `npm install -g expo-cli`
4. Use cloud build instead of local

### iOS Build Issues (macOS)

**Problem**: Xcode errors

**Solutions:**
```bash
# Clean build
cd mobile/ios
rm -rf DerivedData
rm -rf build

# Rebuild
npx expo prebuild --clean
npx expo run:ios
```

---

## 📊 Deployment Comparison

| Method | Speed | Quality | Best For |
|--------|-------|---------|----------|
| **Expo Go** | ⚡⚡⚡ Instant | Good | Development testing |
| **Debug APK** | ⚡⚡ 2-5 min | Good | Quick Android testing |
| **Cloud Build** | ⚡ 10-15 min | ⭐⭐⭐⭐⭐ Production | Distribution |
| **Local Build** | ⚡⚡ 5-10 min | ⭐⭐⭐⭐ High | Advanced users |

---

## 🌍 Network Deployment Details

### Find Your Local IP

**Windows:**
```batch
ipconfig
REM Look for "IPv4 Address"
```

**macOS/Linux:**
```bash
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
```

### Access URLs

Once deployed over network:

```
Web App:        http://YOUR_IP:3000
Metro Bundler:  http://YOUR_IP:8081
Expo DevTools:  http://YOUR_IP:8082
```

### Firewall Configuration

**Windows Defender:**
1. Open Windows Security
2. Firewall & network protection
3. Allow an app through firewall
4. Add Node.js and Expo

**macOS Firewall:**
1. System Preferences → Security & Privacy
2. Firewall tab
3. Allow incoming connections for Node.js

---

## 📦 Production Deployment

### Web App (Production)

```bash
cd web

# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy --prod
```

### Mobile Apps (Production)

#### iOS App Store
```bash
# Build with EAS
eas build:ios --profile production
eas submit --platform ios
```

#### Android Google Play
```bash
# Build AAB for Play Store
eas build:android --profile production
```

### Environment Variables

Update `.env` for production:

```env
# Production URLs
NEXTAUTH_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"

# Production database
DATABASE_URL="postgresql://user:pass@db-host:5432/dbname"

# Production secrets
NEXTAUTH_SECRET="<strong-random-secret>"
STRIPE_SECRET_KEY="sk_live_..."
```

---

## 🎯 Quick Reference

### Start Everything
```batch
DEPLOY.bat
# Select option 4 (Deploy All)
```

### Web Only
```batch
deploy_web.bat
```

### iOS Testing
```batch
deploy_ios.bat
# Select option 1 (Expo Go)
```

### Android APK
```batch
deploy_android.bat
# Select option 1 (Cloud Build)
```

### Stop All
- Close all command windows
- Or press `Ctrl+C` in each terminal

---

## 📞 Support

### Common Issues

1. **Docker not running**: Start Docker Desktop
2. **Port conflicts**: Change ports in .env
3. **Network issues**: Check firewall settings
4. **Build failures**: Clear cache and retry

### Logs Location

- **Web**: Terminal where `npm run dev` runs
- **Mobile**: Expo DevTools window
- **Database**: `docker logs postgres-property`

### Useful Commands

```bash
# Web folder
cd web
npm run dev          # Start dev server
npm run build        # Build production
npm run db:studio    # Database GUI

# Mobile folder
cd mobile
npm start           # Expo DevTools
npx expo doctor     # Check configuration
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Update environment variables
- [ ] Change default passwords
- [ ] Test all features
- [ ] Check mobile apps on real devices
- [ ] Verify database backups
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring
- [ ] Test payment integration (Stripe)
- [ ] Verify OCR functionality
- [ ] Test user approval flow

---

**Last Updated**: 2024
**Version**: 1.0.0
**Platforms**: Web, iOS, Android
