/*eslint-disable*/
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Twitter OAuth error:', error);
      // Redirect to dashboard with error
      return NextResponse.redirect(new URL('/dashboard?twitter_error=' + encodeURIComponent(error), request.url));
    }

    if (!code || !state) {
      console.error('Missing code or state in Twitter callback');
      return NextResponse.redirect(new URL('/dashboard?twitter_error=missing_parameters', request.url));
    }

    // Redirect to dashboard with the code and state
    // The client-side code will handle the token exchange
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('twitter_code', code);
    dashboardUrl.searchParams.set('twitter_state', state);
    
    return NextResponse.redirect(dashboardUrl);

  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?twitter_error=callback_error', request.url));
  }
}
