# V_mach Services Startup Script
# This script will start all 3 services for V_mach

Write-Host "========================================" -ForegroundColor Green
Write-Host "    V_mach Services Startup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Script directory: $ScriptDir" -ForegroundColor Yellow

# Change to the script directory
Set-Location $ScriptDir
Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the V_mach directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting V_mach services..." -ForegroundColor Cyan
Write-Host ""

# Start React Development Server
Write-Host "[1/3] Starting React Frontend (port 5173)..." -ForegroundColor Yellow
$ReactJob = Start-Job -ScriptBlock {
    Set-Location $using:ScriptDir
    npm run dev
}
Write-Host "React service started (Job ID: $($ReactJob.Id))" -ForegroundColor Green

# Wait a bit
Start-Sleep -Seconds 3

# Start API Server
Write-Host "[2/3] Starting API Server (port 3001)..." -ForegroundColor Yellow
$ApiJob = Start-Job -ScriptBlock {
    Set-Location $using:ScriptDir
    npm run start:api
}
Write-Host "API service started (Job ID: $($ApiJob.Id))" -ForegroundColor Green

# Wait a bit
Start-Sleep -Seconds 3

# Start Python Backend
Write-Host "[3/3] Starting Python Backend..." -ForegroundColor Yellow
$PythonJob = Start-Job -ScriptBlock {
    Set-Location $using:ScriptDir
    python main.py
}
Write-Host "Python service started (Job ID: $($PythonJob.Id))" -ForegroundColor Green

# Wait for services to start
Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    V_mach Services Status" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check service status
Write-Host "React Frontend Job: $($ReactJob.State)" -ForegroundColor $(if($ReactJob.State -eq "Running") {"Green"} else {"Red"})
Write-Host "API Server Job: $($ApiJob.State)" -ForegroundColor $(if($ApiJob.State -eq "Running") {"Green"} else {"Red"})
Write-Host "Python Backend Job: $($PythonJob.State)" -ForegroundColor $(if($PythonJob.State -eq "Running") {"Green"} else {"Red"})

Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "API Server: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""

# Open browser
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "V_mach is now running!" -ForegroundColor Green
Write-Host "Keep this PowerShell window open to maintain the services." -ForegroundColor Yellow
Write-Host ""

# Show job status
Write-Host "To check service status, run: Get-Job" -ForegroundColor Cyan
Write-Host "To stop services, run: Stop-Job -Id $($ReactJob.Id),$($ApiJob.Id),$($PythonJob.Id)" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit this script (services will continue running)"
