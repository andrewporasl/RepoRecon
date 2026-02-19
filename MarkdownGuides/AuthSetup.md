# GitHub Auth Setup (Convex)

This project uses Convex Auth + GitHub OAuth.

Code locations:
- Button click: `src/components/UserMenu.tsx`
- Provider config: `convex/auth.ts`
- Convex auth route registration: `convex/http.ts`
- Convex auth domain config: `convex/auth.config.ts`
- Required auth table/index definitions: `convex/schema.ts`

## 1. Prepare Convex deployment

```bash
npx convex dev --once
```

This pushes schema/functions, including required auth indexes.

## 2. Create GitHub OAuth App

GitHub -> Settings -> Developer settings -> OAuth Apps -> New OAuth App.

Use:
- Application name: `RepoRecon Dev`
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `https://<your-convex-deployment>.convex.site/api/auth/callback/github`

## 3. Set Convex auth env vars

```bash
npx convex env set AUTH_GITHUB_ID <github_client_id>
npx convex env set AUTH_GITHUB_SECRET <github_client_secret>
npx convex env set SITE_URL http://localhost:3000
```

## 4. Local `.env.local` alignment

Set these locally too (or save from `/setup`):

```env
CONVEX_SITE_URL=https://<your-convex-deployment>.convex.site
NEXT_PUBLIC_CONVEX_URL=https://<your-convex-deployment>.convex.cloud
SITE_URL=http://localhost:3000
AUTH_GITHUB_ID=<github_client_id>
AUTH_GITHUB_SECRET=<github_client_secret>
```

`/setup` can sync `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and `SITE_URL` to Convex env automatically when the sync checkbox is enabled.

## 5. Start and verify

```bash
npm run dev:all
```

Open `http://localhost:3000` and click **Sign in with GitHub**.

## Common failures

- Redirect to app root but no login:
  - callback URL mismatch
  - missing Convex env vars
  - stale schema (run `npx convex dev --once`)

- `redirect_uri_mismatch` on GitHub:
  - callback URL in GitHub OAuth app does not exactly match Convex callback URL.

- Convex callback errors referencing user email index:
  - deployment is running an older schema; push latest `convex/schema.ts`.
