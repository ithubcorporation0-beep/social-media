# SocialHub AI — Master Project Guide for a Beginner Vibe Coder

## How to use this file

I am a beginner vibe coder. I mainly copy and paste prompts into an AI coding tool. I need clear instructions, one step at a time, and I do not want to be expected to write code manually.

**My rule:** Give me one implementation step at a time. Do not move forward until I confirm the current step works.

## 1. Project overview

**Working name:** SocialHub AI

Build a professional, secure web application that helps a user manage supported social media workflows and organize job-search activity from one dashboard.

The product should prioritize a working, tested minimum viable product (MVP) before attempting every integration.

### Main goals

- Create and manage social media content from one dashboard.
- Generate platform-specific captions, post ideas, hashtags, and drafts with AI.
- Connect supported accounts using official APIs and OAuth.
- Publish or schedule posts only where official API access permits it.
- Track drafts, scheduled posts, and publishing history.
- Organize job listings and applications in a job tracker.
- Generate CV summaries, cover-letter drafts, and recruiter-message drafts.
- Show analytics only when reliable data is available.
- Keep user accounts, credentials, and data secure.

## 2. Platforms to consider

Investigate these platforms, but **do not assume every feature is available**:

1. Facebook Pages
2. Instagram Professional Accounts
3. LinkedIn profiles and company pages
4. Indeed
5. YouTube
6. TikTok
7. X (Twitter)
8. Other platforms with suitable official APIs

For each platform, verify its current official API documentation, access requirements, supported actions, review process, account eligibility, rate limits, and costs before implementation.

If an API does not support a requested feature, explain the limitation and offer a compliant alternative such as a draft, reminder, tracking link, or manual workflow.

Do not scrape sites, bypass restrictions, or automate actions in ways that violate platform rules.

## 3. Core features

### A. Dashboard
- Responsive dashboard with a sidebar and top navigation.
- Account connection status.
- Drafts, scheduled content, recent publishing activity, and notifications.
- Search, filters, helpful empty states, and clear error messages.
- Real analytics only; never use fabricated numbers.

### B. AI content studio
- Generate captions, hooks, hashtags, post ideas, and descriptions.
- Tailor content to the selected platform.
- Offer professional, casual, business, and personal writing styles.
- Support English and Roman Urdu.
- Let users edit and approve drafts before publishing.
- Allow image/video attachments only where the target platform and integration support them.

### C. Publishing and calendar
- Create, edit, save, and preview drafts.
- Calendar views for planned content.
- Schedule or publish only through supported official API capabilities.
- Show clear publishing status, timestamps, and error details.
- Prevent duplicate publishing jobs.
- Require user confirmation for external actions.

### D. Engagement
- Show comments, messages, and interactions only where the connected API and permissions support them.
- Generate suggested replies.
- Require approval before sending replies unless a compliant, explicitly enabled workflow allows otherwise.

### E. Job search and application tracker
- Search listings only through authorized APIs or permitted integrations.
- Save job links, company, role, location, deadline, and status.
- Track applications, follow-ups, and interview dates.
- Draft tailored CV summaries, cover letters, and recruiter messages.
- Open official job pages for the user to review and apply.
- Do not automatically submit applications or send messages without explicit user approval and an authorized method.
- Do not assume Indeed offers unrestricted public API access; verify current official access rules first.

### F. Analytics and reports
- Display available reach, impressions, clicks, engagement, and follower metrics only when supplied by an authorized source.
- Provide date filters and simple reports.
- Export CSV/PDF only if practical.
- Clearly label unavailable metrics.

### G. AI provider settings
Support configuration for:
- Google Gemini
- OpenAI
- Groq

Settings should include:
- Secure API-key entry.
- Default provider and supported model selection.
- Connection test.
- Helpful error messages.
- Server-side secret handling.

Never put real API keys in frontend code, source control, public logs, or client-side bundles. Use environment variables or secure server-side encrypted storage as appropriate.

## 4. Suggested technology stack

Evaluate this beginner-friendly stack and explain any changes before implementation:

- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS and a consistent component library
- Backend: Next.js server-side routes or a suitable backend service
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- File storage: Supabase Storage or an appropriate alternative
- Hosting: Vercel
- Scheduled/background tasks: a reliable supported scheduler or queue
- Integrations: official APIs and OAuth 2.0 where required
- Monitoring: secure error logging and integration health checks

Prefer free or low-cost services where practical. Explain limits and likely costs before relying on a paid service.

## 5. Security requirements

- Use secure authentication and authorization.
- Apply Supabase Row Level Security (RLS) or equivalent access controls.
- Ensure users can access only their own authorized data.
- Keep OAuth tokens and API secrets on the server.
- Use token refresh flows when supported.
- Validate user input and uploaded files.
- Handle rate limits, expired tokens, and temporary API errors safely.
- Do not log secrets or sensitive personal data.
- Do not expose private data in client responses.
- Never claim an integration is working until it has been tested.
- Use placeholder credentials during development.
- Never ask me to paste real secrets into public chat or commit them to Git.

## 6. Design requirements

Create a clean, premium SaaS interface:

- White and dark-neutral theme.
- Professional sidebar and top navigation.
- Responsive desktop, tablet, and mobile layouts.
- Consistent typography, spacing, icons, and buttons.
- Clear loading, empty, success, and error states.
- Accessible contrast and keyboard navigation.
- No cartoonish graphics, clutter, or fake analytics.

## 7. Required development roadmap

The AI coding assistant must adjust this order if technical dependencies require it, and explain why.

### Step 1 — Plan and verify
- Confirm MVP scope.
- Check current official API feasibility and restrictions.
- Produce the architecture and API requirements checklist.
- Identify the first integration to implement.
- Do not build the whole app yet.

### Step 2 — Project setup
- Create the project structure and initial application.
- Explain exactly which tools/accounts I need.
- Set up Git safely.
- Add an example environment file with placeholder values only.

### Step 3 — Dashboard UI
- Build the responsive shell, sidebar, navigation, and initial pages.
- Use realistic placeholder content only where clearly labeled as demo data.
- Do not pretend demo data is real connected-account data.

### Step 4 — Authentication and database
- Implement sign-in/sign-up and user profiles.
- Create the required database schema.
- Apply and test row-level access policies.
- Explain how I can verify that users cannot access each other's records.

### Step 5 — AI content studio
- Add provider settings for Gemini, OpenAI, and Groq.
- Implement server-side AI requests and safe error handling.
- Test with placeholders and then my own secrets entered privately in local environment settings.

### Step 6 — First official platform integration
- Choose one platform based on API feasibility and the access I can obtain.
- Implement its official OAuth flow and the smallest useful feature.
- Test connection, permissions, token storage, and error handling.
- Do not proceed until the integration is verified.

### Step 7 — Content drafts and calendar
- Add draft management, previews, calendar, and scheduling where supported.
- Prevent duplicate jobs and show publishing status.
- Require confirmation before publishing.

### Step 8 — Additional integrations and job tracker
- Add further integrations one by one after checking access requirements.
- Build job tracking, saved job links, application statuses, and draft generation.
- Use manual workflows where an official API is unavailable.

### Step 9 — Analytics, testing, and hardening
- Add available metrics and reports.
- Test mobile responsiveness, authorization, errors, API limits, and performance.
- Fix issues before adding more features.

### Step 10 — Deployment
- Deploy to Vercel or another justified host.
- Configure production environment variables and redirect URLs.
- Verify production security, authentication, and integrations.
- Provide a final launch checklist and known limitations.

## 8. Exact format required for every step

For every step, respond using this format:

1. **Goal:** Explain in simple words what we are building.
2. **What I need:** List any accounts, tools, or permissions required.
3. **Copy-paste prompt:** Give me one complete prompt for my coding tool.
4. **Where to paste it:** Tell me which tool or screen to use.
5. **Expected result:** Describe what I should see when it finishes.
6. **How to test:** Give numbered, beginner-friendly instructions.
7. **If it fails:** Ask me for the exact error or relevant logs and provide a targeted repair prompt.
8. **Git checkpoint:** Give safe commands to inspect and commit changes. Never overwrite uncommitted work or push secrets.
9. **Completion checklist:** Let me verify that the step is complete.
10. **Stop and wait:** Do not provide the next implementation step until I confirm this one works.

Assume I do not know where files belong, how environment variables work, or how to debug code. Explain these briefly when relevant, without overwhelming me.

## 9. Git safety

Before making changes:
- Inspect the current repository and existing files.
- Check `git status`.
- Do not overwrite existing work without explaining the impact.
- Do not delete or rewrite large parts of the project unnecessarily.
- Keep each step small enough to review.

After a successful step, guide me through reviewing the changes and committing them. Example commands, when appropriate:

```bash
git status
git diff
git add .
git commit -m "Complete step N"
```

If Git is not initialized, explain how to initialize it. Do not push to a remote repository unless I explicitly request it and it is configured safely.

## 10. Rules for the AI coding assistant

- Do not generate the entire codebase in one response.
- Do not assume I can write code manually.
- Give me copy-paste-ready prompts and exact actions.
- Inspect existing files before editing.
- Implement only the current step.
- Preserve working features.
- Do not silently replace the stack or introduce unnecessary services.
- Do not invent API access, credentials, metrics, or approval status.
- Explain when a feature needs platform review or special account eligibility.
- Separate completed features from planned features.
- Prefer a working MVP over a large, unfinished application.
- When I share an error, troubleshoot that specific error instead of restarting the project.
- Keep a concise progress summary that records completed steps, decisions, blockers, and the next step.

## 11. First response requested

Read this document and begin with planning only.

Give me:
1. A short architecture explanation.
2. A platform-by-platform API feasibility table, with uncertainty clearly identified.
3. A checklist of developer accounts, API credentials, permissions, and possible reviews.
4. A realistic cost overview that distinguishes free tiers from paid usage.
5. The complete, copy-paste-ready **Step 1 prompt**.

Do not write the application code yet. Make the response beginner-friendly and practical. I will copy the Step 1 prompt into my coding tool and return with the result.
