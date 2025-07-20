/*eslint-disable*/
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { redirectUri } = await request.json();

    if (!process.env.TWITTER_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Twitter client ID not configured' },
        { status: 500 }
      );
    }

    // Generate state and code challenge for PKCE
    const state = crypto.randomBytes(32).toString('base64url');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // Build Twitter OAuth 2.0 authorization URL
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', process.env.TWITTER_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'tweet.read users.read follows.read like.read offline.access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('🐦 Generated Twitter auth URL:', authUrl.toString());

    return NextResponse.json({
      authUrl: authUrl.toString(),
      state,
      codeChallenge: codeVerifier, // Client will store this for token exchange
    });
  } catch (error) {
    console.error('🐦 Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
