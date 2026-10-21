import crypto from 'crypto';
import { SocialAccount } from '@/types/dashboard';

// AES-256-GCM requires a 32-byte (256-bit) key
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit initialization vector
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derives a consistent 32-byte encryption key from the server environment.
 * Never accessible in browser bundles.
 */
function getMasterKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'socialhub-dev-fallback-encryption-seed-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedPayload {
  ciphertext: string; // Hex-encoded ciphertext
  iv: string;         // Hex-encoded IV
  authTag: string;    // Hex-encoded auth tag
}

/**
 * Encrypts an OAuth token or sensitive secret using AES-256-GCM before saving to PostgreSQL.
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return '';
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getMasterKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Format as serialized string: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted token on the server for authorized API dispatch.
 */
export function decryptToken(serializedCiphertext: string): string {
  if (!serializedCiphertext || !serializedCiphertext.includes(':')) {
    return serializedCiphertext; // Return raw if unencrypted legacy
  }

  try {
    const [ivHex, authTagHex, encryptedText] = serializedCiphertext.split(':');
    if (!ivHex || !authTagHex || !encryptedText) return '';

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getMasterKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Token decryption failed — potential tampering or corrupted key:', err);
    throw new Error('Decryption failure: Unauthorized key or corrupted credential.');
  }
}

/**
 * Strips all tokens and secrets before returning social account data to the client UI.
 * Guarantees zero credential leakage in JSON responses.
 */
export function sanitizeAccountForClient(account: any): SocialAccount {
  const {
    access_token,
    refresh_token,
    encrypted_access_token,
    encrypted_refresh_token,
    client_secret,
    ...safeProperties
  } = account;

  return {
    id: safeProperties.id,
    platform: safeProperties.platform,
    name: safeProperties.name || safeProperties.account_name,
    handle: safeProperties.handle || safeProperties.account_handle,
    accountType: safeProperties.accountType || safeProperties.account_type || 'profile',
    status: safeProperties.status,
    connectedAt: safeProperties.connectedAt || safeProperties.created_at,
    expiresAt: safeProperties.expiresAt || safeProperties.token_expires_at,
    avatarUrl: safeProperties.avatarUrl || safeProperties.avatar_url,
    officialDocUrl: safeProperties.officialDocUrl || 'https://developer.linkedin.com',
    requiredScopes: safeProperties.requiredScopes || safeProperties.scopes || [],
  };
}

/**
 * Validates if an OAuth token is expired or expiring within a safety buffer.
 */
export function isTokenExpiringSoon(expiresAt?: string, bufferMinutes = 5): boolean {
  if (!expiresAt) return false;
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;
  return expiryTime - now < bufferMs;
}
