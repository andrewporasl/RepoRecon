# Backend Quick Start

This guide starts FastAPI + Convex + Next.js with secure defaults.

## Prerequisites

- Node.js 20+
- npm 9+
- Python 3.10, 3.11, or 3.12
- Optional: Ollama (`ollama serve`) for local model inference

## 1. Install and bootstrap

```bash
git clone <your-repo-url>
cd RepoRecon
npm run setup
```

`npm run setup`:
- installs Node dependencies
- creates `.venv`
- installs Python dependencies
- creates `.env.local` from `.env.example` if missing

## 2. Configure local env

Edit `.env.local` or use `http://localhost:3000/setup`.
If you use `/setup`, leave OAuth sync enabled so Convex env gets updated automatically.

Minimum required:

```env
GITHUB_REPO=owner/repo
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
CONVEX_SITE_URL=https://<deployment>.convex.site
SITE_URL=http://localhost:3000
```

For GitHub API data:

```env
GITHUB_TOKEN=ghp_...
```

For GitHub OAuth sign-in:

```env
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

For AI provider:

```env
AI_PROVIDER=auto
```

## 3. Start services

```bash
npm run dev:all
```

Services:
- Next.js on `http://localhost:3000`
- FastAPI on `http://localhost:8000`
- Convex dev (if `CONVEX_DEPLOYMENT` is set)

## 4. Health checks

```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/terminal \
  -H "Content-Type: application/json" \
  -d '{"message":"status","provider":"mock"}'
```

## 5. OAuth correctness checks

1. Push Convex functions/schema:

```bash
npx convex dev --once
```

2. Ensure GitHub OAuth callback URL is:

```text
https://<your-convex-deployment>.convex.site/api/auth/callback/github
```

3. Ensure Convex env vars are present:

```bash
npx convex env set AUTH_GITHUB_ID <client_id>
npx convex env set AUTH_GITHUB_SECRET <client_secret>
npx convex env set SITE_URL http://localhost:3000
```

## Troubleshooting

- `Invalid or missing NEXT_PUBLIC_CONVEX_URL`: set it in `.env.local`, then restart.
- `AI provider unavailable`: run Ollama or set API key, or use `AI_PROVIDER=mock`.
- OpenAI `429 insufficient_quota`: valid key, but no usable quota/billing.
- GitHub auth callback fails: run `npx convex dev --once` to apply latest schema indexes.
