import { NextRequest, NextResponse } from 'next/server';
import { inspectMetaHealth, disconnectMetaAccount, getMetaOAuthConfig } from '@/lib/integrations/meta';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const health = inspectMetaHealth();
    const config = getMetaOAuthConfig(origin);

    return NextResponse.json({
      success: true,
      integration: 'meta',
      isConfigured: Boolean(config.appId && config.appId !== 'your_meta_app_id'),
      ...health,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Status failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'disconnect') {
      const disconnected = disconnectMetaAccount();
      return NextResponse.json({
        success: true,
        disconnected,
        message: 'Meta credentials purged from server vault.',
      });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Disconnect failed' },
      { status: 500 }
    );
  }
}
