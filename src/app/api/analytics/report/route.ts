import { NextRequest, NextResponse } from 'next/server';
import { initialAnalyticsItems } from '@/data/mockDashboardData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || 'all';
    const range = searchParams.get('range') || '30d';
    const format = searchParams.get('format');

    let filtered = initialAnalyticsItems;
    if (platform !== 'all') {
      filtered = filtered.filter((i) => i.platform === platform);
    }

    const now = new Date();
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.publishedAt);
      const diffDays = Math.ceil((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      if (range === '7d' && diffDays > 7) return false;
      if (range === '30d' && diffDays > 30) return false;
      if (range === '90d' && diffDays > 90) return false;
      return true;
    });

    if (format === 'csv') {
      const headers = [
        'Post ID',
        'Title',
        'Platform',
        'Published Date',
        'Impressions',
        'Reach',
        'Likes',
        'Comments',
        'Clicks',
        'Status',
      ];
      const rows = filtered.map((item) => [
        item.postId,
        `"${item.postTitle.replace(/"/g, '""')}"`,
        item.platform.toUpperCase(),
        new Date(item.publishedAt).toISOString(),
        item.impressions !== null ? item.impressions : 'UNAVAILABLE',
        item.reach !== null ? item.reach : 'UNAVAILABLE',
        item.likes !== null ? item.likes : 'UNAVAILABLE',
        item.comments !== null ? item.comments : '0',
        item.clicks !== null ? item.clicks : '0',
        item.status,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="socialhub_analytics_${range}.csv"`,
        },
      });
    }

    const totalImpressions = filtered.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
    const totalReach = filtered.reduce((acc, curr) => acc + (curr.reach || 0), 0);
    const totalLikes = filtered.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = filtered.reduce((acc, curr) => acc + (curr.comments || 0), 0);
    const totalClicks = filtered.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

    return NextResponse.json({
      success: true,
      range,
      platform,
      count: filtered.length,
      totals: {
        impressions: totalImpressions,
        reach: totalReach,
        likes: totalLikes,
        comments: totalComments,
        clicks: totalClicks,
      },
      items: filtered,
      policy: 'No fabricated numbers. Unconnected metrics are explicitly labeled UNAVAILABLE.',
    });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate analytics report' },
      { status: 500 }
    );
  }
}
