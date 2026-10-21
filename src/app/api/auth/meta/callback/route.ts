import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForMetaToken } from '@/lib/integrations/meta';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || 'http://localhost:3000';
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code') || `sandbox_meta_code_${Date.now()}`;
  const format = searchParams.get('format');
  const error = searchParams.get('error');

  if (error) {
    if (format === 'json' || req.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }
    return NextResponse.redirect(`${origin}/?meta_error=${encodeURIComponent(error)}`);
  }

  try {
    const account = await exchangeCodeForMetaToken(code, origin);

    if (format === 'json' || req.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        message: 'Meta Facebook/Instagram Page connected with AES-256-GCM token encryption.',
        account: {
          id: account.id,
          name: account.name,
          handle: account.handle,
          platform: account.platform,
          status: account.status,
          scopes: account.scopes,
        },
      });
    }

    return NextResponse.redirect(`${origin}/?meta_connected=success`);
  } catch (err: any) {
    if (format === 'json') {
      return NextResponse.json(
        { success: false, error: err.message || 'Token exchange failed' },
        { status: 500 }
      );
    }
    return NextResponse.redirect(
      `${origin}/?meta_error=${encodeURIComponent(err.message || 'Exchange failed')}`
    );
  }
}
