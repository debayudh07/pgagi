import { NewsArticle, ApiResponse } from '../../types';

// Use internal API route to avoid CORS issues with MediaStack
const NEWS_API_URL = '/api/news';

export interface NewsApiParams {
  category?: string;
  country?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export class NewsService {
  private static baseUrl = NEWS_API_URL;

  static async getTopHeadlines(params: NewsApiParams = {}): Promise<ApiResponse<NewsArticle[]>> {
    try {
      console.log('📰 Fetching news with params:', params);
      
      const searchParams = new URLSearchParams({
        country: params.country || 'in', // Default to India
        pageSize: String(params.pageSize || 20),
        page: String(params.page || 1),
        ...(params.category && { category: params.category }),
        ...(params.q && { q: params.q }),
      });

      const response = await fetch(`${this.baseUrl}?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('📰 API Response:', { 
        status: apiResponse.status, 
        dataCount: apiResponse.data?.length || 0,
        totalResults: apiResponse.totalResults 
      });

      if (apiResponse.status === 'error') {
        throw new Error(apiResponse.message || 'API returned error status');
      }

      // Transform MediaStack API response to our NewsArticle format
      const articles: NewsArticle[] = apiResponse.data?.map((article: any) => ({
        id: article.url || `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'news' as const,
        title: article.title || '',
        description: article.description || '',
        content: article.description || '', // MediaStack doesn't provide full content in free plan
        image: article.image || '',
        url: article.url || '',
        publishedAt: article.published_at || new Date().toISOString(),
        source: article.source || 'Unknown',
        author: article.author || 'Unknown',
        category: article.category || params.category || 'general',
      })) || [];

      console.log(`📰 Transformed ${articles.length} articles from MediaStack API`);
      
      return {
        data: articles,
        totalResults: apiResponse.totalResults || articles.length,
        status: 'success',
      };
    } catch (error) {
      console.error('📰 News API Error:', error);
      
      // Return mock data when API fails or in development
      const mockData = this.getMockNews(params.category);
      console.log(`📰 Falling back to ${mockData.length} mock articles`);
      
      return {
        data: mockData,
        status: 'success',
        message: 'Using mock data - MediaStack API unavailable',
      };
    }
  }

  static async searchNews(query: string, page = 1): Promise<ApiResponse<NewsArticle[]>> {
    try {
      console.log(`📰 Searching news for: "${query}" (page ${page})`);
      
      const searchParams = new URLSearchParams({
        q: query,
        page: String(page),
        pageSize: '20',
      });

      const response = await fetch(`${this.baseUrl}/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('📰 Search API Response:', { 
        status: apiResponse.status, 
        dataCount: apiResponse.data?.length || 0,
        totalResults: apiResponse.totalResults 
      });

      if (apiResponse.status === 'error') {
        throw new Error(apiResponse.message || 'Search API returned error status');
      }

      // Transform MediaStack API response to our NewsArticle format
      const articles: NewsArticle[] = apiResponse.data?.map((article: any) => ({
        id: article.url || `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'news' as const,
        title: article.title || '',
        description: article.description || '',
        content: article.description || '', // MediaStack doesn't provide full content in free plan
        image: article.image || '',
        url: article.url || '',
        publishedAt: article.published_at || new Date().toISOString(),
        source: article.source || 'Unknown',
        author: article.author || 'Unknown',
        category: 'search',
      })) || [];

      console.log(`📰 Search found ${articles.length} articles`);

      return {
        data: articles,
        totalResults: apiResponse.totalResults || articles.length,
        status: 'success',
      };
    } catch (error) {
      console.error('📰 News Search Error:', error);
      
      // Return filtered mock data for search
      const mockData = this.getMockNews().filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        (article.description && article.description.toLowerCase().includes(query.toLowerCase()))
      );

      console.log(`📰 Search fallback: ${mockData.length} mock articles for "${query}"`);

      return {
        data: mockData,
        status: 'success',
        message: 'Using mock data - MediaStack Search API unavailable',
      };
    }
  }

  private static getMockNews(category?: string): NewsArticle[] {
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        type: 'news',
        title: 'India Launches New Space Mission to Moon',
        description: 'ISRO successfully launches Chandrayaan-4 mission, marking another milestone in India\'s space exploration journey.',
        content: 'Full article content about India\'s space mission...',
        image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400',
        url: 'https://example.com/india-space-mission',
        publishedAt: new Date().toISOString(),
        source: 'The Times of India',
        author: 'Rajesh Kumar',
        category: category || 'science',
      },
      {
        id: '2',
        type: 'news',
        title: 'Delhi Metro Expands with New Green Line Extension',
        description: 'New metro stations operational, connecting more areas in the National Capital Region with eco-friendly transport.',
        content: 'Detailed coverage of Delhi Metro expansion...',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
        url: 'https://example.com/delhi-metro-news',
        publishedAt: new Date().toISOString(),
        source: 'Hindustan Times',
        author: 'Priya Sharma',
        category: category || 'general',
      },
      {
        id: '3',
        type: 'news',
        title: 'Monsoon Arrives Early in Kerala',
        description: 'Southwest monsoon makes early landfall in Kerala, bringing relief from the summer heat across South India.',
        image: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=400',
        url: 'https://example.com/monsoon-news',
        publishedAt: new Date().toISOString(),
        source: 'Indian Express',
        author: 'Amit Patel',
        category: category || 'general',
        content: 'In-depth weather coverage...',
      },
      {
        id: '4',
        type: 'news',
        title: 'Indian Tech Startups Raise Record Funding',
        description: 'Multiple Indian startups secure significant investments, boosting the country\'s position in global tech innovation.',
        content: 'Analysis of startup funding trends in India...',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
        url: 'https://example.com/startup-funding',
        publishedAt: new Date().toISOString(),
        source: 'Economic Times',
        author: 'Neha Singh',
        category: category || 'business',
      },
    ];

    return category 
      ? mockArticles.filter(article => article.category === category)
      : mockArticles;
  }
}
