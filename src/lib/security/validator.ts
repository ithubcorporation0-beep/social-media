import { PlatformId } from '@/types/dashboard';

// Official platform character limits
export const PLATFORM_CHAR_LIMITS: Record<PlatformId, number> = {
  x: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
  youtube: 5000,
  adzuna: 1000,
};

// Allowed upload MIME types
export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates post body length and sanitizes control characters.
 */
export function validatePostContent(body: string, platform: PlatformId): ValidationResult {
  if (!body || !body.trim()) {
    return { valid: false, error: 'Post content cannot be empty.' };
  }

  const limit = PLATFORM_CHAR_LIMITS[platform] || 2000;
  if (body.length > limit) {
    return {
      valid: false,
      error: `Post exceeds character limit for ${platform.toUpperCase()} (${body.length} / ${limit} chars).`,
    };
  }

  // Remove dangerous null bytes and bidirectional override characters
  const sanitized = body.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u202A-\u202E]/g, '');

  return { valid: true, sanitized };
}

/**
 * Validates a job or external URL, preventing SSRF and javascript: protocol exploits.
 */
export function validateExternalUrl(urlString: string): ValidationResult {
  if (!urlString || !urlString.trim()) {
    return { valid: false, error: 'URL cannot be empty.' };
  }

  try {
    const parsed = new URL(urlString.trim());

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only secure HTTP/HTTPS URLs are allowed.' };
    }

    // Anti-SSRF: Reject localhost, internal loopback, and cloud metadata IPs
    const hostname = parsed.hostname.toLowerCase();
    const disallowedHostnames = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '169.254.169.254', // AWS/GCP/Azure link-local metadata service
      'metadata.google.internal',
    ];

    if (disallowedHostnames.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { valid: false, error: 'Internal network and metadata targets are strictly blocked.' };
    }

    return { valid: true, sanitized: parsed.toString() };
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }
}

/**
 * Validates an uploaded media attachment for social publishing.
 */
export function validateMediaUpload(
  fileSize: number,
  mimeType: string,
  platform: PlatformId
): ValidationResult {
  const isImage = ALLOWED_IMAGE_MIMES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_MIMES.includes(mimeType);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WebP, MP4, WebM.`,
    };
  }

  if (isImage && fileSize > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image exceeds maximum allowed size of 10MB (${(fileSize / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  if (isVideo && fileSize > MAX_VIDEO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Video exceeds maximum allowed size of 100MB (${(fileSize / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  // Instagram requires at least an image or video
  if (platform === 'instagram' && !isImage && !isVideo) {
    return {
      valid: false,
      error: 'Instagram Professional publishing requires an image or video attachment.',
    };
  }

  return { valid: true };
}
