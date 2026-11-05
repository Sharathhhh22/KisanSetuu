@echo off
title Kisan Setu - Agricultural Platform
color 0A
echo ======================================================================
echo           KISAN SETU (ಕಿಸಾನ್ ಸೇತು / किसान सेतु)
echo        Unified Digital Agricultural Platform for Indian Farmers
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python environment...
python --version
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo.
echo [2/3] Checking and building frontend assets...
if not exist "frontend\dist\index.html" (
    echo Building frontend for production...
    cd frontend
    call npm.cmd install
    call npm.cmd run build
    cd ..
) else (
    echo Frontend build found in frontend\dist.
)

echo.
echo [3/3] Starting Kisan Setu Application Server on http://localhost:8000 ...
echo Press Ctrl+C to stop the server anytime.
echo.

start "" http://localhost:8000

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
