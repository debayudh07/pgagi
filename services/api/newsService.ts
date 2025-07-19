import { NewsArticle, ApiResponse } from '../../types';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const NEWS_API_URL = process.env.NEXT_PUBLIC_NEWS_API_URL;

export interface NewsApiParams {
  category?: string;
  country?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export class NewsService {
  private static baseUrl = NEWS_API_URL || 'https://newsapi.org/v2';
  private static apiKey = NEWS_API_KEY;

  static async getTopHeadlines(params: NewsApiParams = {}): Promise<ApiResponse<NewsArticle[]>> {
    try {
      const searchParams = new URLSearchParams({
        apiKey: this.apiKey || 'demo-key',
        country: params.country || 'us',
        pageSize: String(params.pageSize || 20),
        page: String(params.page || 1),
        ...(params.category && { category: params.category }),
        ...(params.q && { q: params.q }),
      });

      const response = await fetch(`${this.baseUrl}/top-headlines?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to our NewsArticle format
      const articles: NewsArticle[] = data.articles?.map((article: any) => ({
        id: article.url || Math.random().toString(36),
        type: 'news' as const,
        title: article.title || '',
        description: article.description || '',
        content: article.content || '',
        image: article.urlToImage || '',
        url: article.url || '',
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: article.source?.name || 'Unknown',
        author: article.author || 'Unknown',
        category: params.category || 'general',
      })) || [];

      return {
        data: articles,
        totalResults: data.totalResults,
        status: 'success',
      };
    } catch (error) {
      console.error('News API Error:', error);
      
      // Return mock data when API fails or in development
      return {
        data: this.getMockNews(params.category),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async searchNews(query: string, page = 1): Promise<ApiResponse<NewsArticle[]>> {
    return this.getTopHeadlines({ q: query, page });
  }

  private static getMockNews(category?: string): NewsArticle[] {
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        type: 'news',
        title: 'Breaking: Technology Advancement in AI',
        description: 'Latest developments in artificial intelligence are reshaping industries worldwide.',
        content: 'Full article content about AI developments...',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
        url: 'https://example.com/ai-news',
        publishedAt: new Date().toISOString(),
        source: 'Tech Today',
        author: 'John Doe',
        category: category || 'technology',
      },
      {
        id: '2',
        type: 'news',
        title: 'Global Markets Show Strong Growth',
        description: 'Financial markets around the world are experiencing unprecedented growth.',
        content: 'Detailed analysis of market trends...',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        url: 'https://example.com/market-news',
        publishedAt: new Date().toISOString(),
        source: 'Financial Times',
        author: 'Jane Smith',
        category: category || 'business',
      },
      {
        id: '3',
        type: 'news',
        title: 'Climate Change Solutions Emerge',
        description: 'New technologies are being developed to combat climate change effectively.',
        content: 'In-depth coverage of climate solutions...',
        image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=400',
        url: 'https://example.com/climate-news',
        publishedAt: new Date().toISOString(),
        source: 'Green Planet',
        author: 'Alice Johnson',
        category: category || 'science',
      },
    ];

    return category 
      ? mockArticles.filter(article => article.category === category)
      : mockArticles;
  }
}
