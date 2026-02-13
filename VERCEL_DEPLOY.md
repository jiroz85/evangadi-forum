# Vercel Deployment Fix for 404 on /api/auth/login

## The Problem
The API returns 404 because either:
1. **Root Directory** is set to `frontend`, so the root `api/` folder is never deployed, OR
2. The `api` folder isn't included in the build

## Solution: Set Root Directory to Repo Root

1. Go to [Vercel Dashboard](https://vercel.com) → Your project **evangadi-forum-beige**
2. **Settings** → **General** → **Root Directory**
3. Set to **`.`** (period) or leave **empty** — this uses the full repo
4. Click **Save**
5. **Redeploy** (Deployments → ⋮ on latest → Redeploy)

## Verify

After redeploying, test:
- **https://evangadi-forum-beige.vercel.app/api/hello** — should return `{"message":"API is working"}`
- **https://evangadi-forum-beige.vercel.app/api/auth/login** — POST with `{email, password}` should return 401/200, not 404

## Required Environment Variables

In Vercel → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| SUPABASE_URL | Your Supabase project URL |
| SUPABASE_ANON_KEY | Your Supabase anon key |
| JWT_SECRET | A random secret string |

## If Root Directory Must Stay "frontend"

Then the `frontend/api/` folder is used. Ensure:
1. All files in `frontend/api/` are committed and pushed
2. `frontend/vercel.json` includes the api build (it does)
3. Redeploy after pushing
