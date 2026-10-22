import { SocialAccount } from '@/types/dashboard';
import { encryptToken, decryptToken, sanitizeAccountForClient, isTokenExpiringSoon } from '@/lib/security/tokenVault';

export interface MetaOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface FacebookPageInfo {
  id: string;
  name: string;
  category?: string;
  pictureUrl?: string;
  tasks?: string[];
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
  available_pages?: FacebookPageInfo[];
  scopes: string[];
  token_expires_at: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_sandbox?: boolean;
}

// In-memory persistent server vault for Meta integration (persisted across warm serverless requests)
let serverMetaStore: StoredMetaAccount | null = null;

// Direct Facebook Page token storage (runtime configuration)
let customPageAccessToken: string | null = null;
let customPageId: string | null = null;

export function setCustomFacebookPageCredentials(token: string, pageId: string = '61551470574335') {
  customPageAccessToken = token.trim();
  customPageId = pageId.trim();
}

export function clearCustomFacebookCredentials() {
  customPageAccessToken = null;
  customPageId = null;
}

export function getEffectiveFacebookCredentials(): {
  pageId: string;
  pageToken: string;
  hasToken: boolean;
  tokenSource: 'runtime' | 'env' | 'oauth' | 'none';
} {
  const pageId =
    customPageId ||
    process.env.FACEBOOK_PAGE_ID ||
    serverMetaStore?.page_id ||
    '61551470574335';

  if (customPageAccessToken && customPageAccessToken.length > 10) {
    return {
      pageId,
      pageToken: customPageAccessToken,
      hasToken: true,
      tokenSource: 'runtime',
    };
  }

  const envToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  if (envToken && envToken.length > 10) {
    return {
      pageId,
      pageToken: envToken,
      hasToken: true,
      tokenSource: 'env',
    };
  }

  if (serverMetaStore?.status === 'connected' && serverMetaStore.encrypted_access_token) {
    try {
      const dec = decryptToken(serverMetaStore.encrypted_access_token);
      if (dec && dec.length > 10) {
        return {
          pageId,
          pageToken: dec,
          hasToken: true,
          tokenSource: 'oauth',
        };
      }
    } catch {
      // decryption failed
    }
  }

  return {
    pageId,
    pageToken: '',
    hasToken: false,
    tokenSource: 'none',
  };
}

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
    client_id: config.appId,
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
  
  if (!config.appId || config.appId === 'your_meta_app_id' || !config.appSecret || config.appSecret === 'your_meta_app_secret') {
    throw new Error('META_APP_ID and META_APP_SECRET must be configured in environment variables to connect real Facebook Pages.');
  }

  // 1. Exchange code for short-lived user access token
  const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${config.appId}&redirect_uri=${encodeURIComponent(
    config.redirectUri
  )}&client_secret=${config.appSecret}&code=${encodeURIComponent(code)}`;

  const tokenRes = await fetch(tokenUrl);
  if (!tokenRes.ok) {
    const errData = await tokenRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Meta OAuth token exchange failed (HTTP ${tokenRes.status})`);
  }
  const tokenData = await tokenRes.json();
  const shortLivedUserToken = tokenData.access_token;

  // 2. Exchange short-lived user token for long-lived user token (valid for ~60 days)
  const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.appId}&client_secret=${config.appSecret}&fb_exchange_token=${shortLivedUserToken}`;
  const longLivedRes = await fetch(longLivedUrl);
  let userToken = shortLivedUserToken;
  if (longLivedRes.ok) {
    const longLivedData = await longLivedRes.json();
    userToken = longLivedData.access_token || shortLivedUserToken;
  }

  // 3. Fetch user's managed Facebook Pages
  const accountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}&fields=id,name,access_token,category,tasks,picture{url}`
  );
  
  if (!accountsRes.ok) {
    const errData = await accountsRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to retrieve Facebook Pages from Meta Graph API.');
  }

  const accData = await accountsRes.json();
  const pages = accData.data || [];

  if (pages.length === 0) {
    throw new Error('No Facebook Pages found. You must be an administrator of at least one Facebook Page to connect. Create a page at https://www.facebook.com/pages/create first.');
  }

  // Select primary page (first page user administers)
  const primaryPage = pages[0];
  const pageId = primaryPage.id;
  const pageName = primaryPage.name;
  const pageToken = primaryPage.access_token; // Permanent Page Access Token
  const avatarUrl = primaryPage.picture?.data?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';

  const availablePages: FacebookPageInfo[] = pages.map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    pictureUrl: p.picture?.data?.url,
    tasks: p.tasks,
  }));

  // 4. Encrypt the permanent Page Access Token at rest with AES-256-GCM
  const encryptedToken = encryptToken(pageToken);

  const account: StoredMetaAccount = {
    id: 'acc-facebook',
    platform: 'facebook',
    name: pageName,
    handle: `@page_${pageId}`,
    accountType: 'page',
    status: 'connected',
    encrypted_access_token: encryptedToken,
    page_id: pageId,
    available_pages: availablePages,
    scopes: config.scopes,
    token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Page tokens are long-lived
    avatar_url: avatarUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_sandbox: false,
  };

  serverMetaStore = account;
  return account;
}

export async function checkFacebookTokenPermissions(rawToken: string): Promise<{
  granted: string[];
  missingManagePosts: boolean;
}> {
  try {
    const permRes = await fetch(
      `https://graph.facebook.com/v19.0/me/permissions?access_token=${encodeURIComponent(rawToken)}`
    );
    const permData = await permRes.json().catch(() => ({}));
    if (permRes.ok && Array.isArray(permData.data)) {
      const granted = permData.data
        .filter((p: any) => p.status === 'granted')
        .map((p: any) => p.permission);
      return {
        granted,
        missingManagePosts: !granted.includes('pages_manage_posts'),
      };
    }
  } catch (err) {
    console.warn('Could not inspect permissions:', err);
  }
  return { granted: [], missingManagePosts: false };
}

export async function getFacebookManagedPages(rawToken: string): Promise<Array<{ id: string; name: string; category?: string }>> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category&access_token=${encodeURIComponent(rawToken)}`
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.data)) {
      return data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
      }));
    }
  } catch (err) {
    console.error('Error fetching Facebook managed pages:', err);
  }
  return [];
}

/**
 * Resolves the genuine Page Access Token and Page Scoped ID.
 * Works whether the provided token is a Page Token or a User Token with Page permissions.
 */
export async function resolveFacebookPageCredentials(
  rawToken: string,
  targetPageId: string = '61551470574335'
): Promise<{
  pageId: string;
  pageToken: string;
  pageName: string;
}> {
  try {
    // 1. Inspect the token at /me
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,category&access_token=${encodeURIComponent(rawToken)}`
    );
    const meData = await meRes.json().catch(() => ({}));

    // If it's already a Page Access Token (pages have a category field)
    if (meRes.ok && meData.id && meData.category) {
      return {
        pageId: meData.id,
        pageToken: rawToken,
        pageName: meData.name || 'IZBA Marketing agency',
      };
    }

    // 2. Check /me/accounts in case it's a User Access Token with page permissions
    const accountsRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,category&access_token=${encodeURIComponent(rawToken)}`
    );
    const accountsData = await accountsRes.json().catch(() => ({}));

    if (accountsRes.ok && Array.isArray(accountsData.data) && accountsData.data.length > 0) {
      const pages = accountsData.data;
      const matchedPage =
        pages.find((p: any) => p.id === targetPageId) ||
        pages.find((p: any) => p.name?.toLowerCase().includes('izba')) ||
        pages[0];

      if (matchedPage && matchedPage.access_token) {
        return {
          pageId: matchedPage.id,
          pageToken: matchedPage.access_token,
          pageName: matchedPage.name || 'IZBA Marketing agency',
        };
      }
    }

    // 3. If meData returned an ID, use it if it's not the disallowed global ID
    if (meRes.ok && meData.id && meData.id !== '61551470574335') {
      return {
        pageId: meData.id,
        pageToken: rawToken,
        pageName: meData.name || 'IZBA Marketing agency',
      };
    }
  } catch (err) {
    console.warn('Error resolving Facebook page credentials:', err);
  }

  // Universal fallback for Page Access Token: target 'me'
  return {
    pageId: 'me',
    pageToken: rawToken,
    pageName: 'IZBA Marketing agency',
  };
}

/**
 * Publishes a post or photo to the connected Facebook Page.
 */
export async function publishToFacebookPage(
  body: string, 
  mediaUrl?: string
): Promise<{ 
  success: boolean; 
  postId?: string; 
  postUrl?: string; 
  error?: string;
  requiresToken?: boolean;
}> {
  const { pageId, pageToken, hasToken } = getEffectiveFacebookCredentials();

  if (!hasToken) {
    return { 
      success: false, 
      requiresToken: true,
      error: 'No Facebook Page Access Token configured. Facebook requires an access token with "pages_manage_posts" permission for "IZBA Marketing agency" (Page ID: 61551470574335).' 
    };
  }

  try {
    // 1. Resolve to actual Page Access Token & Scoped Page ID
    const resolved = await resolveFacebookPageCredentials(pageToken, pageId);
    const activeToken = resolved.pageToken;

    // Never pass global profile ID in URL path to avoid error #100
    const targetNode = (resolved.pageId && resolved.pageId !== '61551470574335') 
      ? resolved.pageId 
      : 'me';

    let endpoint = `https://graph.facebook.com/v19.0/${targetNode}/feed`;
    let payload: Record<string, string> = {
      message: body,
      access_token: activeToken,
    };

    if (mediaUrl) {
      endpoint = `https://graph.facebook.com/v19.0/${targetNode}/photos`;
      payload = {
        caption: body,
        url: mediaUrl,
        access_token: activeToken,
      };
    }

    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data = await res.json().catch(() => ({}));

    // If initial endpoint failed with error 100 (e.g. global ID), retry with 'me' node
    if (!res.ok && (data.error?.code === 100 || targetNode !== 'me')) {
      const fallbackEndpoint = mediaUrl 
        ? `https://graph.facebook.com/v19.0/me/photos`
        : `https://graph.facebook.com/v19.0/me/feed`;

      const fallbackRes = await fetch(fallbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const fallbackData = await fallbackRes.json().catch(() => ({}));
      if (fallbackRes.ok && (fallbackData.id || fallbackData.post_id)) {
        res = fallbackRes;
        data = fallbackData;
      }
    }

    if (!res.ok || data.error) {
      const fbMsg = data.error?.message || `Facebook API error (HTTP ${res.status})`;
      const fbCode = data.error?.code ? ` (Code: ${data.error.code})` : '';
      return { 
        success: false, 
        error: `${fbMsg}${fbCode}` 
      };
    }

    const postId = data.id || data.post_id;
    const postUrl = `https://www.facebook.com/profile.php?id=61551470574335`;

    return {
      success: true,
      postId,
      postUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error publishing to Facebook Page' };
  }
}

export function inspectMetaHealth() {
  const { pageId, hasToken, tokenSource } = getEffectiveFacebookCredentials();

  if (hasToken) {
    return {
      connected: true,
      status: 'connected',
      hasToken: true,
      tokenSource,
      pageId,
      account: {
        id: 'acc-facebook',
        platform: 'facebook',
        name: 'IZBA Marketing agency',
        handle: `@page_${pageId}`,
        accountType: 'page',
        status: 'connected',
        pageId,
        avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      },
      scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
      tokenVaultStatus: tokenSource === 'oauth' ? 'AES-256-GCM Vault' : `Page Access Token (${tokenSource.toUpperCase()})`,
      isSandbox: false,
    };
  }

  if (serverMetaStore) {
    let tokenHealthy = false;
    try {
      const dec = decryptToken(serverMetaStore.encrypted_access_token);
      tokenHealthy = Boolean(dec && dec.length > 10);
    } catch {
      tokenHealthy = false;
    }

    return {
      connected: serverMetaStore.status === 'connected',
      status: serverMetaStore.status,
      hasToken: tokenHealthy,
      pageId: serverMetaStore.page_id,
      account: {
        ...sanitizeAccountForClient(serverMetaStore),
        pageId: serverMetaStore.page_id,
        availablePages: serverMetaStore.available_pages,
      },
      scopes: serverMetaStore.scopes,
      tokenVaultStatus: tokenHealthy ? 'AES-256-GCM Verified' : 'Corrupted',
      tokenExpiresAt: serverMetaStore.token_expires_at,
      isExpiringSoon: isTokenExpiringSoon(serverMetaStore.token_expires_at, 60),
      isSandbox: Boolean(serverMetaStore.is_sandbox),
    };
  }

  return {
    connected: false,
    status: 'disconnected',
    hasToken: false,
    pageId: '61551470574335',
    message: 'Facebook Page Access Token not configured. Add FACEBOOK_PAGE_ACCESS_TOKEN or connect via OAuth to publish live.',
  };
}

export function disconnectMetaAccount(): boolean {
  clearCustomFacebookCredentials();
  if (!serverMetaStore) return false;
  serverMetaStore = null;
  return true;
}
