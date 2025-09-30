# Prompt Builder - Portable Launch Script (PowerShell)
# PowerShell version of the launcher

Write-Host "[Portable Build] Launching Prompt Builder..." -ForegroundColor Green
Write-Host ""

# Set working directory to script location
Set-Location $PSScriptRoot

# Set production environment
$env:NODE_ENV = "production"

# Check if models exist
if (-not (Test-Path "models\*.gguf")) {
    Write-Host "[NOTICE] No models (*.gguf) found in .\models\" -ForegroundColor Yellow
    Write-Host "         The app will start, but local LLM features may be unavailable." -ForegroundColor Yellow
    Write-Host "         Copy your model files to: .\models\" -ForegroundColor Yellow
    Write-Host "         Recommended model: Qwen2.5-7B-Instruct-Q4_K_M.gguf" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 3
}

# Check for Electron
$electronPath = "node_modules\electron\dist\electron.exe"
if (-not (Test-Path $electronPath)) {
    Write-Host "[ERROR] Electron not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run the installation script first:" -ForegroundColor Yellow
    Write-Host "  1. Run: install-dependencies.bat" -ForegroundColor Yellow
    Write-Host "  2. Or open PowerShell and run: .\install-dependencies.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will download and install Electron (~200MB)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Starting Prompt Builder..." -ForegroundColor Green
Write-Host ""

# Start the application
Start-Process -FilePath $electronPath -ArgumentList "main.js" -WorkingDirectory $PWD

Write-Host "Application started successfully!" -ForegroundColor Green
Write-Host "You can close this window." -ForegroundColor Green