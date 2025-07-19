import { NextRequest, NextResponse } from 'next/server';

const MEDIASTACK_API_KEY = process.env.NEXT_PUBLIC_MEDIASTACK_API_KEY || 'c21e975c2f1c30087206eed778615d32';
const MEDIASTACK_API_URL = 'https://api.mediastack.com/v1/news';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const country = searchParams.get('country') || 'in';
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';

    console.log('📡 MediaStack API Request:', { country, category, q, page, pageSize });

    // Build MediaStack API URL
    const apiParams = new URLSearchParams({
      access_key: MEDIASTACK_API_KEY,
      countries: country,
      limit: pageSize,
      offset: String((parseInt(page) - 1) * parseInt(pageSize)),
      sort: 'published_desc',
    });

    if (category) {
      apiParams.append('categories', category);
    }

    if (q) {
      apiParams.append('keywords', q);
    }

    const apiUrl = `${MEDIASTACK_API_URL}?${apiParams.toString()}`;
    console.log('📡 Calling MediaStack:', apiUrl.replace(MEDIASTACK_API_KEY, '***API_KEY***'));

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
    console.log('📡 MediaStack Response:', { 
      dataCount: data.data?.length || 0, 
      total: data.pagination?.total || 0,
      error: data.error?.message || null 
    });

    // Check for API errors
    if (data.error) {
      throw new Error(`MediaStack API Error: ${data.error.message}`);
    }

    return NextResponse.json({
      status: 'success',
      data: data.data || [],
      totalResults: data.pagination?.total || 0,
      message: null,
    });

  } catch (error) {
    console.error('📡 MediaStack API Error:', error);
    
    return NextResponse.json({
      status: 'error',
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch news',
    }, { status: 500 });
  }
}
