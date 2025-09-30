@echo off
setlocal
cd /d "%~dp0"

echo [Portable Build] Installing dependencies...
echo.
echo This will install Electron (~200MB download)
echo.

rem Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: Node.js 20+
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

echo Installing Electron...
echo.

npm install electron --save-dev

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Electron!
    echo Please check your internet connection.
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencies installed successfully!
echo.
echo You can now run the application with:
echo   start.bat
echo   OR
echo   start.ps1
echo.
pause
endlocal
exit /b 0