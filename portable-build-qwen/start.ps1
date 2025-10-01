# PowerShell version of start script
Set-Location $PSScriptRoot
$env:NODE_ENV = "production"
Write-Host "[Portable Build] Launching Prompt Builder..." -ForegroundColor Green

# Check if models exist
if (-not (Test-Path "models\*.gguf")) {
    Write-Host "[NOTICE] No models (*.gguf) found in .\models\" -ForegroundColor Yellow
    Write-Host "         The app will start, but local LLM features may be unavailable." -ForegroundColor Yellow
    Write-Host "         Copy your GGUF model files to: .\models\" -ForegroundColor Yellow
    Write-Host "         Expected model: Qwen2.5-7B-Instruct-Q4_K_M.gguf" -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Check for Electron
$electronPath = "node_modules\electron\dist\electron.exe"
if (Test-Path $electronPath) {
    Write-Host "[OK] Starting Prompt Builder..." -ForegroundColor Green
    Start-Process -FilePath $electronPath -ArgumentList "main.js"
} else {
    Write-Host "[ERROR] Electron not found at: $electronPath" -ForegroundColor Red
    Write-Host "Please make sure npm install was run successfully." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}