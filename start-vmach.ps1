# V_mach Startup Script
Write-Host "Starting V_mach Application..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the correct directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting React Development Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting API Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:api" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting Python Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py" -WindowStyle Normal

Write-Host ""
Write-Host "V_mach services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "API Server: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""

# Wait a bit for services to start
Start-Sleep -Seconds 5

Write-Host "Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Application opened in browser!" -ForegroundColor Green
Write-Host "Keep the service windows open to monitor the applications." -ForegroundColor Yellow
Read-Host "Press Enter to exit this script"
