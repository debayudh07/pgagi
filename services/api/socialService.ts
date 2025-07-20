import { SocialPost, ApiResponse } from '../../types';

export interface SocialApiParams {
  hashtag?: string;
  username?: string;
  platform?: 'instagram' | 'facebook';
  limit?: number;
}

export class SocialService {
  // Since real social media APIs require complex authentication and approval,
  // we'll provide a mock service that can be easily replaced with real implementations

  static async getFeedPosts(params: SocialApiParams = {}): Promise<ApiResponse<SocialPost[]>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockPosts = this.getMockPosts(params.platform);
      const filteredPosts = params.hashtag 
        ? mockPosts.filter(post => 
            post.hashtags?.some(tag => 
              tag.toLowerCase().includes(params.hashtag!.toLowerCase())
            )
          )
        : mockPosts;

      return {
        data: filteredPosts.slice(0, params.limit || 20),
        status: 'success',
        message: 'Using mock social media data',
      };
    } catch (error) {
      console.error('Social API Error:', error);
      
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch social media posts',
      };
    }
  }

  static async searchPosts(query: string, platform?: 'instagram' | 'facebook'): Promise<ApiResponse<SocialPost[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const mockPosts = this.getMockPosts(platform);
      const searchResults = mockPosts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description?.toLowerCase().includes(query.toLowerCase()) ||
        post.hashtags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      return {
        data: searchResults,
        status: 'success',
        message: 'Using mock search results',
      };
    } catch (error) {
      console.error('Social Search Error:', error);
      return {
        data: [],
        status: 'error',
        message: 'Search failed',
      };
    }
  }

  static async getTrendingPosts(platform?: 'instagram' | 'facebook'): Promise<ApiResponse<SocialPost[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const mockPosts = this.getMockPosts(platform);
      // Sort by engagement (likes + comments) for trending
      const trendingPosts = mockPosts
        .sort((a, b) => ((b.likes || 0) + (b.comments || 0)) - ((a.likes || 0) + (a.comments || 0)))
        .slice(0, 10);

      return {
        data: trendingPosts,
        status: 'success',
        message: 'Using mock trending data',
      };
    } catch (error) {
      console.error('Trending Posts Error:', error);
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch trending posts',
      };
    }
  }

  private static getMockPosts(platform?: 'instagram' | 'facebook'): SocialPost[] {
    const allPosts: SocialPost[] = [
      {
        id: 'social2',
        type: 'social',
        platform: 'instagram',
        title: 'Beautiful sunset from my workspace',
        description: 'Nothing beats coding with a view like this! Remote work has its perks. What\'s your ideal workspace? #remotework #coding #sunset #worklife',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        url: 'https://instagram.com/p/example1',
        publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        username: 'codeandchill',
        likes: 284,
        comments: 31,
        hashtags: ['remotework', 'coding', 'sunset', 'worklife'],
      },
      {
        id: 'social4',
        type: 'social',
        platform: 'instagram',
        title: 'Coffee and code session',
        description: 'Starting the day with some fresh coffee and clean code. Today\'s mission: building something awesome! ☕️💻 #coding #coffee #developer #morning',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        url: 'https://instagram.com/p/example2',
        publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        username: 'morningcoder',
        likes: 189,
        comments: 15,
        hashtags: ['coding', 'coffee', 'developer', 'morning'],
      },
      {
        id: 'social5',
        type: 'social',
        platform: 'facebook',
        title: 'Tech meetup was incredible!',
        description: 'Just attended an amazing tech meetup about machine learning. Met so many brilliant minds and learned about the latest trends in AI. Already planning to implement some of these ideas in my next project!',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        url: 'https://facebook.com/example/posts/1',
        publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        username: 'aiethusiast',
        likes: 92,
        comments: 18,
        hashtags: ['machinelearning', 'AI', 'meetup', 'networking'],
      },
    ];

    return platform 
      ? allPosts.filter(post => post.platform === platform)
      : allPosts;
  }
}
