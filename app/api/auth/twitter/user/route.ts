/*eslint-disable*/
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'No authorization header provided' },
        { status: 401 }
      );
    }

    console.log('🐦 Fetching Twitter user info...');

    // Fetch user info from Twitter API
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,public_metrics', {
      headers: {
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🐦 Twitter user info fetch failed:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to fetch user info',
          details: errorData.detail || errorData.title || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🐦 Twitter user info fetched successfully');
    
    return NextResponse.json(data.data);
  } catch (error) {
    console.error('🐦 Twitter user info error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get user info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
