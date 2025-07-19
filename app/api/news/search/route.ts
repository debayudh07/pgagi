import { NextRequest, NextResponse } from 'next/server';

const MEDIASTACK_API_KEY = process.env.NEXT_PUBLIC_MEDIASTACK_API_KEY || 'c21e975c2f1c30087206eed778615d32';
const MEDIASTACK_API_URL = 'https://api.mediastack.com/v1/news';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const q = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';

    if (!q) {
      return NextResponse.json({
        status: 'error',
        data: [],
        message: 'Search query is required',
      }, { status: 400 });
    }

    // Build MediaStack API URL for search
    const apiParams = new URLSearchParams({
      access_key: MEDIASTACK_API_KEY,
      keywords: q,
      limit: pageSize,
      offset: String((parseInt(page) - 1) * parseInt(pageSize)),
      sort: 'published_desc',
      countries: 'in', // Default to India for search as well
    });

    const apiUrl = `${MEDIASTACK_API_URL}?${apiParams.toString()}`;

    // Fetch from MediaStack API
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'PGAgi-NewsApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`MediaStack API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'success',
      data: data.data || [],
      totalResults: data.pagination?.total || 0,
      message: data.error?.message || null,
    });

  } catch (error) {
    console.error('MediaStack Search API Error:', error);
    
    return NextResponse.json({
      status: 'error',
      data: [],
      message: error instanceof Error ? error.message : 'Failed to search news',
    }, { status: 500 });
  }
}
