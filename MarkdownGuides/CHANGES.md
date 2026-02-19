# Changes Made

## Setup and developer workflow

- Added cross-platform bootstrap script: `scripts/setup.mjs`.
- Added cross-platform all-services script: `scripts/dev-all.mjs`.
- Added npm scripts:
  - `npm run setup`
  - `npm run dev:all`
  - `npm run dev:all:mac`
  - `npm run dev:all:windows`
- Updated Windows starter script `start-dev.bat` to use `.venv` + `.env.local` flow.

## Environment model

- Standardized local configuration on `.env.local`.
- Backend now loads `.env.local` first and `.env` as fallback.
- Setup page persists only changed keys to avoid wiping existing values.
- Added URL validation for critical config fields.

## Setup UI

- Added `/setup` page (`src/app/setup/page.tsx`) to configure:
  - GitHub repo/token
  - AI provider settings (auto/ollama/api/mock)
  - Convex URL settings
  - OAuth credentials
  - CORS/webhook settings
- Added readiness diagnostics panel driven by backend checks.
- Added optional automatic Convex env sync for OAuth vars (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `SITE_URL`).

## Backend config APIs

- Added `GET /api/config`.
- Added `POST /api/config`.
- Added `GET /api/config/diagnostics`.
- Added `POST /api/config/sync-convex-auth`.

## AI provider routing and resiliency

- Added provider routing in backend for:
  - `ollama`
  - `api`
  - `mock`
  - `auto` fallback mode
- Added explicit timeout/network/auth/quota error handling and clearer terminal responses.
- Added mock provider for no-cost end-to-end testing.

## Convex/client runtime safety

- Added defensive Convex URL validation in `src/app/ConvexClientProvider.tsx`.
- Prevented UI crashes when `NEXT_PUBLIC_CONVEX_URL` is missing.
- Hid auth-dependent UI elements when Convex client is not configured.

## GitHub OAuth reliability fixes

- Fixed Convex auth schema override in `convex/schema.ts` by restoring required auth indexes:
  - `users.email`
  - `users.phone`
- Improved `convex/auth.config.ts` to resolve Convex site domain from multiple env sources and normalize `.convex.cloud` -> `.convex.site` when needed.
- Updated OAuth docs and setup guidance to include Convex env configuration and exact callback URL.

## Security improvements

- Tightened CORS handling with configured allowed origins.
- Added webhook signature verification support with `GITHUB_WEBHOOK_SECRET`.
- Kept secrets server-side only (no secret values returned in config API).
- Added safer GitHub client request behavior and timeout handling.

## Documentation refresh

- Rewrote `README.md` with full clone-to-running instructions for macOS and Windows.
- Updated `BACKEND_QUICKSTART.md` to match current setup architecture.
- Rewrote `MarkdownGuides/AuthSetup.md` with exact GitHub OAuth + Convex steps.
