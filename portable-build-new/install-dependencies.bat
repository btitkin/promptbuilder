@echo off
setlocal
cd /d "%~dp0"

echo [Portable Build] Instalacja zależności...
echo.

rem Sprawdź czy Node.js jest dostępny
where node >nul 2>nul
if errorlevel 1 (
    echo [BŁĄD] Node.js nie został znaleziony w PATH.
    echo Pobierz i zainstaluj Node.js z: https://nodejs.org/
    pause
    exit /b 1
)

rem Sprawdź czy npm jest dostępny
where npm >nul 2>nul
if errorlevel 1 (
    echo [BŁĄD] npm nie został znaleziony w PATH.
    echo Upewnij się, że Node.js został poprawnie zainstalowany.
    pause
    exit /b 1
)

echo Instalowanie zależności produkcyjnych...
npm install --production

if errorlevel 1 (
    echo.
    echo [BŁĄD] Instalacja zależności nie powiodła się.
    echo Sprawdź połączenie internetowe i spróbuj ponownie.
    pause
    exit /b 1
)

echo.
echo [OK] Zależności zostały zainstalowane pomyślnie!
echo Możesz teraz uruchomić aplikację używając start.bat lub start.ps1
pause
endlocal