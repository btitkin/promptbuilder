# Prompt Builder - Dependency Installation Script
# PowerShell version

Write-Host "[Portable Build] Instalacja zależności..." -ForegroundColor Green
Write-Host ""

# Ustaw katalog roboczy na lokalizację skryptu
Set-Location $PSScriptRoot

# Sprawdź czy Node.js jest dostępny
try {
    $nodeVersion = node --version
    Write-Host "Znaleziono Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "[BŁĄD] Node.js nie został znaleziony." -ForegroundColor Red
    Write-Host "Pobierz i zainstaluj Node.js z: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Naciśnij Enter aby zakończyć"
    exit 1
}

# Sprawdź czy npm jest dostępny
try {
    $npmVersion = npm --version
    Write-Host "Znaleziono npm: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "[BŁĄD] npm nie został znaleziony." -ForegroundColor Red
    Write-Host "Upewnij się, że Node.js został poprawnie zainstalowany." -ForegroundColor Yellow
    Read-Host "Naciśnij Enter aby zakończyć"
    exit 1
}

Write-Host ""
Write-Host "Instalowanie zależności produkcyjnych..." -ForegroundColor Yellow

try {
    npm install --production
    Write-Host ""
    Write-Host "[OK] Zależności zostały zainstalowane pomyślnie!" -ForegroundColor Green
    Write-Host "Możesz teraz uruchomić aplikację używając start.bat lub start.ps1" -ForegroundColor Cyan
}
catch {
    Write-Host ""
    Write-Host "[BŁĄD] Instalacja zależności nie powiodła się: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Sprawdź połączenie internetowe i spróbuj ponownie." -ForegroundColor Yellow
    Read-Host "Naciśnij Enter aby zakończyć"
    exit 1
}

Read-Host "Naciśnij Enter aby zakończyć"