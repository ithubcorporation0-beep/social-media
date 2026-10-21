import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateMetaAuthUrl } from '@/lib/integrations/meta';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const format = searchParams.get('format');
    const stateToken = `meta_state_${crypto.randomBytes(16).toString('hex')}`;

    const { url, isConfigured } = generateMetaAuthUrl(origin, stateToken);

    if (format === 'json' || req.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        authorizeUrl: !isConfigured
          ? `${origin}/api/auth/meta/callback?code=sandbox_meta_code_${Date.now()}&state=${stateToken}`
          : url,
        isConfigured,
        redirectUri: `${origin}/api/auth/meta/callback`,
        scopes: [
          'pages_show_list',
          'pages_read_engagement',
          'pages_manage_posts',
          'instagram_basic',
          'instagram_content_publish',
        ],
      });
    }

    const targetUrl = !isConfigured
      ? `${origin}/api/auth/meta/callback?code=sandbox_meta_code_${Date.now()}&state=${stateToken}`
      : url;

    return NextResponse.redirect(targetUrl);
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate Meta OAuth' },
      { status: 500 }
    );
  }
}
