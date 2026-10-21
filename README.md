# SocialHub AI — Multi-Platform Social Media & Job Tracker Dashboard

SocialHub AI is a clean, compliant SaaS web application built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS v4** to manage supported social media workflows and organize job-search activity from one secure dashboard.

---

## 1. Directory Structure

```text
SocialHub_AI/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/generate/route.ts          # Server-side AI text generation
│   │   │   ├── health/route.ts               # Security and vault health check
│   │   │   ├── jobs/search/route.ts          # Adzuna job search API handler
│   │   │   ├── jobs/tailor/route.ts          # AI CV & cover letter generator
│   │   │   └── settings/test-connection/     # Live API credential handshake
│   │   ├── globals.css                       # Dual Light/Dark CSS design tokens
│   │   ├── layout.tsx                        # Root layout with ThemeProvider & a11y
│   │   └── page.tsx                          # Main dashboard interactive shell
│   ├── components/
│   │   ├── analytics/AnalyticsReports.tsx    # Audited real-metric reporting & CSV export
│   │   ├── calendar/CalendarView.tsx         # Content timeline & planned schedule
│   │   ├── dashboard/                        # Sidebar, TopNav, Account Grid, Pipelines
│   │   ├── engagement/EngagementHub.tsx      # Comment monitor & suggested reply approval
│   │   ├── jobs/JobTracker.tsx               # Adzuna search & 6-stage Kanban board
│   │   ├── navigation/CommandPalette.tsx     # Ctrl+K global keyboard command hub
│   │   ├── publishing/                       # Previews, editor, & publish confirmation
│   │   ├── security/SecurityCenter.tsx       # Live security audit & SQL schema copy
│   │   ├── settings/AiProviderSettings.tsx   # Gemini, Groq, & OpenAI key configuration
│   │   └── theme/ThemeProvider.tsx           # Persistent White & Dark theme context
│   ├── data/mockDashboardData.ts             # Realistic sandbox demo data
│   ├── lib/security/                         # AES-256-GCM token vault & input validators
│   └── types/dashboard.ts                    # TypeScript contracts & data interfaces
├── supabase/migrations/
│   └── 001_initial_schema.sql                # Complete PostgreSQL schema with RLS policies
├── .env.example                              # Safe placeholder environment template
├── .gitignore                                # Prevents accidental secret or build commits
├── package.json                              # Dependencies (Next.js 16, React 19, Lucide)
└── README.md                                 # Beginner-friendly setup guide
```

---

## 2. Tools & Accounts Required

All required tools operate within **100% free developer tiers**:

1. **Node.js (v20+ Recommended)**: Installed locally on your development machine.
2. **Git**: Installed for safe version control.
3. **GitHub Account**: To host your private repository and connect continuous deployment.
4. **Supabase Account** ([supabase.com](https://supabase.com)): Free PostgreSQL database, authentication, and Row Level Security (RLS).
5. **Google AI Studio Account** ([aistudio.google.com](https://aistudio.google.com)): Free API key for Gemini 2.0 Flash models.
6. **LinkedIn Developer Portal** ([linkedin.com/developers](https://www.linkedin.com/developers)): Self-serve developer application for the Share API v2 (`w_member_social`).
7. **Adzuna Developer Account** ([developer.adzuna.com](https://developer.adzuna.com)): Free API credentials for real job searches.

---

## 3. Safe Git Setup

The project is initialized with safety guardrails:
- `.env*` files containing real secrets are strictly ignored by `.gitignore`.
- Only `.env.example` containing non-secret placeholder values is committed to Git.

Safe commands for inspecting and saving changes:
```bash
# Check modified files
git status

# Review exact changes
git diff

# Stage all approved changes
git add .

# Save a commit checkpoint
git commit -m "Your descriptive commit message"
```

---

## 4. Local Environment Setup

1. Copy the safe template to create your local private configuration:
   ```bash
   cp .env.example .env.local
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env.local`)*

2. Open `.env.local` in your editor and insert your private API keys. Remember: **Never commit `.env.local` to Git.**

---

## 5. Running the Application Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- Press **`Ctrl+K`** (or **`Cmd+K`**) anywhere to open the **Command Palette**.
- Click the **Sun/Moon icon** in the top navigation to switch between Crisp White and Dark-Neutral themes.
- Test the system security health endpoint at [http://localhost:3000/api/health](http://localhost:3000/api/health).
