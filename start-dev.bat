@echo off
setlocal

if not exist .venv\Scripts\python.exe (
    echo [start-dev] Python virtual environment not found. Running npm run setup...
    call npm run setup
    if errorlevel 1 (
        echo [start-dev] Setup failed. Fix errors above, then retry.
        exit /b 1
    )
)

if not exist .env.local (
    echo [start-dev] .env.local not found. Creating from .env.example...
    copy .env.example .env.local > nul
)

echo [start-dev] Starting Next.js + FastAPI (+ Convex when configured)...
call npm run dev:all:windows
