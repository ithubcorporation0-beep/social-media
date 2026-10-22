import { NextRequest, NextResponse } from 'next/server';
import { publishToFacebookPage } from '@/lib/integrations/meta';

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

    const { body, mediaUrl } = payload;

    const result = await publishToFacebookPage(body, mediaUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to publish to Facebook Page.',
          requiresToken: Boolean(result.requiresToken),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post successfully published to Facebook Page.',
      postId: result.postId,
      postUrl: result.postUrl,
    });
  } catch (error: any) {
    console.error('Facebook Publishing Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while publishing to Facebook.',
      },
      { status: 500 }
    );
  }
}
