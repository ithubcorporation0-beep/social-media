import { NextRequest, NextResponse } from 'next/server';
import { 
  getEffectiveFacebookCredentials, 
  setCustomFacebookPageCredentials, 
  clearCustomFacebookCredentials,
  checkFacebookTokenPermissions,
  getFacebookManagedPages
} from '@/lib/integrations/meta';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const creds = getEffectiveFacebookCredentials();
    return NextResponse.json({
      success: true,
      hasToken: creds.hasToken,
      pageId: creds.pageId,
      pageName: 'IZBA Marketing agency',
      tokenSource: creds.tokenSource,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, pageId = '61551470574335', action } = body;

    if (action === 'clear') {
      clearCustomFacebookCredentials();
      return NextResponse.json({ success: true, message: 'Facebook credentials cleared from runtime.' });
    }

    if (!token || typeof token !== 'string' || token.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'A valid Facebook Page Access Token is required.' },
        { status: 400 }
      );
    }

    const trimmedToken = token.trim();
    const targetPageId = pageId.trim();

    // 1. Verify token live with Meta Graph API
    let metaPageName = 'IZBA Marketing agency';
    let availablePages: any[] = [];
    let missingManagePosts = false;

    try {
      // Check permissions
      const permCheck = await checkFacebookTokenPermissions(trimmedToken);
      missingManagePosts = permCheck.missingManagePosts;

      // Get user's managed pages
      availablePages = await getFacebookManagedPages(trimmedToken);

      const meRes = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${trimmedToken}`
      );
      const meData = await meRes.json();
      if (!meRes.ok || meData.error) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Facebook Token Rejected: ${meData.error?.message || 'Invalid access token'}` 
          },
          { status: 400 }
        );
      }
      metaPageName = meData.name || metaPageName;
    } catch (networkErr: any) {
      console.warn('Network check skipped:', networkErr.message);
    }

    if (missingManagePosts) {
      return NextResponse.json(
        {
          success: false,
          missingPermission: 'pages_manage_posts',
          availablePages,
          error: "Permission Missing: 'pages_manage_posts'. In Graph API Explorer under Permissions, add 'pages_manage_posts' and click Generate Access Token.",
        },
        { status: 400 }
      );
    }

    // 2. Set runtime memory token
    setCustomFacebookPageCredentials(trimmedToken, targetPageId);

    // 3. Persist to .env.local if file exists
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      // Replace or append FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID
      if (/FACEBOOK_PAGE_ACCESS_TOKEN=.*/.test(envContent)) {
        envContent = envContent.replace(
          /FACEBOOK_PAGE_ACCESS_TOKEN=.*/,
          `FACEBOOK_PAGE_ACCESS_TOKEN=${trimmedToken}`
        );
      } else {
        envContent += `\nFACEBOOK_PAGE_ACCESS_TOKEN=${trimmedToken}\n`;
      }

      if (/FACEBOOK_PAGE_ID=.*/.test(envContent)) {
        envContent = envContent.replace(/FACEBOOK_PAGE_ID=.*/, `FACEBOOK_PAGE_ID=${targetPageId}`);
      } else {
        envContent += `FACEBOOK_PAGE_ID=${targetPageId}\n`;
      }

      fs.writeFileSync(envPath, envContent, 'utf8');
    } catch (fileErr) {
      console.warn('Could not write to .env.local directly:', fileErr);
    }

    return NextResponse.json({
      success: true,
      message: `Verified and connected to "${metaPageName}" (Page ID: ${targetPageId}) successfully!`,
      pageId: targetPageId,
      pageName: metaPageName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to configure token.' },
      { status: 500 }
    );
  }
}
