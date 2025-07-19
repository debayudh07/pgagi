import { Movie, ApiResponse } from '../../types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL;

export interface MovieApiParams {
  page?: number;
  genre?: string;
  query?: string;
}

export class MovieService {
  private static baseUrl = TMDB_API_URL || 'https://api.themoviedb.org/3';
  private static apiKey = TMDB_API_KEY;
  private static imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  static async getPopularMovies(params: MovieApiParams = {}): Promise<ApiResponse<Movie[]>> {
    try {
      const searchParams = new URLSearchParams({
        api_key: this.apiKey || 'demo-key',
        page: String(params.page || 1),
        ...(params.genre && { with_genres: params.genre }),
      });

      const response = await fetch(`${this.baseUrl}/movie/popular?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const movies: Movie[] = data.results?.map((movie: any) => ({
        id: String(movie.id),
        type: 'movie' as const,
        title: movie.title || '',
        description: movie.overview || '',
        image: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : '',
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        releaseDate: movie.release_date || '',
        rating: movie.vote_average || 0,
        genre: movie.genre_ids || [],
      })) || [];

      return {
        data: movies,
        totalResults: data.total_results,
        status: 'success',
      };
    } catch (error) {
      console.error('TMDB API Error:', error);
      
      // Return mock data when API fails
      return {
        data: this.getMockMovies(),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async searchMovies(query: string, page = 1): Promise<ApiResponse<Movie[]>> {
    try {
      const searchParams = new URLSearchParams({
        api_key: this.apiKey || 'demo-key',
        query,
        page: String(page),
      });

      const response = await fetch(`${this.baseUrl}/search/movie?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const movies: Movie[] = data.results?.map((movie: any) => ({
        id: String(movie.id),
        type: 'movie' as const,
        title: movie.title || '',
        description: movie.overview || '',
        image: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : '',
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        releaseDate: movie.release_date || '',
        rating: movie.vote_average || 0,
        genre: movie.genre_ids || [],
      })) || [];

      return {
        data: movies,
        status: 'success',
      };
    } catch (error) {
      console.error('Movie Search Error:', error);
      return {
        data: this.getMockMovies().filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase())
        ),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async getTrendingMovies(): Promise<ApiResponse<Movie[]>> {
    try {
      const searchParams = new URLSearchParams({
        api_key: this.apiKey || 'demo-key',
      });

      const response = await fetch(`${this.baseUrl}/trending/movie/week?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const movies: Movie[] = data.results?.map((movie: any) => ({
        id: String(movie.id),
        type: 'movie' as const,
        title: movie.title || '',
        description: movie.overview || '',
        image: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : '',
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        releaseDate: movie.release_date || '',
        rating: movie.vote_average || 0,
        genre: movie.genre_ids || [],
      })) || [];

      return {
        data: movies,
        status: 'success',
      };
    } catch (error) {
      console.error('Trending Movies Error:', error);
      return {
        data: this.getMockMovies(),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  private static getMockMovies(): Movie[] {
    return [
      {
        id: 'movie1',
        type: 'movie',
        title: 'The Future of AI',
        description: 'A thrilling sci-fi movie exploring the possibilities of artificial intelligence.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        url: 'https://example.com/movie/ai-future',
        releaseDate: '2024-01-15',
        rating: 8.5,
        genre: ['Science Fiction', 'Thriller'],
      },
      {
        id: 'movie2',
        type: 'movie',
        title: 'Ocean Adventures',
        description: 'An epic adventure beneath the waves discovering hidden treasures.',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        url: 'https://example.com/movie/ocean-adventures',
        releaseDate: '2024-02-20',
        rating: 7.8,
        genre: ['Adventure', 'Family'],
      },
      {
        id: 'movie3',
        type: 'movie',
        title: 'Space Odyssey 2024',
        description: 'Humanity\'s next step into the cosmos in this stunning space epic.',
        image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
        url: 'https://example.com/movie/space-odyssey',
        releaseDate: '2024-03-10',
        rating: 9.2,
        genre: ['Science Fiction', 'Drama'],
      },
    ];
  }
}
