@echo off
REM ============================================================================
REM Master Deployment Script - Property Manager
REM ============================================================================
REM Deploy Web, iOS, and Android applications with one command
REM ============================================================================

setlocal enabledelayedexpansion

set PROJECT_ROOT=%~dp0

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║        Property Manager - Master Deployment            ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Select what to deploy:
echo.
echo 1) Web Application (localhost:3000)
echo 2) iOS App (Expo Go / Cloud Build)
echo 3) Android APK (Download over network)
echo 4) Deploy All (Web + Mobile)
echo 5) Database Only (PostgreSQL)
echo 6) Exit
echo.
set /p DEPLOY_OPTION="Choose option (1-6): "

if "%DEPLOY_OPTION%"=="1" goto :deploy_web
if "%DEPLOY_OPTION%"=="2" goto :deploy_ios
if "%DEPLOY_OPTION%"=="3" goto :deploy_android
if "%DEPLOY_OPTION%"=="4" goto :deploy_all
if "%DEPLOY_OPTION%"=="5" goto :deploy_db
if "%DEPLOY_OPTION%"=="6" goto :exit

goto :invalid_option

:deploy_web
echo.
echo Starting Web Application deployment...
call "%PROJECT_ROOT%deploy_web.bat"
goto :end

:deploy_ios
echo.
echo Starting iOS deployment...
call "%PROJECT_ROOT%deploy_ios.bat"
goto :end

:deploy_android
echo.
echo Starting Android deployment...
call "%PROJECT_ROOT%deploy_android.bat"
goto :end

:deploy_all
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║        Deploying All Applications                      ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo This will:
echo   1. Start PostgreSQL database
echo   2. Deploy Web App (localhost:3000)
echo   3. Prepare Mobile Apps for testing
echo.
set /p CONTINUE="Continue? (Y/N): "
if /i not "%CONTINUE%"=="Y" goto :end

REM Start database
echo.
echo [1/3] Starting PostgreSQL...
docker ps --format "{{.Names}}" | findstr /C:"postgres-property" >nul 2>&1
if errorlevel 1 (
    docker run -d ^
        --name postgres-property ^
        -e POSTGRES_PASSWORD=postgres ^
        -e POSTGRES_DB=property_manager_db ^
        -p 5432:5432 ^
        postgres:15
    echo [OK] PostgreSQL started
) else (
    echo [OK] PostgreSQL already running
)

REM Start web in background
echo.
echo [2/3] Starting Web Application...
start "Property Manager Web" cmd /k "cd /d %PROJECT_ROOT%web && npm run dev"
echo [OK] Web app starting at http://localhost:3000

REM Start mobile
echo.
echo [3/3] Preparing Mobile Apps...
cd /d %PROJECT_ROOT%mobile
start "Property Manager Mobile" cmd /k "npx expo start --lan"
echo [OK] Mobile app ready for testing

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║           All Applications Deployed!                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Web App:    http://localhost:3000
echo Database:   localhost:5432
echo Mobile:     Scan QR code in new window
echo.
echo Demo Accounts:
echo   Admin:   admin@property.ro / admin123
echo   Manager: manager@property.ro / manager123
echo   Renter:  chirias@property.ro / chirias123
echo.
echo Check the new command windows for status.
echo Close them to stop the servers.
echo.
goto :end

:deploy_db
echo.
echo Starting PostgreSQL database...
docker ps --format "{{.Names}}" | findstr /C:"postgres-property" >nul 2>&1
if errorlevel 1 (
    docker run -d ^
        --name postgres-property ^
        -e POSTGRES_PASSWORD=postgres ^
        -e POSTGRES_DB=property_manager_db ^
        -p 5432:5432 ^
        postgres:15
    echo [OK] PostgreSQL started on port 5432
) else (
    echo [OK] PostgreSQL already running
)
goto :end

:invalid_option
echo.
echo [ERROR] Invalid option selected.

:end
echo.
pause
endlocal
