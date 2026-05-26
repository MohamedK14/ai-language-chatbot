@echo off
echo ============================================
echo   AI Language Chatbot - Starting...
echo ============================================
echo.

if not exist .env (
    echo ERROR: .env file not found.
    echo Please run setup.bat first.
    pause
    exit /b 1
)

echo Starting server... (this window must stay open)
echo.
echo The app will open in your browser automatically.
echo To stop the app, close this window.
echo.

start "" "index.html"
python app.py
