import { ContentItem, ApiResponse } from '../types';
import { NewsService } from './api/newsService';
import { MovieService } from './api/movieService';
import { MusicService } from './api/musicService';
import { SocialService } from './api/socialService';

export class ContentService {
  static async getPersonalizedFeed(preferences: {
    categories: string[];
    feedSettings: {
      newsEnabled: boolean;
      moviesEnabled: boolean;
      musicEnabled: boolean;
      socialEnabled: boolean;
    };
  }): Promise<ApiResponse<ContentItem[]>> {
    try {
      const promises: Promise<ApiResponse<ContentItem[]>>[] = [];

      // Fetch news based on categories
      if (preferences.feedSettings.newsEnabled) {
        preferences.categories.forEach(category => {
          promises.push(
            NewsService.getTopHeadlines({ category }).then(response => ({
              ...response,
              data: response.data.slice(0, 5), // Limit each category
            }))
          );
        });
      }

      // Fetch movies
      if (preferences.feedSettings.moviesEnabled) {
        promises.push(
          MovieService.getPopularMovies().then(response => ({
            ...response,
            data: response.data.slice(0, 6),
          }))
        );
      }

      // Fetch music
      if (preferences.feedSettings.musicEnabled) {
        promises.push(
          MusicService.getTopTracks().then(response => ({
            ...response,
            data: response.data.slice(0, 6),
          }))
        );
      }

      // Fetch social posts
      if (preferences.feedSettings.socialEnabled) {
        promises.push(
          SocialService.getFeedPosts({ limit: 8 }).then(response => ({
            ...response,
            data: response.data.slice(0, 8),
          }))
        );
      }

      const results = await Promise.allSettled(promises);
      const allContent: ContentItem[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.data) {
          allContent.push(...result.value.data);
        }
      });

      // Shuffle the content for a mixed feed
      const shuffledContent = this.shuffleArray(allContent);

      return {
        data: shuffledContent,
        status: 'success',
        totalResults: shuffledContent.length,
      };
    } catch (error) {
      console.error('Feed Error:', error);
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch personalized feed',
      };
    }
  }

  static async getTrendingContent(): Promise<ApiResponse<ContentItem[]>> {
    try {
      const [newsResult, moviesResult, musicResult, socialResult] = await Promise.allSettled([
        NewsService.getTopHeadlines({ pageSize: 5 }),
        MovieService.getTrendingMovies(),
        MusicService.getTrendingTracks(),
        SocialService.getTrendingPosts(),
      ]);

      const allContent: ContentItem[] = [];

      if (newsResult.status === 'fulfilled') {
        allContent.push(...newsResult.value.data.slice(0, 3));
      }
      if (moviesResult.status === 'fulfilled') {
        allContent.push(...moviesResult.value.data.slice(0, 3));
      }
      if (musicResult.status === 'fulfilled') {
        allContent.push(...musicResult.value.data.slice(0, 3));
      }
      if (socialResult.status === 'fulfilled') {
        allContent.push(...socialResult.value.data.slice(0, 3));
      }

      return {
        data: this.shuffleArray(allContent),
        status: 'success',
        totalResults: allContent.length,
      };
    } catch (error) {
      console.error('Trending Content Error:', error);
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch trending content',
      };
    }
  }

  static async searchAllContent(query: string): Promise<ApiResponse<ContentItem[]>> {
    try {
      const [newsResult, moviesResult, musicResult, socialResult] = await Promise.allSettled([
        NewsService.searchNews(query),
        MovieService.searchMovies(query),
        MusicService.searchTracks(query),
        SocialService.searchPosts(query),
      ]);

      const allContent: ContentItem[] = [];

      if (newsResult.status === 'fulfilled') {
        allContent.push(...newsResult.value.data);
      }
      if (moviesResult.status === 'fulfilled') {
        allContent.push(...moviesResult.value.data);
      }
      if (musicResult.status === 'fulfilled') {
        allContent.push(...musicResult.value.data);
      }
      if (socialResult.status === 'fulfilled') {
        allContent.push(...socialResult.value.data);
      }

      return {
        data: allContent,
        status: 'success',
        totalResults: allContent.length,
      };
    } catch (error) {
      console.error('Search Error:', error);
      return {
        data: [],
        status: 'error',
        message: 'Search failed',
      };
    }
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
