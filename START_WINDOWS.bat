@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer, or run: python -m http.server 4173
  pause
  exit /b 1
)
node scripts\serve.mjs
pause
