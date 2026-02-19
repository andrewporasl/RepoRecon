# RepoRecon

RepoRecon is a Next.js + FastAPI + Convex workspace for repository monitoring, AI-assisted analysis, and GitHub-authenticated sessions.

## Architecture

- Frontend: Next.js app (`/src/app`) on `http://localhost:3000`
- Backend API: FastAPI (`/backend/main.py`) on `http://localhost:8000`
- Convex: auth/data backend (`/convex`)
- Setup UI: `/setup` for local config editing

Auth and provider wiring:
- GitHub sign-in button: `src/components/UserMenu.tsx`
- Convex auth provider logic: `convex/auth.ts`
- Convex auth HTTP routes: `convex/http.ts`
- Convex auth domain mapping: `convex/auth.config.ts`
- Convex auth schema/indexes: `convex/schema.ts`

## Requirements

### macOS
- Node.js 20+
- npm 9+
- Python 3.10, 3.11, or 3.12
- Optional local AI: Ollama (`ollama serve`)

### Windows
- Node.js 20+
- npm 9+
- Python 3.10, 3.11, or 3.12 in PATH
- Optional local AI: Ollama (`ollama serve`)

## Quick Start (Clone to Running)

1. Clone:

```bash
git clone <your-repo-url>
cd RepoRecon
```

2. Bootstrap dependencies + `.env.local`:

```bash
npm run setup
```

3. Start everything:

```bash
npm run dev:all
```

4. Open:
- App: `http://localhost:3000`
- Setup: `http://localhost:3000/setup`
- Backend health: `http://localhost:8000/health`

Notes:
- `npm run dev:all` starts Next + FastAPI and starts Convex only if `CONVEX_DEPLOYMENT` exists.
- Windows helper script also works: `start-dev.bat`.

## macOS End-to-End (Manual)

```bash
git clone <your-repo-url>
cd RepoRecon
cp .env.example .env.local
npm install
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm run dev:all
```

## Windows End-to-End (Manual, PowerShell)

```powershell
git clone <your-repo-url>
cd RepoRecon
Copy-Item .env.example .env.local
npm install
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
npm run dev:all
```

If `py -3.12` is unavailable, use `py -3.11` or `py -3.10`.

## Configuration Model

Local config file:
- `.env.local` is the local source of truth.
- Do not commit `.env.local`.

You can configure values in either of these ways:
1. Edit `.env.local` directly.
2. Use `http://localhost:3000/setup` and click Save.

In `/setup`, keep `Also sync OAuth vars to Convex env` enabled so OAuth settings are pushed to Convex deployment automatically.

### Required for baseline functionality

```env
GITHUB_REPO=owner/repo
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
CONVEX_SITE_URL=https://<deployment>.convex.site
SITE_URL=http://localhost:3000
```

### GitHub API access (backend server-to-server)

```env
GITHUB_TOKEN=ghp_xxx
```

### GitHub OAuth (Sign in with GitHub)

```env
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

### AI provider selection

```env
AI_PROVIDER=auto
```

Provider-specific:

```env
# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3

# API provider
LLM_API_BASE_URL=https://api.openai.com/v1
LLM_API_MODEL=gpt-4o-mini
LLM_API_KEY=sk-...

# No-cost test mode
# AI_PROVIDER=mock
```

## GitHub OAuth Setup (Fixes Redirect/Login Breakage)

1. Ensure Convex is initialized:

```bash
npx convex dev --once
```

2. Read your Convex site URL from `.env.local` (`CONVEX_SITE_URL`).

3. In GitHub, create/update OAuth app:
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `https://<your-convex-deployment>.convex.site/api/auth/callback/github`

4. Configure Convex auth env vars:

```bash
npx convex env set AUTH_GITHUB_ID <your_client_id>
npx convex env set AUTH_GITHUB_SECRET <your_client_secret>
npx convex env set SITE_URL http://localhost:3000
```

5. Save the same values in `/setup` (or `.env.local`) for local consistency.
   - `/setup` can automatically sync `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and `SITE_URL` to Convex env.

6. Restart dev services:

```bash
npm run dev:all
```

Important:
- `GITHUB_TOKEN` and GitHub OAuth are different and both are needed.
- `GITHUB_TOKEN`: backend API calls to GitHub.
- OAuth keys: user sign-in flow via Convex Auth.

## AI Provider Behavior

- `auto`: try Ollama first, then API key provider.
- `ollama`: local-only.
- `api`: API-key-only.
- `mock`: deterministic test responses, no external calls.

If OpenAI returns `429 insufficient_quota`, the key is valid but billing/quota is unavailable.

## Troubleshooting

### `Unable to load backend config. Start the API server first.`
- Backend is not running. Start with `npm run dev:all`.

### `Invalid or missing NEXT_PUBLIC_CONVEX_URL`
- Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local` or `/setup`.
- Restart `npm run dev:all`.

### `Provided address was not an absolute URL`
- `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_SITE_URL`, or `LLM_API_BASE_URL` is malformed.
- Must be full `http://` or `https://` URLs.

### GitHub sign-in returns to localhost but not logged in
- Run `npx convex dev --once` to push latest schema/auth updates.
- Ensure OAuth callback URL matches `CONVEX_SITE_URL + /api/auth/callback/github` exactly.
- Ensure Convex env vars are set (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `SITE_URL`).

### `AI provider unavailable (both Ollama and API provider failed)`
- Start Ollama (`ollama serve`) or configure `LLM_API_KEY`.
- For no-cost verification, set `AI_PROVIDER=mock`.

## Security Defaults

- Keep secrets in `.env.local` and Convex env vars only.
- Never use `NEXT_PUBLIC_` for secrets.
- Rotate leaked keys immediately.
- Restrict `ALLOWED_ORIGINS` before production.
- Set `GITHUB_WEBHOOK_SECRET` for webhook signature verification.

## Useful Commands

```bash
npm run setup
npm run dev:all
npm run lint
npx convex dev --once
curl http://localhost:8000/health
```
