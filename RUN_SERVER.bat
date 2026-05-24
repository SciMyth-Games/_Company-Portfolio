romyp@echo off
REM Portfolio Website - Start Script
REM This script starts the web server for your portfolio

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🎮 Games Portfolio - Web Server Launcher              ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Change to portfolio directory
cd /d "D:\_Company Portfolio"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python first.
    echo.
    echo Download from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✓ Python found
echo.
echo 🚀 Starting web server...
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  📍 Open your browser and go to:                       ║
echo ║                                                        ║
echo ║     http://localhost:8080/                            ║
echo ║                                                        ║
echo ║  ✅ Server is running on port 8080                    ║
echo ║  ⏹️  Press Ctrl+C to stop the server                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Start the HTTP server
python -m http.server 8080

REM If server exits, pause to see message
echo.
echo Server has stopped.
pause

