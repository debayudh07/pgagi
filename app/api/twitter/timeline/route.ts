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

    const { searchParams } = new URL(request.url);
    const maxResults = searchParams.get('maxResults') || '10';
    const excludeReplies = searchParams.get('excludeReplies') === 'true';

    console.log('🐦 Fetching home timeline...');

    // Build query parameters for home timeline
    const queryParams = new URLSearchParams({
      max_results: maxResults,
      'tweet.fields': 'created_at,public_metrics,attachments,context_annotations,entities,author_id',
      'user.fields': 'username,name,profile_image_url',
      expansions: 'author_id,attachments.media_keys',
      'media.fields': 'url,preview_image_url',
    });

    if (excludeReplies) {
      queryParams.set('exclude', 'replies');
    }

    // Note: Twitter API v2 home timeline endpoint requires special permissions
    // For now, we'll fetch user tweets as a substitute since home timeline
    // requires elevated access which most apps don't have
    
    // First get user ID
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': authorization,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Fetch user's own tweets (since home timeline requires special access)
    const timelineResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': authorization,
        },
      }
    );

    if (!timelineResponse.ok) {
      const errorData = await timelineResponse.json().catch(() => ({}));
      console.error('🐦 Twitter timeline fetch failed:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to fetch timeline',
          details: errorData.detail || errorData.title || 'Unknown error'
        },
        { status: timelineResponse.status }
      );
    }

    const timelineData = await timelineResponse.json();
    
    // Transform timeline tweets to our format
    const transformedTweets = timelineData.data?.map((tweet: any) => {
      const media = timelineData.includes?.media?.find((m: any) => 
        tweet.attachments?.media_keys?.includes(m.media_key)
      );

      const author = timelineData.includes?.users?.find((u: any) => u.id === tweet.author_id);

      return {
        id: `twitter-${tweet.id}`,
        type: 'social',
        platform: 'twitter',
        title: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
        description: tweet.text,
        image: media?.url || media?.preview_image_url,
        url: `https://twitter.com/${author?.username || 'unknown'}/status/${tweet.id}`,
        publishedAt: tweet.created_at,
        username: author?.username || 'unknown',
        likes: tweet.public_metrics?.like_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        hashtags: tweet.entities?.hashtags?.map((h: any) => h.tag) || [],
      };
    }) || [];

    console.log(`🐦 Fetched ${transformedTweets.length} timeline tweets`);
    
    return NextResponse.json({
      data: transformedTweets,
      totalResults: timelineData.meta?.result_count || transformedTweets.length,
    });
  } catch (error) {
    console.error('🐦 Twitter timeline fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch timeline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
