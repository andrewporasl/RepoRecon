@echo off

REM Only copy .env if it doesn't exist
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env > nul
    echo [WARNING] Please update .env with your GITHUB_TOKEN and SMEE_URL!
)

echo Starting all services with global Python...
npm run dev:all
