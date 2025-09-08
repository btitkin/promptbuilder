@echo off
cd /d "%~dp0"
set NODE_ENV=production
start "" node_modules\electron\dist\electron.exe main.js