@echo off
echo ============================================
echo   AI Language Chatbot - First Time Setup
echo ============================================
echo.

echo [1/3] Installing Python packages...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: pip install failed. Make sure Python is installed.
    pause
    exit /b 1
)

echo.
echo [2/3] Downloading language model...
python -m spacy download en_core_web_sm
if %errorlevel% neq 0 (
    echo ERROR: Could not download spaCy model.
    pause
    exit /b 1
)

echo.
echo [3/3] Checking for .env file...
if not exist .env (
    copy .env.example .env
    echo.
    echo  !! IMPORTANT: Open the .env file and paste your OpenRouter API key !!
    echo     Get a free key at: https://openrouter.ai/keys
    echo.
    pause
) else (
    echo .env file found. You are good to go!
)

echo.
echo Setup complete! Run start.bat to launch the app.
echo.
pause
