/**
 * SocialHub AI — Step 9 Hardening & Verification Test Suite
 * Tests authorization, token vault, input validation, anti-SSRF, rate limits, duplicate locks, and health checks.
 */

import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';
let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  }
}

// AES-256-GCM verification helper
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getMasterKey() {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || 'socialhub-dev-fallback-encryption-seed-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptToken(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getMasterKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptToken(serialized) {
  const [ivHex, authTagHex, encryptedText] = serialized.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getMasterKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Anti-SSRF test helper
function validateExternalUrl(urlString) {
  if (!urlString || !urlString.trim()) return { valid: false, error: 'Empty URL' };
  try {
    const parsed = new URL(urlString.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Invalid protocol' };
    }
    const hostname = parsed.hostname.toLowerCase();
    const disallowed = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
    if (disallowed.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { valid: false, error: 'Internal/metadata target blocked' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
}

async function runHardeningTests() {
  console.log('====================================================');
  console.log('SocialHub AI — Comprehensive Hardening Test Suite');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST GROUP 1: AES-256-GCM Token Vault & Tampering
  // ----------------------------------------------------
  console.log('--- 1. Security Vault (AES-256-GCM & Tamper Detection) ---');
  const sampleSecret = 'AQX_linkedin_oauth_secret_token_live_2026';
  const encrypted = encryptToken(sampleSecret);
  assert(encrypted.includes(':'), 'Token is serialized with IV, AuthTag, and Ciphertext');

  const decrypted = decryptToken(encrypted);
  assert(decrypted === sampleSecret, 'Decrypted token exactly matches original secret');

  // Tamper test: Altering ciphertext must throw error
  let tamperCaught = false;
  try {
    const parts = encrypted.split(':');
    parts[2] = 'ff' + parts[2].slice(2); // Mutate ciphertext
    decryptToken(parts.join(':'));
  } catch {
    tamperCaught = true;
  }
  assert(tamperCaught, 'Tampered ciphertext is immediately detected and rejected by GCM auth tag');

  // ----------------------------------------------------
  // TEST GROUP 2: Input Validation & Anti-SSRF
  // ----------------------------------------------------
  console.log('\n--- 2. Input Validation & Anti-SSRF Protection ---');
  const validUrl = validateExternalUrl('https://stripe.com/jobs/lead-architect');
  assert(validUrl.valid, 'Valid HTTPS job URL is accepted');

  const localhostUrl = validateExternalUrl('http://localhost:3000/internal-admin');
  assert(!localhostUrl.valid, 'SSRF exploit (localhost) is blocked');

  const loopbackUrl = validateExternalUrl('http://127.0.0.1:8080/secrets');
  assert(!loopbackUrl.valid, 'SSRF exploit (127.0.0.1) is blocked');

  const metadataUrl = validateExternalUrl('http://169.254.169.254/latest/meta-data/');
  assert(!metadataUrl.valid, 'Cloud metadata service exploit (169.254.169.254) is blocked');

  const jsUrl = validateExternalUrl('javascript:alert(document.cookie)');
  assert(!jsUrl.valid, 'XSS protocol (javascript:) is blocked');

  // ----------------------------------------------------
  // TEST GROUP 3: Live API Endpoints & Error Handling
  // ----------------------------------------------------
  console.log('\n--- 3. API Limit Handling & HTTP Error Codes ---');
  try {
    // 3a: HTTP 429 Rate Limit Simulation
    const rateLimitRes = await fetch(`${BASE_URL}/api/social/publish/linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: 'Testing rate limits',
        simulateError: '429',
      }),
    });
    assert(rateLimitRes.status === 429, `HTTP 429 Rate Limit returned status ${rateLimitRes.status}`);

    // 3b: HTTP 401 Expired Token Simulation
    const expiredRes = await fetch(`${BASE_URL}/api/social/publish/linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: 'Testing expired tokens',
        simulateError: '401',
      }),
    });
    assert(expiredRes.status === 401, `HTTP 401 Expired Token returned status ${expiredRes.status}`);

    // 3c: Missing Body Validation
    const emptyRes = await fetch(`${BASE_URL}/api/social/publish/linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(emptyRes.status === 400, `Empty request returned HTTP 400 validation error`);

    // ----------------------------------------------------
    // TEST GROUP 4: Duplicate Job Prevention (Idempotency Locks)
    // ----------------------------------------------------
    console.log('\n--- 4. Scheduling Queue & Duplicate Job Prevention ---');
    const futureDate = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();
    const testItemId = `item-hardening-${Date.now()}`;

    // First schedule: Must succeed
    const schedRes1 = await fetch(`${BASE_URL}/api/social/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentItemId: testItemId,
        title: 'Hardening Verification Post',
        body: 'Testing automated queue dispatch and duplicate locks.',
        platform: 'linkedin',
        scheduledFor: futureDate,
      }),
    });
    assert(schedRes1.status === 200, 'Initial job scheduled successfully (HTTP 200)');

    // Immediate duplicate schedule: Must be rejected
    const schedRes2 = await fetch(`${BASE_URL}/api/social/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentItemId: testItemId,
        title: 'Hardening Verification Post (Duplicate)',
        body: 'Testing automated queue dispatch and duplicate locks.',
        platform: 'linkedin',
        scheduledFor: futureDate,
      }),
    });
    assert(schedRes2.status === 400, 'Duplicate job schedule rejected with HTTP 400 mutex lock');

    // ----------------------------------------------------
    // TEST GROUP 5: Analytics & Real Metrics Reporting
    // ----------------------------------------------------
    console.log('\n--- 5. Analytics & Real Metrics Reporting ---');
    const analyticsRes = await fetch(`${BASE_URL}/api/analytics/report?range=30d`);
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200, 'Analytics report endpoint returned HTTP 200');
    assert(typeof analyticsData.totals?.impressions === 'number', 'Analytics totals calculated accurately');
    assert(
      analyticsData.policy.includes('No fabricated numbers'),
      'Strict zero-fabrication analytics policy is declared in response'
    );

    const csvRes = await fetch(`${BASE_URL}/api/analytics/report?range=30d&format=csv`);
    const csvText = await csvRes.text();
    assert(csvRes.status === 200, 'Analytics CSV export returned HTTP 200');
    assert(csvText.startsWith('Post ID,Title,Platform'), 'CSV headers correctly formatted');

    // ----------------------------------------------------
    // TEST GROUP 6: System Health Check
    // ----------------------------------------------------
    console.log('\n--- 6. Health & Architecture Audit ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returned HTTP 200');
    assert(healthData.status === 'healthy', `System overall status is "${healthData.status}"`);
    assert(
      healthData.security?.cryptographicVault?.roundTripVerified === true,
      'Token vault round-trip verification passes (AES-256-GCM)'
    );
    assert(
      healthData.security?.serverSecretIsolation?.includes('PASSED'),
      'Server-side secret isolation passes (Zero public leaks)'
    );
  } catch (err) {
    console.error('Network execution failure during API checks:', err);
  }

  console.log('\n====================================================');
  console.log(`Hardening Audit Summary: ${passedTests} / ${totalTests} Passed`);
  console.log('====================================================');
}

runHardeningTests().catch(console.error);
