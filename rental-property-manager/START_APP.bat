@echo off
echo ========================================
echo   Rental Property Manager - Startup
echo ========================================
echo.
echo Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not running!
    echo.
    echo Please start PostgreSQL first:
    echo   - If installed as service: net start postgresql-x64-16
    echo   - Or start from pgAdmin
    echo   - Or install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL is running
echo.
echo Starting Next.js development server...
echo.
npm run dev

pause
