@echo off
chcp 65001 >nul
echo ========================================
echo    V_mach Services Startup
echo ========================================
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo Current directory: %CD%
echo.

REM Check if package.json exists
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
start "V_mach React Frontend" cmd /k "npm run dev"

REM Wait a bit
timeout /t 5 /nobreak >nul

REM Start API Server
echo [2/3] Starting API Server (port 3001)...
start "V_mach API Server" cmd /k "npm run start:api"

REM Wait a bit
timeout /t 5 /nobreak >nul

REM Start Python Backend
echo [3/3] Starting Python Backend...
start "V_mach Python Backend" cmd /k "python main.py"

REM Wait for services to start
echo.
echo Waiting for services to start...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo    V_mach Services Status
echo ========================================
echo.

REM Check if ports are listening
netstat -an | findstr ":5173" >nul
if %errorlevel%==0 (
    echo ✓ React Frontend is running on port 5173
) else (
    echo ✗ React Frontend is NOT running
)

netstat -an | findstr ":3001" >nul
if %errorlevel%==0 (
    echo ✓ API Server is running on port 3001
) else (
    echo ✗ API Server is NOT running
)

echo.
echo Frontend: http://localhost:5173
echo API Server: http://localhost:3001
echo.

echo Opening browser...
start http://localhost:5173

echo.
echo V_mach is now running!
echo Keep the service windows open to maintain the services.
echo.
pause
