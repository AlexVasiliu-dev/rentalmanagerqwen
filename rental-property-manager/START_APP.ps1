# Rental Property Manager - Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Rental Property Manager - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgRunning = $false

try {
    $result = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        $pgRunning = $true
    }
} catch {
    $pgRunning = $false
}

if (-not $pgRunning) {
    Write-Host "[ERROR] PostgreSQL is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "  - If installed as service: net start postgresql-x64-16" -ForegroundColor White
    Write-Host "  - Or start from pgAdmin" -ForegroundColor White
    Write-Host "  - Or install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "[OK] PostgreSQL is running" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
Write-Host ""

# Start the app
npm run dev

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
