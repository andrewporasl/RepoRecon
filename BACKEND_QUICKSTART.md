# Backend Quick Start Guide

This guide will get your FastAPI backend running in minutes.

## 1. One-Command Setup

```bash
bash setup-backend.sh
```

This script will:
- Create a Python virtual environment
- Install all dependencies from `requirements.txt`
- Create a `.env` file (you'll need to edit it with your credentials)

## 2. Configure Your Credentials

Edit `.env` with your GitHub token and SMEE URL:

```bash
nano .env
```

Required values:
```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx  # Your GitHub Personal Access Token
GITHUB_REPO=andrewporasl/RepoRecon
SMEE_URL=https://smee.io/your-channel-url
```

### Get Your GitHub Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select these scopes:
   - `repo` (full control)
   - `read:user`
4. Copy the token to `.env`

### Get Your SMEE URL

1. Go to [smee.io](https://smee.io)
2. Click "Start a new channel"
3. Copy the URL to `.env`

## 3. Run the Backend

### Terminal 1: Activate virtual environment and start FastAPI

```bash
source venv/bin/activate
python3 -m uvicorn backend.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Terminal 2: Start SMEE forwarding

```bash
smee -u https://smee.io/your-channel-url -t http://localhost:8000/webhooks/github
```

### Terminal 3: Start Next.js frontend (in the project root)

```bash
npm run dev
```

## 4. Verify It's Working

### Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "github_connected": true,
  "repo": "andrewporasl/RepoRecon"
}
```

### Check API Endpoints

```bash
# Get activity feed
curl http://localhost:8000/api/activity

# Get insights
curl http://localhost:8000/api/insights

# Test terminal (POST)
curl -X POST http://localhost:8000/api/terminal \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyze the repository"}'
```

### Access Frontend

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Activity Feed**: Should show real data from your GitHub repo
- **Agent Insights**: Shows code analysis insights
- **Terminal**: Interactive chat with the agent

## 5. Project Structure

```
backend/
├── __init__.py          # Package initialization
├── main.py              # FastAPI app and routes
├── models.py            # Pydantic data models
├── github_client.py     # GitHub API integration
└── webhook_handler.py   # SMEE webhook processing
```

## 6. API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/api/activity` | GET | Recent repository activity |
| `/api/insights` | GET | Code analysis insights |
| `/api/terminal` | POST | Agent message handler |
| `/webhooks/github` | POST | GitHub webhook receiver |

## 7. Troubleshooting

### `ModuleNotFoundError: No module named 'fastapi'`
- Make sure venv is activated: `source venv/bin/activate`
- Reinstall deps: `pip install -r requirements.txt`

### `401 Unauthorized` from GitHub API
- Check your `GITHUB_TOKEN` in `.env`
- Verify token hasn't expired

### SMEE not forwarding events
- Confirm webhook URL is correct in GitHub settings
- Check SMEE URL is correct in `.env`
- Restart SMEE client

### CORS errors in browser
- Backend is already configured for `http://localhost:3000`
- If using different port, edit `app.add_middleware` in `backend/main.py`

### Can't connect to http://localhost:8000
- Verify backend is running with `curl http://localhost:8000/`
- Check port 8000 isn't in use: `lsof -i :8000`

## 8. Next Steps

See `MarkdownGuides/Backend.md` for:
- Feature A & C integration code
- Detailed GitHub API setup
- SMEE webhook configuration
- Full API documentation

---

**Questions?** Check the main Backend.md guide or review the code comments.
