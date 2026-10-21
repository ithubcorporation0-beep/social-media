-- ====================================================================
-- SocialHub AI — Complete PostgreSQL Schema with Row-Level Security (RLS)
-- Migration 001: Initial Schema, Encrypted Token Vaults, and RLS Policies
-- ====================================================================

-- 1. Enable Cryptographic & UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. Profiles Table (Mirrors Supabase Auth Users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  default_ai_provider TEXT DEFAULT 'gemini' CHECK (default_ai_provider IN ('gemini', 'openai', 'groq')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-create profile on new user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 3. Social Accounts Table (Encrypted OAuth 2.0 Credentials at Rest)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'youtube', 'x', 'adzuna')),
  account_name TEXT NOT NULL,
  account_handle TEXT,
  account_type TEXT DEFAULT 'profile' CHECK (account_type IN ('profile', 'page', 'business', 'channel', 'api')),
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'needs_reauth')),
  
  -- SENSITIVE: Encrypted using AES-256-GCM via application server key or pgcrypto
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT '{}' NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate account link per user per platform
  UNIQUE(user_id, platform, account_handle)
);

-- --------------------------------------------------------------------
-- 4. Content Items Table (Drafts, Scheduled Posts & Published History)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'youtube', 'x')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  tags TEXT[] DEFAULT '{}' NOT NULL,
  
  media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video')),
  media_url TEXT,
  
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_post_url TEXT,
  error_message TEXT,
  
  -- Idempotency key strictly prevents duplicate publishing runs
  idempotency_key TEXT UNIQUE,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for background cron scheduler query (find pending scheduled posts)
CREATE INDEX IF NOT EXISTS idx_content_scheduled 
ON public.content_items(status, scheduled_for) 
WHERE status = 'scheduled';

-- --------------------------------------------------------------------
-- 5. Social Interactions Table (Incoming Comments & Approved Replies)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'youtube', 'x')),
  post_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_avatar TEXT,
  
  post_title TEXT NOT NULL,
  post_snippet TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  
  status TEXT DEFAULT 'pending_reply' CHECK (status IN ('pending_reply', 'replied', 'ignored')),
  required_permission TEXT NOT NULL,
  
  -- Explicit human-approved reply text
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 6. Job Applications Table (Career Search & Pipeline Tracker)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT 'Remote' NOT NULL,
  salary TEXT,
  url TEXT NOT NULL,
  source TEXT DEFAULT 'direct' CHECK (source IN ('adzuna', 'indeed', 'linkedin', 'direct')),
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'drafting', 'applied', 'interviewing', 'offered', 'rejected')),
  
  deadline TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  follow_up_date TIMESTAMPTZ,
  interview_date TIMESTAMPTZ,
  notes TEXT,
  description_snippet TEXT,
  
  -- Tailored application assets
  tailored_cv_summary TEXT,
  cover_letter TEXT,
  recruiter_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 7. Audit Logs Table (Security, Rate Limit, and Event Tracking)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g. 'oauth_connect', 'post_publish', 'token_refresh', 'reply_dispatch'
  platform TEXT,
  status TEXT NOT NULL, -- 'success', 'warning', 'error'
  ip_address INET,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES — STRICT ACCESS CONTROL
-- Every table has RLS enabled. Users can only touch their own data.
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update only their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Social Accounts: Users can CRUD only their own linked accounts
CREATE POLICY "social_accounts_all_own" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Content Items: Users can CRUD only their own posts
CREATE POLICY "content_items_all_own" ON public.content_items
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Social Interactions: Users can access and update their own interactions
CREATE POLICY "social_interactions_all_own" ON public.social_interactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Job Applications: Users can CRUD only their own job applications
CREATE POLICY "job_applications_all_own" ON public.job_applications
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Audit Logs: Users can view their own audit records; inserts handled by server functions
CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audit_logs_insert_own" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- End of Migration 001
-- ====================================================================
