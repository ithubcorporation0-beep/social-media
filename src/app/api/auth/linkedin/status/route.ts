import { NextRequest, NextResponse } from 'next/server';
import {
  inspectLinkedInIntegrationHealth,
  disconnectLinkedInAccount,
  getLinkedInOAuthConfig,
} from '@/lib/integrations/linkedin';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const health = inspectLinkedInIntegrationHealth();
    const config = getLinkedInOAuthConfig(origin);

    return NextResponse.json({
      success: true,
      integration: 'linkedin',
      apiConfigured: Boolean(
        config.clientId &&
        config.clientId !== 'your_linkedin_client_id' &&
        config.clientSecret &&
        config.clientSecret !== 'your_linkedin_client_secret'
      ),
      redirectUri: config.redirectUri,
      ...health,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to inspect LinkedIn status' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const disconnected = disconnectLinkedInAccount();
    return NextResponse.json({
      success: true,
      disconnected,
      message: 'LinkedIn account and encrypted tokens revoked and purged from server vault.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'disconnect') {
      const disconnected = disconnectLinkedInAccount();
      return NextResponse.json({
        success: true,
        disconnected,
        message: 'LinkedIn credentials successfully purged from server memory.',
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: 'disconnect'.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
