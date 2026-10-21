# SocialHub AI — Production Deployment Guide

This guide walks you through deploying SocialHub AI to **Vercel** with full production security, database connectivity, and official OAuth 2.0 redirect URLs.

---

## 1. Quick Deployment to Vercel (Recommended)

Vercel is the native cloud platform for Next.js and offers a generous free tier suitable for SocialHub AI.

### Option A: Via GitHub (Recommended for Beginners)
1. Push your local Git repository to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/socialhub-ai.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository `socialhub-ai`.
4. Framework Preset will be automatically detected as **Next.js**.
5. In the **Environment Variables** section, copy the required keys from Section 2 below.
6. Click **Deploy**.

### Option B: Via Vercel CLI
1. In your terminal, run:
   ```bash
   npx vercel
   ```
2. Follow the interactive prompts to link your project and deploy.

---

## 2. Production Environment Variables Checklist

Configure these variables in **Vercel Project Settings -> Environment Variables**:

| Variable Name | Environment | Description |
|---------------|-------------|-------------|
| `NEXT_PUBLIC_APP_URL` | Production | Your live Vercel URL (e.g. `https://socialhub-ai.vercel.app`) |
| `TOKEN_ENCRYPTION_KEY` | Production | A secure 32+ character random string for AES-256-GCM vault |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Your Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (Secret) | Supabase private service role key |
| `GEMINI_API_KEY` | Production (Secret) | Google Gemini API key from AI Studio |
| `GROQ_API_KEY` | Production (Secret) | Groq Cloud API key (optional fallback) |
| `OPENAI_API_KEY` | Production (Secret) | OpenAI API key (optional fallback) |
| `ADZUNA_APP_ID` | Production | Adzuna job search App ID |
| `ADZUNA_APP_KEY` | Production (Secret) | Adzuna job search App Key |
| `LINKEDIN_CLIENT_ID` | Production | LinkedIn Developer App Client ID |
| `LINKEDIN_CLIENT_SECRET` | Production (Secret) | LinkedIn Developer App Client Secret |
| `META_APP_ID` | Production | Meta for Developers App ID |
| `META_APP_SECRET` | Production (Secret) | Meta for Developers App Secret |

> [!IMPORTANT]
> Never prefix server secrets (`TOKEN_ENCRYPTION_KEY`, `LINKEDIN_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) with `NEXT_PUBLIC_`. This ensures they are never bundled into client-side JavaScript.

---

## 3. Updating Developer Portals with Production Redirect URIs

Once your Vercel URL is live (e.g., `https://socialhub-ai.vercel.app`), update your developer apps:

### 1. LinkedIn Developer Portal
1. Open [LinkedIn Developers](https://www.linkedin.com/developers) -> Your App.
2. Go to **Auth** tab -> **OAuth 2.0 settings**.
3. Under **Authorized redirect URLs for your app**, add:
   ```
   https://socialhub-ai.vercel.app/api/auth/linkedin/callback
   ```
4. Click **Update**.

### 2. Meta for Developers (Facebook & Instagram)
1. Open [Meta for Developers](https://developers.facebook.com) -> Your App.
2. Under **Facebook Login** -> **Settings**:
3. Add to **Valid OAuth Redirect URIs**:
   ```
   https://socialhub-ai.vercel.app/api/auth/meta/callback
   ```
4. Save changes.

### 3. Supabase Authentication
1. In your [Supabase Dashboard](https://supabase.com/dashboard) -> **Authentication** -> **URL Configuration**.
2. Set **Site URL** to:
   ```
   https://socialhub-ai.vercel.app
   ```
3. Add `https://socialhub-ai.vercel.app/**` to **Redirect URLs**.

---

## 4. Production Smoke Test Verification

After deploying, perform these quick checks:
1. **Health Check**: Open `https://socialhub-ai.vercel.app/api/health` and verify `"status": "healthy"`.
2. **Security Headers**: Inspect HTTP headers using curl or browser DevTools:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Strict-Transport-Security: max-age=...`
3. **LinkedIn OAuth**: Click **Connect Account** on LinkedIn and execute the live handshake.
4. **Publish Post**: Publish a test post and confirm generation of the live external receipt URN.
