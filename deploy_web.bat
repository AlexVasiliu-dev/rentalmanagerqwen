@echo off
REM ============================================================================
REM Deploy Web - Property Manager (Windows)
REM ============================================================================
REM This script starts PostgreSQL, Next.js web server, and makes the app
REM available at http://localhost:3000
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ROOT=%~dp0
set WEB_DIR=%PROJECT_ROOT%web
set DB_NAME=property_manager_db
set DB_USER=postgres
set DB_PASSWORD=postgres
set DB_PORT=5432
set CONTAINER_NAME=postgres-property

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Property Manager - Web Deployment Script          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check Docker
echo [1/8] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Start PostgreSQL
echo.
echo [2/8] Starting PostgreSQL database...
docker ps --format "{{.Names}}" | findstr /C:"%CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 (
    echo [INFO] PostgreSQL container already exists
    docker start %CONTAINER_NAME% >nul 2>&1
) else (
    echo [INFO] Creating PostgreSQL container...
    docker run -d ^
        --name %CONTAINER_NAME% ^
        -e POSTGRES_PASSWORD=%DB_PASSWORD% ^
        -e POSTGRES_DB=%DB_NAME% ^
        -p %DB_PORT%:5432 ^
        -v postgres-property-data:/var/lib/postgresql/data ^
        postgres:15
    timeout /t 5 /nobreak >nul
)
echo [OK] PostgreSQL is running on port %DB_PORT%

REM Install dependencies
echo.
echo [3/8] Installing web dependencies...
cd /d %WEB_DIR%
if not exist "node_modules" (
    call npm install
) else (
    echo [INFO] Dependencies already installed
)
echo [OK] Dependencies ready

REM Setup environment
echo.
echo [4/8] Setting up environment...
if not exist ".env" (
    copy .env.example .env >nul 2>&1 || (
        echo DATABASE_URL="postgresql://%DB_USER%:%DB_PASSWORD%@localhost:%DB_PORT%/%DB_NAME%?schema=public" > .env
        echo NEXTAUTH_SECRET="property-manager-secret-key-change-in-production" >> .env
        echo NEXTAUTH_URL="http://localhost:3000" >> .env
    )
    echo [OK] Created .env file
) else (
    echo [OK] .env file already exists
)

REM Setup database
echo.
echo [5/8] Setting up database schema...
call npx prisma generate
call npx prisma db push --accept-data-loss
echo [OK] Database schema created

REM Seed database
echo.
echo [6/8] Seeding database with demo data...
call npm run db:seed || echo [INFO] Skipping seed
echo [OK] Database ready

REM Build application
echo.
echo [7/8] Building application...
call npm run build
echo [OK] Application built

REM Start server
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║           Deployment Complete!                         ║
echo ║                                                        ║
echo ║  Web App: http://localhost:3000                        ║
echo ║  Database: localhost:%DB_PORT%                            ║
echo ║                                                        ║
echo ║  Demo Accounts:                                        ║
echo ║  Admin:   admin@property.ro / admin123                 ║
echo ║  Manager: manager@property.ro / manager123             ║
echo ║  Renter:  chirias@property.ro / chirias123             ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo [8/8] Starting Next.js development server...
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

REM Cleanup on exit
echo.
echo Stopping server...
endlocal
