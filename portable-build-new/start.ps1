# Prompt Builder - Portable Launch Script
# PowerShell version of the launcher

Write-Host "[Portable Build] Uruchamianie Prompt Builder..." -ForegroundColor Green

# Ustaw katalog roboczy na lokalizacje skryptu
Set-Location $PSScriptRoot

# Ustaw srodowisko produkcyjne
$env:NODE_ENV = "production"

# Sprawdz czy istnieja modele
if (-not (Test-Path "models\*.gguf")) {
    Write-Host "[UWAGA] Nie znaleziono modeli (*.gguf) w .\models\" -ForegroundColor Yellow
    Write-Host "        Aplikacja uruchomi sie, ale funkcje lokalnego LLM moga byc niedostepne." -ForegroundColor Yellow
    Write-Host "        Skopiuj pliki modeli do: .\models\" -ForegroundColor Yellow
    Write-Host "        Zalecany model: Qwen2.5-7B-Instruct-Q4_K_M.gguf" -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Sprawdz czy istnieje Electron
$electronPath = "node_modules\electron\dist\electron.exe"
if (-not (Test-Path $electronPath)) {
    Write-Host "[BLAD] Nie znaleziono Electron w: $electronPath" -ForegroundColor Red
    Write-Host "Upewnij sie, ze npm install zostalo uruchomione pomyslnie." -ForegroundColor Red
    Write-Host ""
    Write-Host "Proba automatycznej instalacji zaleznosci..." -ForegroundColor Yellow
    
    try {
        npm install --production
        if (-not (Test-Path $electronPath)) {
            Write-Host "[BLAD] Electron nadal nie zostal znaleziony po instalacji." -ForegroundColor Red
            Read-Host "Nacisnij Enter aby zakonczyc"
            exit 1
        }
    }
    catch {
        Write-Host "[BLAD] Instalacja zaleznosci nie powiodla sie: $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Nacisnij Enter aby zakonczyc"
        exit 1
    }
}

Write-Host "[OK] Uruchamianie Prompt Builder..." -ForegroundColor Green

# Uruchom aplikacje
try {
    Start-Process -FilePath $electronPath -ArgumentList "main.js" -WorkingDirectory $PSScriptRoot
    Write-Host "[OK] Aplikacja zostala uruchomiona pomyslnie!" -ForegroundColor Green
}
catch {
    Write-Host "[BLAD] Nie udalo sie uruchomic aplikacji: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Nacisnij Enter aby zakonczyc"
    exit 1
}