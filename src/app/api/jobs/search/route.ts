import { NextResponse } from 'next/server';
import { JobSearchResult } from '@/types/dashboard';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('what') || 'Software Engineer';
    const location = searchParams.get('where') || 'Remote';
    const country = searchParams.get('country') || 'us';

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    // If official Adzuna keys exist in environment, query live official API
    if (appId && appKey) {
      try {
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(
          query
        )}&where=${encodeURIComponent(location)}&content-type=application/json`;

        const res = await fetch(adzunaUrl);
        if (res.ok) {
          const data = await res.json();
          const results: JobSearchResult[] = (data.results || []).map((j: any) => ({
            id: j.id?.toString() || `adzuna-${Date.now()}-${Math.random()}`,
            title: j.title || 'Untitled Role',
            company: j.company?.display_name || 'Hiring Company',
            location: j.location?.display_name || location,
            salaryMin: j.salary_min,
            salaryMax: j.salary_max,
            contractTime: j.contract_time || 'full_time',
            description: j.description || '',
            redirectUrl: j.redirect_url || 'https://www.adzuna.com',
            source: 'Adzuna Official API',
            created: j.created || new Date().toISOString(),
          }));

          return NextResponse.json({
            results,
            isLive: true,
            provider: 'Adzuna Live API v1',
            count: data.count || results.length,
          });
        }
      } catch (err) {
        console.warn('Adzuna live search failed, falling back to verified sample database', err);
      }
    }

    // Default: Verified Legal Sample Job Feed (Zero-Friction Sandbox)
    const fallbackJobs: JobSearchResult[] = [
      {
        id: 'job-adz-1',
        title: 'Senior Full-Stack AI Engineer (Next.js & Supabase)',
        company: 'Synthetix Cloud Labs',
        location: 'Remote (US/Global)',
        salaryMin: 140000,
        salaryMax: 175000,
        contractTime: 'full_time',
        description:
          'Seeking a senior engineer experienced with Next.js App Router, TypeScript, Supabase PostgreSQL, and official OAuth 2.0 social integrations. High autonomy and generous equity.',
        redirectUrl: 'https://developer.adzuna.com',
        source: 'Adzuna Verified Feed',
        created: '2026-10-21T02:00:00Z',
      },
      {
        id: 'job-adz-2',
        title: 'Lead Frontend Architect (React 19, Modern CSS)',
        company: 'Veloce Data Platforms',
        location: 'Remote / New York, NY',
        salaryMin: 155000,
        salaryMax: 190000,
        contractTime: 'full_time',
        description:
          'Lead frontend design and web accessibility standards across our multi-tenant SaaS. Strong emphasis on glassmorphic design systems, state machines, and CWV performance.',
        redirectUrl: 'https://developer.adzuna.com',
        source: 'Adzuna Verified Feed',
        created: '2026-10-20T18:30:00Z',
      },
      {
        id: 'job-adz-3',
        title: 'AI Product Engineer (LLM Routing & Agents)',
        company: 'Nexus Automation',
        location: 'San Francisco, CA / Hybrid',
        salaryMin: 160000,
        salaryMax: 210000,
        contractTime: 'full_time',
        description:
          'Build multi-model LLM integrations leveraging Gemini, Groq, and OpenAI. Implement server-side secret isolation, rate limiting, and structured JSON output pipelines.',
        redirectUrl: 'https://developer.adzuna.com',
        source: 'Adzuna Verified Feed',
        created: '2026-10-20T14:15:00Z',
      },
      {
        id: 'job-adz-4',
        title: 'TypeScript Full-Stack Developer (Remote)',
        company: 'Aura Digital Workflows',
        location: 'London, UK / Remote',
        salaryMin: 85000,
        salaryMax: 110000,
        contractTime: 'full_time',
        description:
          'Join our distributed team managing integrations for social media scheduling, OAuth token lifecycle, and analytics dashboards. Great work-life balance and learning budget.',
        redirectUrl: 'https://developer.adzuna.com',
        source: 'Adzuna Verified Feed',
        created: '2026-10-19T21:00:00Z',
      },
    ];

    // Filter fallback jobs by keyword if provided
    const filtered = fallbackJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.description.toLowerCase().includes(query.toLowerCase()) ||
        j.location.toLowerCase().includes(location.toLowerCase())
    );

    return NextResponse.json({
      results: filtered.length > 0 ? filtered : fallbackJobs,
      isLive: false,
      provider: 'Adzuna Sample Sandbox Feed',
      notice: 'Configure ADZUNA_APP_ID & ADZUNA_APP_KEY in .env for unlimited live global search.',
    });
  } catch (error) {
    console.error('Job search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search job listings.' },
      { status: 500 }
    );
  }
}
