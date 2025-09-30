# Prompt Builder - Portable Dependencies Installer (PowerShell)
# Installs required dependencies for the portable build

Write-Host "[Portable Build] Installing dependencies..." -ForegroundColor Green
Write-Host ""
Write-Host "This will install Electron (~200MB download)" -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Recommended version: Node.js 20+" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing Electron..." -ForegroundColor Green
Write-Host ""

# Install Electron
npm install electron --save-dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install Electron!" -ForegroundColor Red
    Write-Host "Please check your internet connection." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run the application with:" -ForegroundColor Yellow
Write-Host "  .\start.bat" -ForegroundColor Yellow
Write-Host "  OR" -ForegroundColor Yellow
Write-Host "  .\start.ps1" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"