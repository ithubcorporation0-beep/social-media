import { NextResponse } from 'next/server';
import { encryptToken, decryptToken } from '@/lib/security/tokenVault';

export async function GET() {
  try {
    // 1. Audit server-side secret isolation: ensure no secrets are exposed via NEXT_PUBLIC_
    const envKeys = Object.keys(process.env);
    const leakedPublicSecrets = envKeys.filter(
      (k) =>
        k.startsWith('NEXT_PUBLIC_') &&
        (k.includes('SECRET') || k.includes('SERVICE_ROLE') || k.includes('KEY_PRIVATE'))
    );

    // 2. Cryptographic vault round-trip test
    let vaultHealthy = false;
    let vaultLatencyMs = 0;
    try {
      const startVault = performance.now();
      const testSecret = 'socialhub_audit_sample_payload';
      const encrypted = encryptToken(testSecret);
      const decrypted = decryptToken(encrypted);
      vaultLatencyMs = Math.round((performance.now() - startVault) * 100) / 100;
      vaultHealthy = decrypted === testSecret;
    } catch {
      vaultHealthy = false;
    }

    // 3. Check configured provider credentials (presence only, never value)
    const providerStatus = {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      adzuna: !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      security: {
        serverSecretIsolation: leakedPublicSecrets.length === 0 ? 'PASSED (Zero Leaks)' : 'FAILED',
        leakedVariableCount: leakedPublicSecrets.length,
        cryptographicVault: {
          algorithm: 'AES-256-GCM',
          roundTripVerified: vaultHealthy,
          latencyMs: vaultLatencyMs,
        },
        rowLevelSecurityTarget: 'Supabase PostgreSQL (auth.uid() = user_id)',
        credentialsDetected: providerStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message || 'Internal health check failure',
      },
      { status: 500 }
    );
  }
}
