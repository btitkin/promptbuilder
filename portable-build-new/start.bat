@echo off
setlocal
cd /d "%~dp0"
set "NODE_ENV=production"
echo [Portable Build] Uruchamianie Prompt Builder...

rem Sprawdź czy istnieją modele
if not exist "models\*.gguf" goto :NOMODELS
goto :AFTERMODELS

:NOMODELS
echo [UWAGA] Nie znaleziono modeli (*.gguf) w .\models\
echo         Aplikacja uruchomi się, ale funkcje lokalnego LLM mogą być niedostępne.
echo         Skopiuj pliki modeli do: .\models\
echo         Zalecany model: Qwen2.5-7B-Instruct-Q4_K_M.gguf
timeout /t 3 >nul

:AFTERMODELS
rem Sprawdź czy istnieje Electron
set "ELECTRON_PATH=node_modules\electron\dist\electron.exe"
if exist "%ELECTRON_PATH%" goto :LAUNCH

echo [BŁĄD] Nie znaleziono Electron w: %ELECTRON_PATH%
echo Upewnij się, że npm install zostało uruchomione pomyślnie.
echo.
echo Próba automatycznej instalacji zależności...
call npm install --production
if errorlevel 1 (
    echo [BŁĄD] Instalacja zależności nie powiodła się.
    pause
    exit /b 1
)

if not exist "%ELECTRON_PATH%" (
    echo [BŁĄD] Electron nadal nie został znaleziony po instalacji.
    pause
    exit /b 1
)

:LAUNCH
echo [OK] Uruchamianie Prompt Builder...
start "" "%ELECTRON_PATH%" "%~dp0main.js"
endlocal
exit /b 0