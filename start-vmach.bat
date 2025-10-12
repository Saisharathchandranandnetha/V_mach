@echo off
echo Starting V_mach Application...
echo.

REM Navigate to the correct directory
cd /d "%~dp0"

echo Current directory: %CD%
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

echo Starting React Development Server...
start "V_mach Frontend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo Starting API Server...
start "V_mach API" cmd /k "npm run start:api"

timeout /t 3 /nobreak >nul

echo Starting Python Backend...
start "V_mach Python" cmd /k "python main.py"

echo.
echo V_mach services are starting...
echo.
echo Frontend: http://localhost:5173
echo API Server: http://localhost:3001
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo Application opened in browser!
echo Keep this window open to monitor the services.
pause
