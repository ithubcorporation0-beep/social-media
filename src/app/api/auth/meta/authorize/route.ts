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

    // If Meta credentials are not configured in environment, do not fake a connection
    if (!isConfigured) {
      if (format === 'json' || req.headers.get('accept')?.includes('application/json')) {
        return NextResponse.json({
          success: false,
          error: 'missing_credentials',
          message: 'META_APP_ID and META_APP_SECRET are not configured in environment variables. Please add them to connect real Facebook Pages.',
          redirectUri: `${origin}/api/auth/meta/callback`,
        }, { status: 400 });
      }

      return NextResponse.redirect(`${origin}/?meta_error=missing_credentials`);
    }

    // Client requested JSON response
    if (format === 'json' || req.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        authorizeUrl: url,
        isConfigured: true,
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

    // Direct browser redirect to Facebook OAuth dialog
    const response = NextResponse.redirect(url);

    // Set secure HTTP-only state cookie for CSRF validation
    response.cookies.set('meta_oauth_state', stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('Meta Authorize Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate Meta OAuth' },
      { status: 500 }
    );
  }
}
