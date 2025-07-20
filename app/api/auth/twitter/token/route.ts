/*eslint-disable*/
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, codeChallenge, redirectUri } = await request.json();

    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Twitter credentials not configured' },
        { status: 500 }
      );
    }

    console.log('🐦 Exchanging Twitter authorization code for tokens...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeChallenge,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('🐦 Twitter token exchange failed:', errorData);
      return NextResponse.json(
        { 
          error: 'Token exchange failed',
          details: errorData.error_description || errorData.error || 'Unknown error'
        },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('🐦 Twitter token exchange successful');

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });
  } catch (error) {
    console.error('🐦 Twitter token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Token exchange failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
