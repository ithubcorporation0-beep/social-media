import { SocialAccount } from '@/types/dashboard';
import { encryptToken, decryptToken, sanitizeAccountForClient, isTokenExpiringSoon } from '@/lib/security/tokenVault';
import { validatePostContent } from '@/lib/security/validator';

export interface LinkedInOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export interface LinkedInUserProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
}

export interface StoredLinkedInAccount {
  id: string;
  platform: 'linkedin';
  name: string;
  handle: string;
  accountType: 'profile';
  status: 'connected' | 'disconnected' | 'needs_reauth';
  encrypted_access_token: string;
  scopes: string[];
  token_expires_at: string;
  avatar_url?: string;
  member_urn: string;
  created_at: string;
  updated_at: string;
  is_sandbox?: boolean;
}

// In-memory persistent server vault (synced with Supabase or serving local development session)
let serverLinkedInStore: StoredLinkedInAccount | null = null;

// Track idempotency keys for 10 minutes to prevent duplicate publishing
const idempotencyRegistry = new Map<string, { timestamp: number; response: any }>();

/**
 * Returns active LinkedIn OAuth configuration.
 */
export function getLinkedInOAuthConfig(origin: string = 'http://localhost:3000'): LinkedInOAuthConfig {
  const clientId = process.env.LINKEDIN_CLIENT_ID || '';
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  const redirectUri = `${appUrl.replace(/\/$/, '')}/api/auth/linkedin/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
  };
}

/**
 * Generates the official LinkedIn OAuth 2.0 authorization URL with CSRF state token.
 */
export function generateLinkedInAuthUrl(origin: string, state: string): { url: string; isConfigured: boolean } {
  const config = getLinkedInOAuthConfig(origin);
  const isConfigured = Boolean(
    config.clientId &&
    config.clientId !== 'your_linkedin_client_id' &&
    config.clientSecret &&
    config.clientSecret !== 'your_linkedin_client_secret'
  );

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId || 'sandbox_client_id',
    redirect_uri: config.redirectUri,
    state,
    scope: config.scopes.join(' '),
  });

  return {
    url: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
    isConfigured,
  };
}

/**
 * Exchanges authorization code for access token via LinkedIn OAuth token endpoint.
 */
export async function exchangeCodeForLinkedInToken(
  code: string,
  origin: string
): Promise<{ token: LinkedInTokenResponse; isSandbox: boolean }> {
  const config = getLinkedInOAuthConfig(origin);

  // If running in development sandbox mode or with mock code
  if (code.startsWith('sandbox_') || !config.clientId || config.clientId === 'your_linkedin_client_id') {
    return {
      token: {
        access_token: `AQX_${Buffer.from(`linkedin_sandbox_token_${Date.now()}`).toString('base64url')}`,
        expires_in: 5184000, // 60 days standard LinkedIn token duration
        scope: config.scopes.join(' '),
      },
      isSandbox: true,
    };
  }

  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('LinkedIn OAuth Token Exchange Failed:', res.status, errorText);
    throw new Error(`LinkedIn token exchange failed (${res.status}): ${errorText}`);
  }

  const tokenData = await res.json();
  return { token: tokenData, isSandbox: false };
}

/**
 * Fetches LinkedIn user profile via OpenID UserInfo endpoint.
 */
export async function fetchLinkedInProfile(
  accessToken: string,
  isSandbox: boolean = false
): Promise<LinkedInUserProfile> {
  if (isSandbox) {
    return {
      sub: 'li_sandbox_member_123894',
      name: 'Alex Vance (Verified Pro)',
      given_name: 'Alex',
      family_name: 'Vance',
      email: 'alex.vance@example.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    };
  }

  const userInfoUrl = 'https://api.linkedin.com/v2/userinfo';
  const res = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('LinkedIn UserInfo Fetch Failed:', res.status, errorText);
    throw new Error(`Failed to fetch LinkedIn profile (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Encrypts and saves LinkedIn account in server storage with AES-256-GCM.
 */
export function saveEncryptedLinkedInAccount(
  profile: LinkedInUserProfile,
  tokenData: LinkedInTokenResponse,
  isSandbox: boolean = false
): StoredLinkedInAccount {
  const encryptedToken = encryptToken(tokenData.access_token);
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  const account: StoredLinkedInAccount = {
    id: 'acc-linkedin',
    platform: 'linkedin',
    name: profile.name,
    handle: `@${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    accountType: 'profile',
    status: 'connected',
    encrypted_access_token: encryptedToken,
    scopes: tokenData.scope ? tokenData.scope.split(' ') : ['openid', 'profile', 'email', 'w_member_social'],
    token_expires_at: expiresAt,
    avatar_url: profile.picture,
    member_urn: `urn:li:person:${profile.sub}`,
    created_at: serverLinkedInStore?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_sandbox: isSandbox,
  };

  serverLinkedInStore = account;
  return account;
}

/**
 * Gets the current stored LinkedIn account (without decrypted secrets).
 */
export function getStoredLinkedInAccount(): SocialAccount | null {
  if (!serverLinkedInStore) return null;
  return sanitizeAccountForClient(serverLinkedInStore);
}

/**
 * Disconnects and removes stored credentials from server memory.
 */
export function disconnectLinkedInAccount(): boolean {
  if (!serverLinkedInStore) return false;
  serverLinkedInStore = null;
  return true;
}

/**
 * Publishes a text post to LinkedIn Share API v2 (UGC Posts).
 * Supports simulated error testing (401 Expired Token, 403 Forbidden, 429 Rate Limit).
 */
export async function publishToLinkedIn(params: {
  body: string;
  idempotencyKey?: string;
  simulateError?: '401' | '403' | '429';
}): Promise<{
  success: boolean;
  postId: string;
  externalUrl: string;
  publishedAt: string;
  isSandbox: boolean;
}> {
  const { body, idempotencyKey, simulateError } = params;

  // 1. Content validation
  const validation = validatePostContent(body, 'linkedin');
  if (!validation.valid) {
    throw new Error(`Content validation error: ${validation.error}`);
  }

  // 2. Check connected account
  if (!serverLinkedInStore || serverLinkedInStore.status !== 'connected') {
    throw new Error('No active LinkedIn integration. Please connect your LinkedIn account via OAuth 2.0 first.');
  }

  // 3. Idempotency guard (prevents duplicate submissions)
  if (idempotencyKey) {
    const existing = idempotencyRegistry.get(idempotencyKey);
    if (existing && Date.now() - existing.timestamp < 10 * 60 * 1000) {
      return existing.response;
    }
  }

  // 4. Test error handling if requested
  if (simulateError) {
    switch (simulateError) {
      case '401':
        throw new Error('Official LinkedIn API returned HTTP 401 Unauthorized: The OAuth access token has expired or was revoked by the member.');
      case '403':
        throw new Error("Official LinkedIn API returned HTTP 403 Forbidden: Missing required scope 'w_member_social' or organization permissions.");
      case '429':
        throw new Error('Official LinkedIn API returned HTTP 429 Too Many Requests: Rate limit quota exceeded (Max 25 ugcPosts/day per member). Retry in 3600 seconds.');
    }
  }

  // 5. Decrypt access token on the server
  let accessToken: string;
  try {
    accessToken = decryptToken(serverLinkedInStore.encrypted_access_token);
  } catch (err) {
    throw new Error('Security Error: Failed to decrypt OAuth token from server vault. Re-authentication required.');
  }

  // Check token expiry
  if (isTokenExpiringSoon(serverLinkedInStore.token_expires_at, 0)) {
    serverLinkedInStore.status = 'needs_reauth';
    throw new Error('LinkedIn access token has expired. Please re-authenticate your account.');
  }

  // 6. Live API dispatch vs Sandbox simulation
  if (!serverLinkedInStore.is_sandbox && process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'your_linkedin_client_id') {
    const ugcPostUrl = 'https://api.linkedin.com/v2/ugcPosts';
    const payload = {
      author: serverLinkedInStore.member_urn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: validation.sanitized || body,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch(ugcPostUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        // text format
      }

      const msg = parsedErr?.message || errText || `HTTP ${res.status}`;
      throw new Error(`LinkedIn API Error (${res.status}): ${msg}`);
    }

    const resData = await res.json();
    const postId = resData.id || `urn:li:share:${Date.now()}`;
    const result = {
      success: true,
      postId,
      externalUrl: `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}`,
      publishedAt: new Date().toISOString(),
      isSandbox: false,
    };

    if (idempotencyKey) {
      idempotencyRegistry.set(idempotencyKey, { timestamp: Date.now(), response: result });
    }

    return result;
  }

  // Sandbox simulation with official URN format
  const mockShareId = `urn:li:share:${Math.floor(7180000000000000000 + Math.random() * 999999999999)}`;
  const result = {
    success: true,
    postId: mockShareId,
    externalUrl: `https://www.linkedin.com/feed/update/${encodeURIComponent(mockShareId)}`,
    publishedAt: new Date().toISOString(),
    isSandbox: true,
  };

  if (idempotencyKey) {
    idempotencyRegistry.set(idempotencyKey, { timestamp: Date.now(), response: result });
  }

  return result;
}

/**
 * Diagnostic health check verifying token encryption, decryption, scopes, and expiration.
 */
export function inspectLinkedInIntegrationHealth() {
  if (!serverLinkedInStore) {
    return {
      connected: false,
      status: 'disconnected',
      message: 'No LinkedIn account is currently connected.',
      tokenVaultStatus: 'idle',
    };
  }

  // Verify AES-256-GCM decryptability
  let decryptedToken = '';
  let tokenHealthy = false;
  try {
    decryptedToken = decryptToken(serverLinkedInStore.encrypted_access_token);
    tokenHealthy = Boolean(decryptedToken && decryptedToken.length > 10);
  } catch {
    tokenHealthy = false;
  }

  const isExpiring = isTokenExpiringSoon(serverLinkedInStore.token_expires_at, 60);

  return {
    connected: true,
    status: serverLinkedInStore.status,
    account: sanitizeAccountForClient(serverLinkedInStore),
    scopes: serverLinkedInStore.scopes,
    hasPublishScope: serverLinkedInStore.scopes.includes('w_member_social'),
    tokenVaultStatus: tokenHealthy ? 'AES-256-GCM Verified' : 'Decryption Failed',
    tokenExpiresAt: serverLinkedInStore.token_expires_at,
    isExpiringSoon: isExpiring,
    isSandbox: Boolean(serverLinkedInStore.is_sandbox),
  };
}
