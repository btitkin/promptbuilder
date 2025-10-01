@echo off
setlocal
cd /d "%~dp0"
set "NODE_ENV=production"
echo [Portable Build] Launching Prompt Builder...

rem Check if models exist
if not exist "models\*.gguf" goto :NOMODELS
goto :AFTERMODELS

:NOMODELS
echo [NOTICE] No models (*.gguf) found in .\models\
echo          The app will start, but local LLM features may be unavailable.
echo          Copy your GGUF model files to: .\models\
echo          Expected model: Qwen2.5-7B-Instruct-Q4_K_M.gguf
timeout /t 3 >nul

:AFTERMODELS
rem Check for Electron
set "ELECTRON_PATH=node_modules\electron\dist\electron.exe"
if exist "%ELECTRON_PATH%" goto :LAUNCH

echo [ERROR] Electron not found at: %ELECTRON_PATH%
echo Please make sure npm install was run successfully.
pause
exit /b 1

:LAUNCH
echo [OK] Starting Prompt Builder...
start "" "%ELECTRON_PATH%" "%~dp0main.js"
endlocal
exit /b 0