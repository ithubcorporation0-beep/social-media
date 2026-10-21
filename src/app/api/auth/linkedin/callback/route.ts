import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForLinkedInToken,
  fetchLinkedInProfile,
  saveEncryptedLinkedInAccount,
} from '@/lib/integrations/linkedin';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || 'http://localhost:3000';
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const format = searchParams.get('format');
  const wantsJson = format === 'json' || req.headers.get('accept')?.includes('application/json');

  // Handle OAuth provider error (e.g. user cancelled login dialog)
  if (error) {
    console.warn('LinkedIn OAuth returned error:', error, errorDescription);
    if (wantsJson) {
      return NextResponse.json(
        { success: false, error: errorDescription || error },
        { status: 400 }
      );
    }
    return NextResponse.redirect(
      `${origin}/?linkedin_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Code is required
  if (!code) {
    if (wantsJson) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization code from LinkedIn OAuth callback.' },
        { status: 400 }
      );
    }
    return NextResponse.redirect(`${origin}/?linkedin_error=missing_code`);
  }

  try {
    // 1. Exchange authorization code for access token
    const { token, isSandbox } = await exchangeCodeForLinkedInToken(code, origin);

    // 2. Fetch authenticated member profile
    const profile = await fetchLinkedInProfile(token.access_token, isSandbox);

    // 3. Encrypt access token at rest via AES-256-GCM and store account
    const storedAccount = saveEncryptedLinkedInAccount(profile, token, isSandbox);

    // 4. Return sanitized client response or redirect
    if (wantsJson) {
      return NextResponse.json({
        success: true,
        message: 'LinkedIn account connected successfully via OAuth 2.0 with AES-256-GCM token encryption.',
        account: {
          id: storedAccount.id,
          name: storedAccount.name,
          handle: storedAccount.handle,
          platform: storedAccount.platform,
          status: storedAccount.status,
          scopes: storedAccount.scopes,
          avatarUrl: storedAccount.avatar_url,
          tokenExpiresAt: storedAccount.token_expires_at,
          isSandbox: storedAccount.is_sandbox,
        },
      });
    }

    // Direct browser redirect back to dashboard with success query
    return NextResponse.redirect(`${origin}/?linkedin_connected=success`);
  } catch (err: any) {
    console.error('LinkedIn Callback Exchange Error:', err);
    if (wantsJson) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to complete LinkedIn authentication.' },
        { status: 500 }
      );
    }
    return NextResponse.redirect(
      `${origin}/?linkedin_error=${encodeURIComponent(err.message || 'Token exchange failed')}`
    );
  }
}

export async function POST(req: NextRequest) {
  // Support POST for programmatic testing / webhooks
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const body = await req.json().catch(() => ({}));
    const code = body.code || `sandbox_auth_code_${Date.now()}`;

    const { token, isSandbox } = await exchangeCodeForLinkedInToken(code, origin);
    const profile = await fetchLinkedInProfile(token.access_token, isSandbox);
    const storedAccount = saveEncryptedLinkedInAccount(profile, token, isSandbox);

    return NextResponse.json({
      success: true,
      message: 'LinkedIn connected successfully via programmatic test exchange.',
      account: {
        id: storedAccount.id,
        name: storedAccount.name,
        handle: storedAccount.handle,
        platform: storedAccount.platform,
        status: storedAccount.status,
        scopes: storedAccount.scopes,
        tokenVault: 'AES-256-GCM (Zero Leakage)',
        isSandbox: storedAccount.is_sandbox,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'POST token exchange failed' },
      { status: 500 }
    );
  }
}
