@echo off
echo ========================================
echo   Database Setup - First Time Only
echo ========================================
echo.
echo This will:
echo   1. Generate Prisma client
echo   2. Push database schema to PostgreSQL
echo   3. Seed initial data (optional)
echo.
pause

echo.
echo [1/3] Generating Prisma client...
call npm run postinstall
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo [2/3] Pushing database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push database schema
    echo.
    echo Make sure PostgreSQL is running and credentials in .env are correct
    pause
    exit /b 1
)

echo.
echo [3/3] Do you want to seed initial data? (Y/N)
set /p seed="Enter choice: "
if /i "%seed%"=="Y" (
    call npm run db:seed
)

echo.
echo ========================================
echo   Database setup complete!
echo ========================================
echo.
echo You can now run START_APP.bat to start the application
echo.
pause
