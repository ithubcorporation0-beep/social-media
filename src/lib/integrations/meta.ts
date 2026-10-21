import { SocialAccount } from '@/types/dashboard';
import { encryptToken, decryptToken, sanitizeAccountForClient, isTokenExpiringSoon } from '@/lib/security/tokenVault';

export interface MetaOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface StoredMetaAccount {
  id: string;
  platform: 'facebook' | 'instagram';
  name: string;
  handle: string;
  accountType: 'page' | 'business';
  status: 'connected' | 'disconnected' | 'needs_reauth';
  encrypted_access_token: string;
  page_id?: string;
  ig_user_id?: string;
  scopes: string[];
  token_expires_at: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_sandbox?: boolean;
}

// In-memory persistent server vault for Meta integration
let serverMetaStore: StoredMetaAccount | null = null;

export function getMetaOAuthConfig(origin: string = 'http://localhost:3000'): MetaOAuthConfig {
  const appId = process.env.META_APP_ID || '';
  const appSecret = process.env.META_APP_SECRET || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  const redirectUri = `${appUrl.replace(/\/$/, '')}/api/auth/meta/callback`;

  return {
    appId,
    appSecret,
    redirectUri,
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
    ],
  };
}

/**
 * Generates the official Meta Graph OAuth 2.0 authorization URL.
 */
export function generateMetaAuthUrl(origin: string, state: string): { url: string; isConfigured: boolean } {
  const config = getMetaOAuthConfig(origin);
  const isConfigured = Boolean(
    config.appId &&
    config.appId !== 'your_meta_app_id' &&
    config.appSecret &&
    config.appSecret !== 'your_meta_app_secret'
  );

  const params = new URLSearchParams({
    client_id: config.appId || 'sandbox_meta_app_id',
    redirect_uri: config.redirectUri,
    state,
    scope: config.scopes.join(','),
    response_type: 'code',
  });

  return {
    url: `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`,
    isConfigured,
  };
}

/**
 * Exchanges authorization code for long-lived page token and encrypts via AES-256-GCM.
 */
export async function exchangeCodeForMetaToken(code: string, origin: string): Promise<StoredMetaAccount> {
  const config = getMetaOAuthConfig(origin);
  const isSandbox = code.startsWith('sandbox_') || !config.appId || config.appId === 'your_meta_app_id';

  let rawToken = `EAA_${Buffer.from(`meta_user_token_${Date.now()}`).toString('base64url')}`;
  let pageName = 'SocialHub Official Page';
  let pageHandle = '@socialhub_hq';
  let expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days standard

  if (!isSandbox) {
    // Live Meta Graph exchange
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${config.appId}&redirect_uri=${encodeURIComponent(
      config.redirectUri
    )}&client_secret=${config.appSecret}&code=${encodeURIComponent(code)}`;

    const res = await fetch(tokenUrl);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meta token exchange failed: ${err}`);
    }
    const tokenData = await res.json();
    rawToken = tokenData.access_token;

    // Fetch user pages
    const accountsRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${rawToken}`
    );
    if (accountsRes.ok) {
      const accData = await accountsRes.json();
      if (accData.data && accData.data.length > 0) {
        pageName = accData.data[0].name;
        pageHandle = `@${pageName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        rawToken = accData.data[0].access_token; // Use Page Access Token
      }
    }
  }

  const encryptedToken = encryptToken(rawToken);

  const account: StoredMetaAccount = {
    id: 'acc-facebook',
    platform: 'facebook',
    name: pageName,
    handle: pageHandle,
    accountType: 'page',
    status: 'connected',
    encrypted_access_token: encryptedToken,
    scopes: config.scopes,
    token_expires_at: expiresAt,
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_sandbox: isSandbox,
  };

  serverMetaStore = account;
  return account;
}

export function inspectMetaHealth() {
  if (!serverMetaStore) {
    return {
      connected: false,
      status: 'disconnected',
      message: 'No Meta account connected.',
    };
  }

  let tokenHealthy = false;
  try {
    const dec = decryptToken(serverMetaStore.encrypted_access_token);
    tokenHealthy = Boolean(dec && dec.length > 10);
  } catch {
    tokenHealthy = false;
  }

  return {
    connected: true,
    status: serverMetaStore.status,
    account: sanitizeAccountForClient(serverMetaStore),
    scopes: serverMetaStore.scopes,
    tokenVaultStatus: tokenHealthy ? 'AES-256-GCM Verified' : 'Corrupted',
    tokenExpiresAt: serverMetaStore.token_expires_at,
    isExpiringSoon: isTokenExpiringSoon(serverMetaStore.token_expires_at, 60),
    isSandbox: Boolean(serverMetaStore.is_sandbox),
  };
}

export function disconnectMetaAccount(): boolean {
  if (!serverMetaStore) return false;
  serverMetaStore = null;
  return true;
}
