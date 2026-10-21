import { NextRequest, NextResponse } from 'next/server';
import { publishToLinkedIn } from '@/lib/integrations/linkedin';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);

    if (!payload || !payload.body) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: "body" (post content).',
        },
        { status: 400 }
      );
    }

    const { body, idempotencyKey, simulateError } = payload;

    const result = await publishToLinkedIn({
      body,
      idempotencyKey,
      simulateError,
    });

    return NextResponse.json({
      message: 'Post successfully published to LinkedIn.',
      ...result,
    });
  } catch (error: any) {
    console.error('LinkedIn Publishing Error:', error.message);

    // Map error strings to appropriate HTTP status codes
    let status = 400;
    if (error.message.includes('401') || error.message.includes('expired') || error.message.includes('revoked')) {
      status = 401;
    } else if (error.message.includes('403') || error.message.includes('Missing required scope')) {
      status = 403;
    } else if (error.message.includes('429') || error.message.includes('Rate limit')) {
      status = 429;
    } else if (error.message.includes('500') || error.message.includes('Security Error')) {
      status = 500;
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while publishing to LinkedIn.',
      },
      { status }
    );
  }
}
