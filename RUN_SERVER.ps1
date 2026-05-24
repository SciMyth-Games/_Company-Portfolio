# Portfolio Website - Start Script (PowerShell)
# This script starts the web server for your portfolio

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗"
Write-Host "║  🎮 Games Portfolio - Web Server Launcher              ║"
Write-Host "╚════════════════════════════════════════════════════════╝"
Write-Host ""

# Change to portfolio directory
Set-Location "D:\_Company Portfolio"

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion"
} catch {
    Write-Host "❌ Python not found! Please install Python first."
    Write-Host ""
    Write-Host "Download from: https://www.python.org/downloads/"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting web server..."
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗"
Write-Host "║  📍 Open your browser and go to:                       ║"
Write-Host "║                                                        ║"
Write-Host "║     http://localhost:8080/                            ║"
Write-Host "║                                                        ║"
Write-Host "║  ✅ Server is running on port 8080                    ║"
Write-Host "║  ⏹️  Press Ctrl+C to stop the server                  ║"
Write-Host "╚════════════════════════════════════════════════════════╝"
Write-Host ""

# Start the HTTP server
python -m http.server 8080

# If server exits, pause to see message
Write-Host ""
Write-Host "Server has stopped."
Read-Host "Press Enter to exit"

