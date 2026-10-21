import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateLinkedInAuthUrl } from '@/lib/integrations/linkedin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const format = searchParams.get('format');
    const mode = searchParams.get('mode') || 'auto'; // 'auto' | 'sandbox' | 'live'

    // Generate cryptographically secure CSRF state token
    const stateToken = `state_${crypto.randomBytes(16).toString('hex')}`;

    const { url, isConfigured } = generateLinkedInAuthUrl(origin, stateToken);

    // If sandbox mode is explicitly requested or client is not yet configured with real API keys
    const isSandbox = mode === 'sandbox' || (!isConfigured && mode !== 'live');

    // If client requested JSON response
    if (format === 'json' || req.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        authorizeUrl: isSandbox
          ? `${origin}/api/auth/linkedin/callback?code=sandbox_auth_code_${Date.now()}&state=${stateToken}`
          : url,
        state: stateToken,
        isConfigured,
        isSandbox,
        redirectUri: `${origin}/api/auth/linkedin/callback`,
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
      });
    }

    // Direct browser redirect
    const targetRedirect = isSandbox
      ? `${origin}/api/auth/linkedin/callback?code=sandbox_auth_code_${Date.now()}&state=${stateToken}`
      : url;

    const response = NextResponse.redirect(targetRedirect);

    // Set secure HTTP-only state cookie for CSRF validation
    response.cookies.set('linkedin_oauth_state', stateToken, {
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
    console.error('LinkedIn OAuth Authorize Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate LinkedIn OAuth' },
      { status: 500 }
    );
  }
}
