# Authentication Setup Guide

To enable "Sign in with GitHub", you must configure a GitHub OAuth App and add the credentials to your Convex Dashboard.

## 1. Create GitHub OAuth App
1. Go to **GitHub Settings** > **Developer settings** > **OAuth Apps**.
2. Click **New OAuth App**.
3. Fill in the details:
   - **Application Name**: `RepoRecon Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://grand-lemur-987.convex.site/api/auth/callback/github`
     *(Note: Replace `grand-lemur-987` with your actual deployment name from `.env.local` if different)*

4. Click **Register application**.
5. Copy the **Client ID**.
6. Generate a new **Client Secret** and copy it.

## 2. Configure Convex Dashboard
Run the following commands in your terminal to set the secrets for your dev environment:

```bash
# Replace with your actual Client ID
npx convex env set AUTH_GITHUB_ID "your_client_id_here"

# Replace with your actual Client Secret
npx convex env set AUTH_GITHUB_SECRET "your_client_secret_here"

# Set the Site URL for redirection (Required)
npx convex env set SITE_URL "http://localhost:3000"
```

## 3. Restart Development Server
After setting the environment variables, restart your dev server:
```bash
# Stop the current terminal (Ctrl+C)
.\start-dev.bat
```

## Troubleshooting
- If you see a "redirect_uri_mismatch" error, double-check that your **Authorization callback URL** in GitHub matches exactly what Convex expects.
- You can find your exact Callback URL in the Convex Dashboard under **Settings**.
