/*eslint-disable*/
import { SocialPost, ApiResponse } from '../../types';

// Twitter API configuration - No hardcoded credentials
const TWITTER_CONFIG = {
  getRedirectUri: () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/auth/twitter/callback`;
    }
    return '/api/auth/twitter/callback'; // fallback for SSR
  },
};

export interface TwitterApiParams {
  maxResults?: number;
  excludeReplies?: boolean;
  includeRetweets?: boolean;
}

export class TwitterService {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;
  private static userId: string | null = null;

  // Initialize Twitter OAuth 2.0 authentication
  static initializeAuth() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('twitter_access_token');
      this.refreshToken = localStorage.getItem('twitter_refresh_token');
      this.userId = localStorage.getItem('twitter_user_id');
    }
  }

  // Generate Twitter OAuth 2.0 authorization URL via backend
  static async getAuthUrl(): Promise<string> {
    try {
      const response = await fetch('/api/auth/twitter/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectUri: TWITTER_CONFIG.getRedirectUri(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const data = await response.json();
      
      // Store state and code challenge for verification
      if (typeof window !== 'undefined') {
        localStorage.setItem('twitter_oauth_state', data.state);
        localStorage.setItem('twitter_code_challenge', data.codeChallenge);
      }

      return data.authUrl;
    } catch (error) {
      console.error('Error getting Twitter auth URL:', error);
      throw error;
    }
  }

  // Handle OAuth callback and exchange code for tokens
  static async handleCallback(code: string, state: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      const storedState = localStorage.getItem('twitter_oauth_state');
      const codeChallenge = localStorage.getItem('twitter_code_challenge');

      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      const response = await fetch('/api/auth/twitter/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          codeChallenge,
          redirectUri: TWITTER_CONFIG.getRedirectUri(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Token exchange failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      
      // Store tokens securely
      localStorage.setItem('twitter_access_token', this.accessToken!);
      if (this.refreshToken) {
        localStorage.setItem('twitter_refresh_token', this.refreshToken);
      }

      // Get user info
      await this.getUserInfo();

      // Clean up OAuth state
      localStorage.removeItem('twitter_oauth_state');
      localStorage.removeItem('twitter_code_challenge');

      return true;
    } catch (error) {
      console.error('Twitter auth callback error:', error);
      return false;
    }
  }

  // Get user information via backend proxy
  static async getUserInfo(): Promise<any> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/auth/twitter/user', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const data = await response.json();
      this.userId = data.id;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('twitter_user_id', this.userId!);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.accessToken && !!this.userId;
  }

  // Get user's tweets via backend API
  static async getUserTweets(params: TwitterApiParams = {}): Promise<ApiResponse<SocialPost[]>> {
    try {
      if (!this.isAuthenticated()) {
        return {
          data: [],
          status: 'error',
          message: 'User not authenticated',
          requiresAuth: true,
        };
      }

      const queryParams = new URLSearchParams({
        maxResults: String(params.maxResults || 10),
        excludeReplies: String(params.excludeReplies || false),
        includeRetweets: String(params.includeRetweets || true),
      });

      const response = await fetch(
        `/api/twitter/tweets?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`🐦 TwitterService: Fetched ${data.data?.length || 0} tweets`);
      
      return {
        data: data.data || [],
        status: 'success',
        totalResults: data.totalResults || 0,
      };
    } catch (error) {
      console.error('🐦 Twitter API Error:', error);
      
      return {
        data: [],
        status: 'error',
        message: `Twitter API unavailable: ${error}`,
        requiresAuth: true,
      };
    }
  }

  // Get user's home timeline via backend API
  static async getHomeTimeline(params: TwitterApiParams = {}): Promise<ApiResponse<SocialPost[]>> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const queryParams = new URLSearchParams({
        maxResults: String(params.maxResults || 10),
        excludeReplies: String(params.excludeReplies || false),
        includeRetweets: String(params.includeRetweets || true),
      });

      const response = await fetch(
        `/api/twitter/timeline?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter timeline error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data: data.data || [],
        status: 'success',
        totalResults: data.totalResults || 0,
      };
    } catch (error) {
      console.error('🐦 Twitter Home Timeline Error:', error);
      
      return {
        data: this.getMockTwitterPosts(),
        status: 'error',
        message: `Twitter timeline unavailable: ${error}`,
      };
    }
  }

  // Get trending Twitter content for trending section
  static async getTrendingTwitterPosts(params: TwitterApiParams = {}): Promise<ApiResponse<SocialPost[]>> {
    try {
      console.log('🔥 TwitterService: Fetching trending Twitter posts...');
      
      let trendingPosts: SocialPost[] = [];

      // Only try to fetch real data if user is authenticated
      if (this.isAuthenticated()) {
        try {
          console.log('🔥 TwitterService: User is authenticated, fetching real tweets...');
          // Get user tweets as trending content when authenticated
          const result = await this.getUserTweets({
            ...params,
            maxResults: params.maxResults || 8,
            excludeReplies: true,
          });

          if (result.status === 'success' && result.data.length > 0) {
            // Mark these as trending
            trendingPosts = result.data.map(post => ({
              ...post,
              id: `trending-${post.id}`,
              title: `🔥 ${post.title}`,
            }));
            
            console.log(`🔥 TwitterService: Fetched ${trendingPosts.length} authenticated trending Twitter posts`);
          }
        } catch (authError) {
          console.warn('🔥 Failed to fetch authenticated tweets:', authError);
          return {
            data: [],
            status: 'error',
            totalResults: 0,
            message: 'Twitter API error - please re-authenticate',
            requiresAuth: true,
          };
        }
      } else {
        console.log('🔥 TwitterService: User not authenticated');
        return {
          data: [],
          status: 'error',
          totalResults: 0,
          message: 'Twitter authentication required',
          requiresAuth: true,
        };
      }

      console.log(`🔥 TwitterService: Total trending posts: ${trendingPosts.length}`);
      
      return {
        data: trendingPosts,
        status: 'success',
        totalResults: trendingPosts.length,
        message: 'Authenticated Twitter posts',
        requiresAuth: false,
      };
    } catch (error) {
      console.error('🔥 Twitter Trending Error:', error);
      
      return {
        data: [],
        status: 'error',
        totalResults: 0,
        message: `Twitter service unavailable: ${error}`,
        requiresAuth: true,
      };
    }
  }

  // Logout and clear tokens
  static logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.userId = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('twitter_access_token');
      localStorage.removeItem('twitter_refresh_token');
      localStorage.removeItem('twitter_user_id');
      localStorage.removeItem('twitter_oauth_state');
      localStorage.removeItem('twitter_code_challenge');
    }
  }

  // Mock data for development/fallback
  private static getMockTwitterPosts(): SocialPost[] {
    return [
      {
        id: 'twitter-mock-1',
        type: 'social',
        platform: 'twitter',
        title: 'Just shipped a new feature! 🚀',
        description: 'Excited to announce our latest AI-powered dashboard feature. The personalization capabilities are incredible! Working late nights finally paid off 💪 #AI #webdev #innovation #coding #startup',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        url: 'https://twitter.com/user/status/1',
        publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        username: 'yourhandle',
        likes: 42,
        comments: 8,
        hashtags: ['AI', 'webdev', 'innovation', 'coding', 'startup'],
      },
      {
        id: 'twitter-mock-2',
        type: 'social',
        platform: 'twitter',
        title: 'Coffee and code session ☕️',
        description: 'Perfect Saturday morning: fresh coffee, clean code, and unlimited possibilities. What are you building this weekend? Drop your projects below! 👇 #coding #weekend #coffee #programming #dev',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        url: 'https://twitter.com/user/status/2',
        publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        username: 'yourhandle',
        likes: 156,
        comments: 23,
        hashtags: ['coding', 'weekend', 'coffee', 'programming', 'dev'],
      },
      {
        id: 'twitter-mock-3',
        type: 'social',
        platform: 'twitter',
        title: 'Learning React hooks like... 🎣',
        description: 'useState, useEffect, useContext... Mind = blown 🤯 The more I learn React, the more I love it! Any hook recommendations for a growing developer? #React #JavaScript #hooks #learning #webdev',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        url: 'https://twitter.com/user/status/3',
        publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        username: 'yourhandle',
        likes: 89,
        comments: 15,
        hashtags: ['React', 'JavaScript', 'hooks', 'learning', 'webdev'],
      },
      {
        id: 'twitter-mock-4',
        type: 'social',
        platform: 'twitter',
        title: 'Debug session victory! 🎉',
        description: 'After 3 hours of debugging, I finally found the issue... it was a missing semicolon 😅 Sometimes the smallest things cause the biggest headaches! #debugging #coding #programming #developer #life',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
        url: 'https://twitter.com/user/status/4',
        publishedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        username: 'yourhandle',
        likes: 234,
        comments: 45,
        hashtags: ['debugging', 'coding', 'programming', 'developer', 'life'],
      },
    ];
  }

  // Mock trending Twitter data
  private static getMockTrendingTwitterPosts(): SocialPost[] {
    return [
      {
        id: 'trending-twitter-1',
        type: 'social',
        platform: 'twitter',
        title: '🔥 AI breakthrough changes everything!',
        description: 'BREAKING: New AI model achieves human-level reasoning across all domains. The future is here! 🤖✨ This changes everything we know about artificial intelligence. Thread 🧵 #AI #TechNews #Future #Innovation #Breakthrough',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        url: 'https://twitter.com/techguru/status/trending1',
        publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        username: 'techguru',
        likes: 12500,
        comments: 847,
        hashtags: ['AI', 'TechNews', 'Future', 'Innovation', 'Breakthrough'],
      },
      {
        id: 'trending-twitter-2',
        type: 'social',
        platform: 'twitter',
        title: '🔥 Viral coding challenge goes global!',
        description: '🌍 The #100DaysOfCode challenge just hit 1 MILLION developers worldwide! Join the movement and transform your skills 💪 Day 1 starts NOW! Who\'s in? 🚀 #Coding #WebDev #Programming #100DaysOfCode',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        url: 'https://twitter.com/codinglife/status/trending2',
        publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        username: 'codinglife',
        likes: 8900,
        comments: 542,
        hashtags: ['100DaysOfCode', 'Coding', 'WebDev', 'Programming', 'Challenge'],
      },
      {
        id: 'trending-twitter-3',
        type: 'social',
        platform: 'twitter',
        title: '🔥 Next.js 15 announcement breaks internet!',
        description: '🚀 Next.js 15 is HERE! Revolutionary performance improvements, new React Server Components, and mind-blowing developer experience! The wait is over 🎉 #NextJS #React #WebDev #JavaScript #Frontend',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        url: 'https://twitter.com/nextjs/status/trending3',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        username: 'nextjs',
        likes: 15600,
        comments: 923,
        hashtags: ['NextJS', 'React', 'WebDev', 'JavaScript', 'Frontend'],
      },
      {
        id: 'trending-twitter-4',
        type: 'social',
        platform: 'twitter',
        title: '🔥 Open source project gets 100K stars!',
        description: '⭐ INCREDIBLE! Our open-source dashboard just hit 100,000 GitHub stars! Thank you to the amazing dev community! 🙏 This milestone means everything to us 💝 #OpenSource #GitHub #Community #Milestone',
        image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
        url: 'https://twitter.com/opensource/status/trending4',
        publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        username: 'opensource',
        likes: 7800,
        comments: 456,
        hashtags: ['OpenSource', 'GitHub', 'Community', 'Milestone', 'Stars'],
      },
      {
        id: 'trending-twitter-5',
        type: 'social',
        platform: 'twitter',
        title: '🔥 Tech CEO drops bombshell announcement!',
        description: '💣 JUST IN: Major tech company announces revolutionary quantum computing breakthrough! This will change computing forever 🌟 Press conference live now 📺 #QuantumComputing #TechNews #Innovation #Science',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        url: 'https://twitter.com/techceo/status/trending5',
        publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        username: 'techceo',
        likes: 25300,
        comments: 1547,
        hashtags: ['QuantumComputing', 'TechNews', 'Innovation', 'Science', 'Breakthrough'],
      },
      {
        id: 'trending-twitter-6',
        type: 'social',
        platform: 'twitter',
        title: '🔥 Developer creates game-changing app!',
        description: '🎮 Solo developer just released an app that\'s breaking the internet! 10 million downloads in 24 hours 📱💥 The power of indie development! Story in thread 👇 #IndyDev #AppDev #Viral #Success',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
        url: 'https://twitter.com/indiedev/status/trending6',
        publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        username: 'indiedev',
        likes: 18700,
        comments: 892,
        hashtags: ['IndyDev', 'AppDev', 'Viral', 'Success', 'Inspiration'],
      },
    ];
  }
}
