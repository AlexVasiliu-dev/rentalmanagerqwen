@echo off
REM ============================================================================
REM Deploy iOS - Property Manager (Windows)
REM ============================================================================
REM Note: Full iOS builds require macOS. This script provides alternatives.
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ROOT=%~dp0
set MOBILE_DIR=%PROJECT_ROOT%mobile

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║    Property Manager - iOS Deployment Script            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check prerequisites
echo [1/5] Checking prerequisites...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b 1
)
echo [OK] Node.js installed

REM Install dependencies
echo.
echo [2/5] Installing mobile dependencies...
cd /d %MOBILE_DIR%
call npm install
echo [OK] Dependencies installed

REM Setup environment
echo.
echo [3/5] Setting up environment...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :got_ip
)
:got_ip
set LOCAL_IP=%LOCAL_IP: =%

if not exist ".env" (
    echo EXPO_PUBLIC_API_URL=http://%LOCAL_IP%:3000/api > .env
    echo EXPO_PUBLIC_APP_NAME=Property Manager >> .env
    echo [OK] Created .env file
) else (
    echo [OK] .env file exists
)

REM Build options
echo.
echo [4/5] Select deployment method:
echo.
echo NOTE: Full iOS builds require macOS and Xcode.
echo       Use these alternatives for testing on Windows:
echo.
echo 1) Expo Go (Recommended - Test on iPhone via QR code)
echo 2) Web Version (Test in browser)
echo 3) Build for macOS (Requires Mac)
echo.
set /p BUILD_OPTION="Choose option (1-3): "

if "%BUILD_OPTION%"=="1" goto :expo_go
if "%BUILD_OPTION%"=="2" goto :web_version
if "%BUILD_OPTION%"=="3" goto :macos_build
goto :invalid_option

:expo_go
echo.
echo [5/5] Starting Expo development server...
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║        iOS App Available via Expo Go                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Local IP: %LOCAL_IP%
echo Port: 8081
echo.
echo To test on iPhone:
echo.
echo   Step 1: Install "Expo Go" from App Store
echo   Step 2: Connect iPhone to same WiFi network
echo   Step 3: Open Expo Go app
echo   Step 4: Scan QR code or enter manually:
echo.
echo           exp://%LOCAL_IP%:8081
echo.
echo   Step 5: App will load on your iPhone
echo.
echo Starting Metro bundler...
echo Press Ctrl+C to stop
echo.
cd /d %MOBILE_DIR%
call npx expo start --tunnel
goto :end

:web_version
echo.
echo [5/5] Building web version...
echo.
cd /d %MOBILE_DIR%
call npx expo export:web
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║        Web Version Ready                               ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Web app built in: %MOBILE_DIR%\web-build\
echo.
echo To test on iPhone:
echo   1. Host web-build folder on local server
echo   2. Open Safari on iPhone
echo   3. Navigate to: http://%LOCAL_IP%/web-build
echo.
echo Or test locally:
echo   Open: http://localhost:8080
echo.
goto :end

:macos_build
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║        macOS Required for iOS Build                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo To build iOS app for distribution:
echo.
echo   Option 1: Use a Mac
echo     1. Transfer mobile folder to Mac
echo     2. Run: ./deploy_ios.sh
echo     3. Follow prompts to build
echo.
echo   Option 2: Use Expo Application Services (EAS)
echo     1. Create account at: https://expo.dev
echo     2. Install EAS CLI: npm install -g eas-cli
echo     3. Run: eas build:ios
echo     4. Build will be done in cloud
echo     5. Download IPA file when ready
echo.
echo   Option 3: Use Expo Go (Recommended for testing)
echo     1. Select option 1 from main menu
echo     2. Test on iPhone via QR code
echo.
goto :end

:invalid_option
echo [ERROR] Invalid option

:end
echo.
pause
endlocal
