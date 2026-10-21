import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForMetaToken } from '@/lib/integrations/meta';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || 'http://localhost:3000';
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const format = searchParams.get('format');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');
  const wantsJson = format === 'json' || req.headers.get('accept')?.includes('application/json');

  // Handle provider cancellation or denial
  if (error) {
    const errorMsg = errorDescription || errorReason || error;
    console.warn('Meta OAuth returned error:', errorMsg);
    if (wantsJson) {
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }
    return NextResponse.redirect(`${origin}/?meta_error=${encodeURIComponent(errorMsg)}`);
  }

  // Code is required
  if (!code) {
    if (wantsJson) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization code from Meta OAuth redirect.' },
        { status: 400 }
      );
    }
    return NextResponse.redirect(`${origin}/?meta_error=missing_code`);
  }

  // Validate CSRF state
  const storedState = req.cookies.get('meta_oauth_state')?.value;
  if (storedState && state && storedState !== state) {
    console.error('CSRF state mismatch in Meta OAuth callback.');
    if (wantsJson) {
      return NextResponse.json(
        { success: false, error: 'OAuth state validation failed (possible CSRF attempt).' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(`${origin}/?meta_error=state_mismatch`);
  }

  try {
    const account = await exchangeCodeForMetaToken(code, origin);

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        message: 'Facebook Page connected successfully with verified Page Access Token (AES-256-GCM encrypted).',
        account: {
          id: account.id,
          name: account.name,
          handle: account.handle,
          platform: account.platform,
          status: account.status,
          pageId: account.page_id,
          availablePages: account.available_pages,
          scopes: account.scopes,
        },
      });
    }

    const response = NextResponse.redirect(
      `${origin}/?meta_connected=success&page_name=${encodeURIComponent(account.name)}`
    );

    // Clean up state cookie
    response.cookies.delete('meta_oauth_state');
    return response;
  } catch (err: any) {
    console.error('Meta OAuth callback exchange error:', err);
    if (wantsJson) {
      return NextResponse.json(
        { success: false, error: err.message || 'Meta token exchange failed' },
        { status: 500 }
      );
    }
    return NextResponse.redirect(
      `${origin}/?meta_error=${encodeURIComponent(err.message || 'Meta token exchange failed')}`
    );
  }
}
