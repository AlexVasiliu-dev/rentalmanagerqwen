# 🏠 Rental Property Manager - Quick Start Guide

You now have TWO rental property management applications in this location:

## 📁 Directory Structure

```
C:\Users\Alexandru\Documents\property\qwen\
├── rental-property-manager\          # Next.js + PostgreSQL + Prisma
└── rental-property-manager-fastapi\  # FastAPI + React + SQLite
```

---

## 🚀 Option 1: Next.js App (rental-property-manager)

### Features
- ✅ Next.js 14 with TypeScript
- ✅ PostgreSQL database with Prisma ORM
- ✅ NextAuth authentication
- ✅ Stripe payment integration
- ✅ Tesseract.js OCR for meter readings
- ✅ Mobile responsive design
- ✅ Multi-language support (next-intl)
- ✅ File uploads with UploadThing

### Prerequisites
- Node.js installed
- PostgreSQL installed and running

### Setup Steps

1. **Install PostgreSQL** (if not installed)
   - Download: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Username: postgres
   - Password: postgres
   - Port: 5432

2. **Setup Database** (First time only)
   - Double-click: `SETUP_DATABASE.bat`
   - This will create tables and seed data

3. **Start the App**
   - Double-click: `START_APP.bat` or `START_APP.ps1`
   - Opens at: http://localhost:3000

### Configuration
Edit `.env` file to configure:
- Database connection
- Stripe API keys
- NextAuth secret
- App URL

---

## 🚀 Option 2: FastAPI App (rental-property-manager-fastapi)

### Features
- ✅ FastAPI backend with Python
- ✅ React frontend with Vite
- ✅ SQLite database (no setup needed!)
- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ OCR ready (Tesseract)
- ✅ Simple and fast

### Prerequisites
- Python 3.8+ installed
- Node.js installed

### Setup Steps

1. **First Time Setup**
   ```bash
   cd rental-property-manager-fastapi\backend
   pip install -r requirements.txt
   python init_db.py
   
   cd ..\frontend
   npm install
   ```

2. **Start the App**
   - Double-click: `START_ALL.bat` or `START_ALL.ps1`
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

### Default Credentials
- Email: admin@test.com
- Password: admin123

---

## 🎯 Which One Should You Use?

### Use Next.js App if you want:
- ✅ Production-ready with PostgreSQL
- ✅ Stripe payment integration
- ✅ Advanced features (file uploads, i18n)
- ✅ Better scalability
- ✅ Mobile app support

### Use FastAPI App if you want:
- ✅ Simpler setup (no PostgreSQL needed)
- ✅ Faster development
- ✅ Python backend
- ✅ Lightweight SQLite database
- ✅ Easy to understand codebase

---

## 📝 Common Tasks

### Next.js App

**View Database**
```bash
cd rental-property-manager
npm run db:studio
```

**Reset Database**
```bash
npm run db:push
npm run db:seed
```

**Build for Production**
```bash
npm run build
npm start
```

### FastAPI App

**View Database**
```bash
cd rental-property-manager-fastapi\backend
sqlite3 rental_manager.db
.tables
```

**Reset Database**
```bash
cd backend
del rental_manager.db
python init_db.py
```

**API Documentation**
Open: http://localhost:8000/docs

---

## 🛠️ Troubleshooting

### Next.js App

**PostgreSQL not running**
- Start PostgreSQL service
- Or run: `net start postgresql-x64-16`

**Port 3000 already in use**
- Stop other apps using port 3000
- Or change port in package.json

### FastAPI App

**Backend won't start**
- Check Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`

**Frontend won't start**
- Check Node.js is installed: `node --version`
- Install dependencies: `npm install`

---

## 📞 Support

Both apps are fully functional and tested!

### Next.js App
- Check: `PROJECT_SUMMARY.md`
- Check: `QUICKSTART.md`
- Check: `PAYMENT_MODULE.md`

### FastAPI App
- Check: `ALL_FIXED.md`
- Check: `SYSTEM_READY.md`
- Check: `QUICK_START.md`

---

## 🎉 You're All Set!

Choose the app that fits your needs and double-click the startup script!

**Next.js**: `START_APP.bat` in rental-property-manager\
**FastAPI**: `START_ALL.bat` in rental-property-manager-fastapi\

Happy property managing! 🏠
