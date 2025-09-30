@echo off
setlocal
cd /d "%~dp0"
set "NODE_ENV=production"
echo [Portable Build] Launching Prompt Builder...
echo.

rem Check if models exist
if not exist "models\*.gguf" goto :NOMODELS
goto :AFTERMODELS

:NOMODELS
echo [NOTICE] No models (*.gguf) found in .\models\
echo          The app will start, but local LLM features may be unavailable.
echo          Copy your model files to: .\models\
echo          Recommended model: Qwen2.5-7B-Instruct-Q4_K_M.gguf
echo.
timeout /t 3 >nul

:AFTERMODELS
rem Check for Electron
set "ELECTRON_PATH=node_modules\electron\dist\electron.exe"
if exist "%ELECTRON_PATH%" goto :LAUNCH

echo [ERROR] Electron not found!
echo.
echo Please run the installation script first:
echo   1. Run: install-dependencies.bat
echo   2. Or open PowerShell and run: .\install-dependencies.ps1
echo.
echo This will download and install Electron (~200MB)
echo.
pause
exit /b 1

:LAUNCH
echo [OK] Starting Prompt Builder...
echo.
start "" "%ELECTRON_PATH%" "%~dp0main.js"
echo Application started successfully!
echo You can close this window.
endlocal
exit /b 0