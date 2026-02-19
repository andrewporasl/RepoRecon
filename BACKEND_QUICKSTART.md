# Backend Quick Start Guide

This guide will get your FastAPI backend running in minutes.

## 1. Prerequisites: Ollama Setup

The AI terminal requires **Ollama** to be running locally.

1.  **Install Ollama**: Download from [ollama.com](https://ollama.com).
2.  **Start Service**: Run `ollama serve` in a terminal.
3.  **Pull Model**: Run `ollama pull llama3` to download the default model.

## 2. One-Command Setup

```bash
# This installs Python dependencies globally or in your current environment
pip install -r requirements.txt
```

## 3. Configure Your Credentials

Edit `.env` (created from `.env.example`) with your GitHub token:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx  # Your GitHub Personal Access Token
GITHUB_REPO=andrewporasl/RepoRecon
```

### Get Your GitHub Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select these scopes: `repo` (full control), `read:user`.

## 4. Run Everything (Recommended)

Instead of managing multiple terminals, use the unified dev command:

```bash
# Windows
.\start-dev.bat

# Manual
npm run dev:all
```

This will automatically start:
1.  **Frontend**: Next.js on `localhost:3000`
2.  **Backend**: FastAPI on `localhost:8000` (using your global Python)
3.  **Database**: Convex environment

---

## 5. Verify It's Working

### Check Backend Health
```bash
curl http://localhost:8000/health
```

### Check Terminal (AI Agent)
```bash
curl -X POST http://localhost:8000/api/terminal \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Strategist"}'
```

## 6. Project Structure

```
backend/
├── main.py              # FastAPI app, Ollama integration
├── github_client.py     # GitHub API integration
├── models.py            # Pydantic data models
└── webhook_handler.py   # Webhook processing logic
```

## 7. Troubleshooting

### `Ollama Connection Failed`
- Ensure `ollama serve` is running.
- Ensure you have run `ollama pull llama3`.

### `ModuleNotFoundError`
- Ensure you have run `pip install -r requirements.txt`.
- If using multiple Python versions, ensure `python` in your path matches the one where you installed dependencies.

### CORS Errors
- Backend is configured for `http://localhost:3000`. If running on a different port, update `allow_origins` in `backend/main.py`.

---

**Questions?** Check the main Backend.md guide or review the code comments.
