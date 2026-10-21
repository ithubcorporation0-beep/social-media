# SocialHub AI — Final Launch Checklist & Known Limitations

## 1. Final Launch Checklist

| # | Item | Status | Verification Detail |
|---|------|--------|---------------------|
| 1 | **MVP Scope & Architecture** | ✅ Verified | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. Clean architecture with zero bloat. |
| 2 | **Security & Token Encryption** | ✅ Verified | AES-256-GCM encryption at rest with tamper-proof auth tags. Zero credentials in client bundles. |
| 3 | **Database & RLS Isolation** | ✅ Verified | 6 PostgreSQL tables with Supabase Row-Level Security (`auth.uid() = user_id`). |
| 4 | **AI Content Studio** | ✅ Verified | Google Gemini 2.0 Flash with local smart generator fallback. Supports English and Roman Urdu. |
| 5 | **LinkedIn Integration (Phase 1)** | ✅ Verified | Official OAuth 2.0 (`/api/auth/linkedin/authorize` & `callback`) and UGC Post publishing. |
| 6 | **Meta Integration (Phase 2)** | ✅ Verified | Meta Graph OAuth 2.0 (`/api/auth/meta/authorize` & `callback`) for Facebook & Instagram. |
| 7 | **Scheduling & Duplicate Prevention** | ✅ Verified | Backend queue (`/api/social/schedule`) with exclusive idempotency mutex locks. |
| 8 | **Job Search & Career Tracker** | ✅ Verified | Official Adzuna REST API v1 search + 6-stage Kanban pipeline + AI CV/Letter/DM tailoring. |
| 9 | **Analytics & Honest Reporting** | ✅ Verified | Zero fake metrics. Unpermitted endpoints marked UNAVAILABLE. CSV export with UTF-8 BOM. |
| 10 | **Production Security Headers** | ✅ Verified | HSTS, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), and Permissions-Policy active. |

---

## 2. Platform-by-Platform Known Limitations & Compliant Alternatives

Understanding official platform limitations is critical to preventing account bans and maintaining API compliance:

### 1. LinkedIn
- **Supported Actions**: Publishing text, links, and articles via the UGC Posts API (`/api/linkedin/v2/ugcPosts`) with `w_member_social`.
- **Known Limitations**:
  - Personal member posts cannot be edited via API once published (delete & repost only).
  - Rate limit is 25 posts/day for self-serve personal accounts.
  - Video and multi-image uploads require asynchronous 3-step asset registration (`assets?action=registerUpload`).
- **Compliant Alternative**: If media upload fails, the app safely publishes the text with the canonical destination link.

### 2. Indeed
- **Supported Actions**: Manual tracking, application status lifecycle, interview calendar reminders, and AI-tailored application asset drafting.
- **Strict Limitation**: Indeed **does NOT offer unrestricted public job search or auto-submission APIs**. Access is strictly gated for certified enterprise ATS (Applicant Tracking System) partners.
- **Compliance Rule**: **Never scrape Indeed or automate form submissions**. Doing so violates Indeed's Terms of Service and IP protections.
- **Compliant Alternative**: Users search via the official **Adzuna REST API** or save external job links into SocialHub AI. The app provides a direct "Apply on Official Site" link so the user reviews and submits manually.

### 3. Meta (Facebook Pages & Instagram Professional)
- **Supported Actions**: Publishing to Facebook Pages (`pages_manage_posts`) and Instagram Professional accounts (`instagram_content_publish`).
- **Known Limitations**:
  - Personal Facebook profiles **cannot** be automated via API (strictly against Meta policy; Pages only).
  - Instagram requires an Instagram Business or Creator account connected to a Facebook Page.
  - Publishing images to Instagram requires publicly accessible HTTPS URLs (localhost URLs cannot be fetched by Meta's CDN).
- **Compliant Alternative**: For local testing, SocialHub AI provides the verified sandbox handshake. For production, host media on Supabase Storage or Vercel Blob.

### 4. X (Twitter)
- **Supported Actions**: Publishing tweets via X API v2 (`tweet.write`).
- **Known Limitations**:
  - X Free Tier is strictly write-only with a cap of 500 tweets/month per app and strict rate limit windows (17 tweets/day).
  - Reading timelines, user followers, or mentions requires the $100/month Basic tier.
- **Compliant Alternative**: SocialHub AI tracks drafts locally and uses internal engagement tracking for unlinked metrics.

### 5. YouTube
- **Supported Actions**: Video uploads and metadata management via YouTube Data API v3 (`youtube.upload`).
- **Known Limitations**:
  - Default daily quota is 10,000 units. A single video upload consumes 1,600 units (roughly 6 uploads/day on the free tier).
  - Apps in developer testing mode can only upload private videos until Google Cloud OAuth verification is completed.

---

## 3. Security & Operational Maintenance

1. **Token Refresh Routine**:
   - LinkedIn and Meta access tokens are valid for 60 days.
   - Run a scheduled check every 30 days to notify users when an account `needs_reauth`.
2. **Secret Rotation**:
   - Never share `TOKEN_ENCRYPTION_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
   - If a secret is ever exposed, rotate it immediately in Vercel Project Settings.
3. **Database Backups**:
   - Enable Daily Automated Backups in your Supabase Project Settings -> Database -> Backups.
