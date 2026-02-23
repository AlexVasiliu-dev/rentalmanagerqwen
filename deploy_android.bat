@echo off
REM ============================================================================
REM Deploy Android APK - Property Manager (Windows)
REM ============================================================================
REM This script builds Android APK and makes it available for testing over IP
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ROOT=%~dp0
set MOBILE_DIR=%PROJECT_ROOT%mobile
set APK_OUTPUT_DIR=%PROJECT_ROOT%apk_output

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Property Manager - Android Deployment Script         ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check prerequisites
echo [1/6] Checking prerequisites...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b 1
)
echo [OK] Node.js installed

where java >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Java not found. APK build may fail.
) else (
    echo [OK] Java installed
)

REM Install dependencies
echo.
echo [2/6] Installing mobile dependencies...
cd /d %MOBILE_DIR%
call npm install
echo [OK] Dependencies installed

REM Setup environment
echo.
echo [3/6] Setting up environment...
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

REM Create output directory
echo.
echo [4/6] Setting up APK output directory...
if not exist "%APK_OUTPUT_DIR%" mkdir "%APK_OUTPUT_DIR%"
echo [OK] Output directory: %APK_OUTPUT_DIR%

REM Build options
echo.
echo [5/6] Select build type:
echo 1) APK via Expo (Cloud build, recommended)
echo 2) Deploy over network (Expo Go, fastest)
echo 3) Debug APK (Local build)
echo.
set /p BUILD_OPTION="Choose option (1-3): "

if "%BUILD_OPTION%"=="1" goto :build_expo
if "%BUILD_OPTION%"=="2" goto :build_network
if "%BUILD_OPTION%"=="3" goto :build_debug
goto :invalid_option

:build_expo
echo.
echo Building APK with Expo (cloud build)...
echo This will take 10-15 minutes...
cd /d %MOBILE_DIR%

where eas >nul 2>&1
if errorlevel 1 (
    echo Installing EAS CLI...
    call npm install -g eas-cli
)

if not exist "eas.json" (
    echo Initializing EAS...
    call eas init
)

call eas build:android --profile preview --output "%APK_OUTPUT_DIR%\property-manager.apk"
echo [OK] APK built: %APK_OUTPUT_DIR%\property-manager.apk
goto :show_info

:build_network
echo.
echo Starting Expo development server...
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Android App Available Over Network                 ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Local IP: %LOCAL_IP%
echo Port: 8081
echo.
echo To test on Android:
echo 1. Install Expo Go from Google Play
echo 2. Connect to same WiFi
echo 3. Scan QR code or enter: exp://%LOCAL_IP%:8081
echo.
cd /d %MOBILE_DIR%
call npx expo start --lan
goto :end

:build_debug
echo.
echo Building debug APK...
cd /d %MOBILE_DIR%
call npx expo prebuild --platform android --clean
cd android
call gradlew.bat assembleDebug
cd ..

REM Copy APK
for /r "android\app\build\outputs\apk" %%f in (*debug*.apk) do (
    copy "%%f" "%APK_OUTPUT_DIR%\property-manager-debug.apk"
)
echo [OK] Debug APK built: %APK_OUTPUT_DIR%\property-manager-debug.apk

REM Try to install on connected device
where adb >nul 2>&1
if not errorlevel 1 (
    echo.
    echo Checking for connected devices...
    adb devices | findstr "device" >nul 2>&1
    if not errorlevel 1 (
        echo Installing on device...
        adb install -r "%APK_OUTPUT_DIR%\property-manager-debug.apk"
        echo [OK] Installed on device!
    )
)
goto :show_info

:invalid_option
echo [ERROR] Invalid option
goto :end

:show_info
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║            Available APK Files                         ║
echo ╚════════════════════════════════════════════════════════╝
echo.
dir /b %APK_OUTPUT_DIR%\*.apk 2>nul
echo.
echo To install on Android:
echo   1. Copy APK to device
echo   2. Tap APK file to install
echo   3. Allow "Install from Unknown Sources"
echo   4. Tap Install
echo.

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║           Deployment Complete!                         ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo APK Location: %APK_OUTPUT_DIR%
echo.

:end
pause
endlocal
