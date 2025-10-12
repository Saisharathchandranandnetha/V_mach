@echo off
echo ========================================
echo    V_mach Application Startup
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

echo Current directory: %CD%
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please make sure you're in the V_mach directory.
    pause
    exit /b 1
)

echo Starting V_mach services...
echo.

REM Start React Development Server
echo [1/3] Starting React Frontend (port 5173)...
start "V_mach Frontend" cmd /k "npm run dev"

REM Wait a bit
timeout /t 5 /nobreak >nul

REM Start API Server
echo [2/3] Starting API Server (port 3001)...
start "V_mach API" cmd /k "npm run start:api"

REM Wait a bit
timeout /t 5 /nobreak >nul

REM Start Python Backend
echo [3/3] Starting Python Backend...
start "V_mach Python" cmd /k "python main.py"

REM Wait for services to start
echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo    V_mach is now running!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo API Server: http://localhost:3001
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo Services are running in separate windows.
echo Keep those windows open to maintain the services.
echo.
pause


