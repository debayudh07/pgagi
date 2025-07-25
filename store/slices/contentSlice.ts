import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, NewsArticle, Movie, MusicTrack, SocialPost, LoadingState, PaginationState, ContentTypePagination, SpotifyArtist, SpotifyTopArtistWithTracks } from '../../types';
import { MovieService } from '../../services/api/movieService';
import { NewsService } from '../../services/api/newsService';
import { MusicService } from '../../services/api/musicService';
import { SocialService } from '../../services/api/socialService';
import { SpotifyUserService } from '../../services/api/spotifyUserService';
import { combineWithUniqueIds, ensureUniqueIds } from '../../utils/contentUtils';

interface ContentState {
  feed: ContentItem[];
  trending: ContentItem[];
  favorites: ContentItem[];
  searchResults: ContentItem[];
  // Organized content by type
  news: ContentItem[];
  movies: ContentItem[];
  music: ContentItem[];
  social: ContentItem[];
  // Persistent ordering for each content type
  contentOrder: {
    movies: string[]; // Array of movie IDs in preferred order
    news: string[]; // Array of news IDs in preferred order
    music: string[]; // Array of music IDs in preferred order
    social: string[]; // Array of social IDs in preferred order
    feed: string[]; // Array of feed IDs in preferred order
  };
  // Spotify-specific data
  topArtists: SpotifyArtist[];
  topArtistsWithTracks: SpotifyTopArtistWithTracks[];
  topTracks: MusicTrack[];
  genreTracks: MusicTrack[];
  availableGenres: string[];
  selectedGenre: string | null;
  currentPlayingTrack: MusicTrack | null;
  // User Spotify data
  userPlaylists: any[];
  userTopTracks: MusicTrack[];
  userTopArtists: any[];
  currentPlayback: any;
  userDevices: any[];
  isSpotifyConnected: boolean;
  spotifyAccessToken: string | null;
  // Spotify Playback SDK
  spotifyPlayer: any | null;
  spotifyDeviceId: string | null;
  spotifyPlayerReady: boolean;
  loading: LoadingState;
  pagination: PaginationState;
  contentPagination: ContentTypePagination;
  searchQuery: string;
  activeFilters: {
    type?: ContentItem['type'];
    category?: string;
  };
  // Active tab management
  activeTab: 'feed' | 'news' | 'movies' | 'music' | 'social' | 'favorites' | 'trending';
}

const initialState: ContentState = {
  feed: [],
  trending: [],
  favorites: [],
  searchResults: [],
  // Organized content by type
  news: [],
  movies: [],
  music: [],
  social: [],
  // Persistent ordering for each content type
  contentOrder: {
    movies: [],
    news: [],
    music: [],
    social: [],
    feed: [],
  },
  // Spotify-specific data
  topArtists: [],
  topArtistsWithTracks: [],
  topTracks: [],
  genreTracks: [],
  availableGenres: [],
  selectedGenre: null,
  currentPlayingTrack: null,
  // User Spotify data
  userPlaylists: [],
  userTopTracks: [],
  userTopArtists: [],
  currentPlayback: null,
  userDevices: [],
  isSpotifyConnected: false,
  spotifyAccessToken: null,
  // Spotify Playback SDK
  spotifyPlayer: null,
  spotifyDeviceId: null,
  spotifyPlayerReady: false,
  loading: {
    isLoading: false,
    error: null,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  contentPagination: {
    news: {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: 0,
      isLoadingMore: false,
    },
    movies: {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: 0,
      isLoadingMore: false,
    },
    music: {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: 0,
      isLoadingMore: false,
    },
    social: {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: 0,
      isLoadingMore: false,
    },
  },
  searchQuery: '',
  activeFilters: {},
  activeTab: 'feed',
};

export const fetchFeedContent = createAsyncThunk(
  'content/fetchFeedContent',
  async (params: { categories: string[]; page?: number }, { rejectWithValue }) => {
    try {
      const page = params.page || 1;
      const itemArrays: Array<{ items: ContentItem[]; prefix: string }> = [];

      // Check if movies category is enabled
      if (params.categories.includes('movies') || params.categories.includes('entertainment')) {
        const popularMoviesResponse = await MovieService.getPopularMovies({ page });
        if (popularMoviesResponse.status === 'success' && popularMoviesResponse.data) {
          itemArrays.push({ items: popularMoviesResponse.data, prefix: 'popular' });
        }

        const nowPlayingResponse = await MovieService.getNowPlayingMovies(page);
        if (nowPlayingResponse.status === 'success' && nowPlayingResponse.data) {
          itemArrays.push({ items: nowPlayingResponse.data.slice(0, 10), prefix: 'nowplaying' });
        }
      }

      // Check if TV shows are requested
      if (params.categories.includes('tv') || params.categories.includes('entertainment')) {
        const tvShowsResponse = await MovieService.getTopRatedTVShows(page);
        if (tvShowsResponse.status === 'success' && tvShowsResponse.data) {
          itemArrays.push({ items: tvShowsResponse.data.slice(0, 10), prefix: 'tv' });
        }
      }

      // If no specific categories or general feed, get a mix of content
      if (params.categories.length === 0 || params.categories.includes('general')) {
        const [movies, topRated, nowPlaying] = await Promise.all([
          MovieService.getPopularMovies({ page }),
          MovieService.getTopRatedMovies(page),
          MovieService.getNowPlayingMovies(page)
        ]);

        if (movies.status === 'success' && movies.data) {
          itemArrays.push({ items: movies.data.slice(0, 7), prefix: 'popular' });
        }
        if (topRated.status === 'success' && topRated.data) {
          itemArrays.push({ items: topRated.data.slice(0, 7), prefix: 'toprated' });
        }
        if (nowPlaying.status === 'success' && nowPlaying.data) {
          itemArrays.push({ items: nowPlaying.data.slice(0, 6), prefix: 'nowplaying' });
        }
      }

      // Combine all items with unique IDs
      const combinedResults = combineWithUniqueIds(itemArrays);
      
      // Additional deduplication step to ensure no conflicts
      const uniqueResults = ensureUniqueIds(combinedResults, 'feed');
      
      // Shuffle results to provide variety
      const shuffledResults = uniqueResults.sort(() => Math.random() - 0.5);
      
      return shuffledResults;
    } catch (error) {
      console.error('Error fetching feed content:', error);
      return rejectWithValue('Failed to fetch feed content');
    }
  }
);

export const fetchTrendingContent = createAsyncThunk(
  'content/fetchTrendingContent',
  async (_, { rejectWithValue }) => {
    try {
      const itemArrays: Array<{ items: ContentItem[]; prefix: string }> = [];
      
      // Fetch trending news from India
      console.log('🔥 Fetching trending news for trending section...');
      const newsResponse = await NewsService.getTopHeadlines({ 
        country: 'in', 
        pageSize: 8 
      });
      if (newsResponse.status === 'success' && newsResponse.data) {
        console.log(`🔥 Got ${newsResponse.data.length} news articles for trending`);
        itemArrays.push({ items: newsResponse.data, prefix: 'news' });
      }
      
      // Fetch trending movies
      const moviesResponse = await MovieService.getTrendingMovies();
      if (moviesResponse.status === 'success' && moviesResponse.data) {
        itemArrays.push({ items: moviesResponse.data, prefix: 'trending' });
      }

      // Fetch top-rated movies for additional content
      const topRatedResponse = await MovieService.getTopRatedMovies();
      if (topRatedResponse.status === 'success' && topRatedResponse.data) {
        itemArrays.push({ items: topRatedResponse.data.slice(0, 5), prefix: 'toprated' });
      }

      // Fetch top-rated TV shows
      const tvShowsResponse = await MovieService.getTopRatedTVShows();
      if (tvShowsResponse.status === 'success' && tvShowsResponse.data) {
        itemArrays.push({ items: tvShowsResponse.data.slice(0, 5), prefix: 'tv' });
      }

      // Fetch top music tracks
      console.log('🔥 Fetching trending music tracks from 2025...');
      try {
        const musicResponse = await MusicService.getTopTracks({ 
          limit: 6,
          market: 'US' 
        });
        if (musicResponse.status === 'success' && musicResponse.data) {
          console.log(`🔥 Got ${musicResponse.data.length} trending music tracks from 2025`);
          itemArrays.push({ items: musicResponse.data, prefix: 'music' });
        }
      } catch (musicError) {
        console.warn('🔥 Failed to fetch music tracks for trending:', musicError);
      }

      // Fetch social posts from SocialService
      console.log('🔥 Fetching trending social posts...');
      try {
        const socialResponse = await SocialService.getTrendingPosts('instagram');
        if (socialResponse.status === 'success' && socialResponse.data) {
          console.log(`🔥 Got ${socialResponse.data.length} trending social posts`);
          itemArrays.push({ items: socialResponse.data, prefix: 'social' });
        }
      } catch (socialError) {
        console.warn('🔥 Failed to fetch social posts for trending:', socialError);
      }

      // Combine all items with unique IDs
      const combinedResults = combineWithUniqueIds(itemArrays);
      
      // Shuffle the results to mix content types
      const shuffledResults = combinedResults.sort(() => Math.random() - 0.5);
      
      console.log(`🔥 Total trending items: ${shuffledResults.length}`);
      return shuffledResults.slice(0, 20); // Return top 20 trending items
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return rejectWithValue('Failed to fetch trending content');
    }
  }
);

export const searchContent = createAsyncThunk(
  'content/searchContent',
  async (params: { query: string; type?: ContentItem['type'] }, { rejectWithValue }) => {
    try {
      const results: ContentItem[] = [];
      
      // Search movies if no type specified or if movie type is specified
      if (!params.type || params.type === 'movie') {
        const moviesResponse = await MovieService.searchMovies(params.query);
        if (moviesResponse.status === 'success' && moviesResponse.data) {
          results.push(...moviesResponse.data);
        }
      }

      // Search news if no type specified or if news type is specified
      if (!params.type || params.type === 'news') {
        const newsResponse = await NewsService.searchNews(params.query);
        if (newsResponse.status === 'success' && newsResponse.data) {
          // Transform NewsArticle[] to ContentItem[]
          const newsContentItems: ContentItem[] = newsResponse.data.map((article) => ({
            id: article.id,
            type: 'news' as const,
            title: article.title,
            description: article.description,
            image: article.image,
            publishedAt: article.publishedAt,
            source: article.source,
            url: article.url,
            content: article.content,
            author: article.author,
            category: article.category
          }));
          results.push(...newsContentItems);
        }
      }

      // Search music if no type specified or if music type is specified
      if (!params.type || params.type === 'music') {
        const musicResponse = await MusicService.searchTracks(params.query);
        if (musicResponse.status === 'success' && musicResponse.data) {
          // Transform MusicTrack[] to ContentItem[]
          const musicContentItems: ContentItem[] = musicResponse.data.map((track) => ({
            id: track.id,
            type: 'music' as const,
            title: track.title,
            description: track.artist,
            image: track.image,
            publishedAt: track.publishedAt || new Date().toISOString(),
            source: 'Spotify',
            url: track.url,
            // Music-specific properties
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            previewUrl: track.previewUrl
          }));
          results.push(...musicContentItems);
        }
      }

      // Ensure unique IDs for search results
      return ensureUniqueIds(results, 'search');
    } catch (error) {
      console.error('Error searching content:', error);
      return rejectWithValue('Failed to search content');
    }
  }
);

// Fetch content by specific type
export const fetchMovies = createAsyncThunk(
  'content/fetchMovies',
  async (params: { page?: number; append?: boolean } = {}, { rejectWithValue, getState }) => {
    try {
      const page = params.page || 1;
      const append = params.append || false;

      const [popular, topRated, nowPlaying] = await Promise.all([
        MovieService.getPopularMovies({ page }),
        MovieService.getTopRatedMovies(page),
        MovieService.getNowPlayingMovies(page)
      ]);

      // Combine all results with unique IDs
      const itemArrays = [
        { items: popular.data || [], prefix: 'popular' },
        { items: topRated.data?.slice(0, 10) || [], prefix: 'toprated' },
        { items: nowPlaying.data?.slice(0, 10) || [], prefix: 'nowplaying' }
      ];

      const combinedItems = combineWithUniqueIds(itemArrays);
      
      // Additional deduplication step to ensure no conflicts
      const finalItems = ensureUniqueIds(combinedItems, 'movie');

      // Calculate pagination info (assuming 20 items per page from API)
      const totalItems = (popular.totalResults || 0) + (topRated.totalResults || 0) + (nowPlaying.totalResults || 0);
      const itemsPerPage = 20;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      return {
        items: finalItems,
        pagination: {
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          totalItems,
          isLoadingMore: false,
        },
        append,
      };
    } catch (error) {
      console.error('Error fetching movies:', error);
      return rejectWithValue('Failed to fetch movies');
    }
  }
);

export const fetchNews = createAsyncThunk(
  'content/fetchNews',
  async (params: { page?: number; category?: string; country?: string; append?: boolean } = {}, { rejectWithValue }) => {
    try {
      const page = params.page || 1;
      const append = params.append || false;

      // Use actual NewsService to fetch news from News API
      const newsResponse = await NewsService.getTopHeadlines({
        page,
        pageSize: 20,
        category: params.category,
        country: params.country || 'in' // Default to India
      });

      if (newsResponse.status === 'success' && newsResponse.data) {
        // Transform NewsArticle[] to ContentItem[]
        const contentItems: ContentItem[] = newsResponse.data.map((article) => ({
          id: article.id,
          type: 'news' as const,
          title: article.title,
          description: article.description,
          image: article.image,
          publishedAt: article.publishedAt,
          source: article.source,
          url: article.url,
          content: article.content,
          author: article.author,
          category: article.category
        }));

        // Calculate pagination info
        const totalItems = newsResponse.totalResults || 0;
        const itemsPerPage = 20;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        return {
          items: contentItems,
          pagination: {
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            totalItems,
            isLoadingMore: false,
          },
          append,
        };
      }

      return {
        items: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          totalItems: 0,
          isLoadingMore: false,
        },
        append,
      };
    } catch (error) {
      console.error('Error fetching news:', error);
      return rejectWithValue('Failed to fetch news');
    }
  }
);

export const fetchMusic = createAsyncThunk(
  'content/fetchMusic',
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      console.log('🎵 Fetching 2025 music tracks...');
      const musicResponse = await MusicService.getTopTracks({ 
        limit: 20,
        market: 'US'
      });
      
      if (musicResponse.status === 'success' && musicResponse.data) {
        console.log(`🎵 Got ${musicResponse.data.length} music tracks from 2025`);
        return ensureUniqueIds(musicResponse.data as ContentItem[], 'music');
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching music:', error);
      return rejectWithValue('Failed to fetch music');
    }
  }
);

export const fetchTopArtists = createAsyncThunk(
  'content/fetchTopArtists',
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      console.log('🎤 Fetching top artists...');
      const artistsResponse = await MusicService.getTopArtists({ 
        limit: params.limit || 20
      });
      
      if (artistsResponse.status === 'success' && artistsResponse.data) {
        console.log(`🎤 Got ${artistsResponse.data.length} top artists`);
        return artistsResponse.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching top artists:', error);
      return rejectWithValue('Failed to fetch top artists');
    }
  }
);

export const fetchTopArtistsWithTracks = createAsyncThunk(
  'content/fetchTopArtistsWithTracks',
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      console.log('🎵🎤 Fetching top artists with their tracks...');
      const artistsWithTracksResponse = await MusicService.getTopArtistsWithTracks({ 
        limit: params.limit || 10
      });
      
      if (artistsWithTracksResponse.status === 'success' && artistsWithTracksResponse.data) {
        console.log(`🎵🎤 Got ${artistsWithTracksResponse.data.length} artists with tracks`);
        return artistsWithTracksResponse.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching top artists with tracks:', error);
      return rejectWithValue('Failed to fetch top artists with tracks');
    }
  }
);

export const fetchTopTracks = createAsyncThunk(
  'content/fetchTopTracks',
  async (params: { genre?: string; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await MusicService.getTopTracks(params);
      if (response.status === 'success') {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return rejectWithValue('Failed to fetch top tracks');
    }
  }
);

export const fetchTracksByGenre = createAsyncThunk(
  'content/fetchTracksByGenre',
  async (params: { genre: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await MusicService.getTracksByGenre(params.genre, params);
      if (response.status === 'success') {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching tracks by genre:', error);
      return rejectWithValue('Failed to fetch tracks by genre');
    }
  }
);

export const fetchAvailableGenres = createAsyncThunk(
  'content/fetchAvailableGenres',
  async (_, { rejectWithValue }) => {
    try {
      const response = await MusicService.getAvailableGenres();
      if (response.status === 'success') {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching available genres:', error);
      return rejectWithValue('Failed to fetch available genres');
    }
  }
);

// Spotify User API thunks
export const fetchUserPlaylists = createAsyncThunk(
  'content/fetchUserPlaylists',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await SpotifyUserService.getUserPlaylists(accessToken);
      return response.items;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      return rejectWithValue('Failed to fetch user playlists');
    }
  }
);

export const fetchUserTopTracks = createAsyncThunk(
  'content/fetchUserTopTracks',
  async ({ accessToken, timeRange = 'medium_term', limit = 20 }: { accessToken: string; timeRange?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await SpotifyUserService.getUserTopTracks(accessToken, timeRange as any, limit);
      return response.items.map(track => SpotifyUserService.convertToMusicTrack(track));
    } catch (error) {
      console.error('Error fetching user top tracks:', error);
      return rejectWithValue('Failed to fetch user top tracks');
    }
  }
);

export const fetchUserTopArtists = createAsyncThunk(
  'content/fetchUserTopArtists',
  async ({ accessToken, timeRange = 'medium_term', limit = 20 }: { accessToken: string; timeRange?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await SpotifyUserService.getUserTopArtists(accessToken, timeRange as any, limit);
      return response.items;
    } catch (error) {
      console.error('Error fetching user top artists:', error);
      return rejectWithValue('Failed to fetch user top artists');
    }
  }
);

export const fetchCurrentPlayback = createAsyncThunk(
  'content/fetchCurrentPlayback',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await SpotifyUserService.getCurrentPlayback(accessToken);
      return response;
    } catch (error) {
      console.error('Error fetching current playback:', error);
      return rejectWithValue('Failed to fetch current playback');
    }
  }
);

export const fetchUserDevices = createAsyncThunk(
  'content/fetchUserDevices',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await SpotifyUserService.getUserDevices(accessToken);
      return response.devices;
    } catch (error) {
      console.error('Error fetching user devices:', error);
      return rejectWithValue('Failed to fetch user devices');
    }
  }
);

export const playSpotifyTrack = createAsyncThunk(
  'content/playSpotifyTrack',
  async ({ accessToken, trackUri, deviceId }: { accessToken: string; trackUri: string; deviceId?: string }, { rejectWithValue }) => {
    try {
      await SpotifyUserService.playTrack(accessToken, trackUri, deviceId);
      return { trackUri, deviceId };
    } catch (error) {
      console.error('Error playing Spotify track:', error);
      return rejectWithValue('Failed to play track');
    }
  }
);

export const pauseSpotifyPlayback = createAsyncThunk(
  'content/pauseSpotifyPlayback',
  async ({ accessToken, deviceId }: { accessToken: string; deviceId?: string }, { rejectWithValue }) => {
    try {
      await SpotifyUserService.pausePlayback(accessToken, deviceId);
      return { deviceId };
    } catch (error) {
      console.error('Error pausing Spotify playback:', error);
      return rejectWithValue('Failed to pause playback');
    }
  }
);

export const resumeSpotifyPlayback = createAsyncThunk(
  'content/resumeSpotifyPlayback',
  async ({ accessToken, deviceId }: { accessToken: string; deviceId?: string }, { rejectWithValue }) => {
    try {
      await SpotifyUserService.resumePlayback(accessToken, deviceId);
      return { deviceId };
    } catch (error) {
      console.error('Error resuming Spotify playback:', error);
      return rejectWithValue('Failed to resume playback');
    }
  }
);

// Spotify Playback SDK thunks
export const initializeSpotifyPlayer = createAsyncThunk(
  'content/initializeSpotifyPlayer',
  async ({ accessToken, deviceName }: { accessToken: string; deviceName?: string }, { rejectWithValue }) => {
    try {
      const { MusicService } = await import('../../services/api/musicService');
      const playerData = await MusicService.initializeSpotifyPlayer(accessToken, deviceName);
      return playerData;
    } catch (error) {
      console.error('Error initializing Spotify player:', error);
      return rejectWithValue('Failed to initialize Spotify player');
    }
  }
);

export const playTrackWithSDK = createAsyncThunk(
  'content/playTrackWithSDK',
  async ({ accessToken, trackUri, deviceId }: { accessToken: string; trackUri: string; deviceId: string }, { rejectWithValue }) => {
    try {
      const { MusicService } = await import('../../services/api/musicService');
      await MusicService.playTrackWithSDK(accessToken, trackUri, deviceId);
      return { trackUri, deviceId };
    } catch (error) {
      console.error('Error playing track with SDK:', error);
      return rejectWithValue('Failed to play track with SDK');
    }
  }
);

export const pausePlaybackSDK = createAsyncThunk(
  'content/pausePlaybackSDK',
  async ({ accessToken, deviceId }: { accessToken: string; deviceId: string }, { rejectWithValue }) => {
    try {
      const { MusicService } = await import('../../services/api/musicService');
      await MusicService.pausePlaybackSDK(accessToken, deviceId);
      return { deviceId };
    } catch (error) {
      console.error('Error pausing playback with SDK:', error);
      return rejectWithValue('Failed to pause playback with SDK');
    }
  }
);

export const resumePlaybackSDK = createAsyncThunk(
  'content/resumePlaybackSDK',
  async ({ accessToken, deviceId }: { accessToken: string; deviceId: string }, { rejectWithValue }) => {
    try {
      const { MusicService } = await import('../../services/api/musicService');
      await MusicService.resumePlaybackSDK(accessToken, deviceId);
      return { deviceId };
    } catch (error) {
      console.error('Error resuming playback with SDK:', error);
      return rejectWithValue('Failed to resume playback with SDK');
    }
  }
);

export const setVolumeSDK = createAsyncThunk(
  'content/setVolumeSDK',
  async ({ accessToken, volumePercent, deviceId }: { accessToken: string; volumePercent: number; deviceId: string }, { rejectWithValue }) => {
    try {
      const { MusicService } = await import('../../services/api/musicService');
      await MusicService.setVolumeSDK(accessToken, volumePercent, deviceId);
      return { volumePercent, deviceId };
    } catch (error) {
      console.error('Error setting volume with SDK:', error);
      return rejectWithValue('Failed to set volume with SDK');
    }
  }
);

export const fetchSocial = createAsyncThunk(
  'content/fetchSocial',
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      // Mock social data for now - replace with actual SocialService when available
      const mockSocial: SocialPost[] = [
        {
          id: 'social1',
          type: 'social',
          title: 'Viral Post: Amazing Discovery',
          description: 'This incredible discovery is taking social media by storm...',
          image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
          platform: 'instagram' as const,
          username: 'Science Explorer',
          likes: 15420,
          comments: 892,
          url: 'https://example.com/viral-discovery'
        },
        {
          id: 'social2',
          type: 'social',
          title: 'Trending: Creative Challenge',
          description: 'Join the latest creative challenge sweeping across platforms...',
          image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500',
          platform: 'instagram' as const,
          username: 'Creative Hub',
          likes: 8730,
          comments: 445,
          url: 'https://example.com/creative-challenge'
        }
      ];
      
      return ensureUniqueIds(mockSocial as ContentItem[], 'social');
    } catch (error) {
      console.error('Error fetching social content:', error);
      return rejectWithValue('Failed to fetch social content');
    }
  }
);

// Load more action creators for infinite scrolling
export const loadMoreNews = createAsyncThunk(
  'content/loadMoreNews',
  async (params: { category?: string; country?: string } = {}, { getState, dispatch }) => {
    const state = getState() as { content: ContentState };
    const currentPagination = state.content.contentPagination?.news;
    
    if (!currentPagination) {
      console.warn('News pagination state not initialized, fetching first page');
      return dispatch(fetchNews({ 
        page: 1, 
        append: false,
        category: params.category,
        country: params.country 
      })).unwrap();
    }
    
    const currentPage = currentPagination.currentPage;
    const hasNextPage = currentPagination.hasNextPage;
    
    if (!hasNextPage) {
      return { items: [], pagination: currentPagination, append: true };
    }

    return dispatch(fetchNews({ 
      page: currentPage + 1, 
      append: true,
      category: params.category,
      country: params.country 
    })).unwrap();
  }
);

export const loadMoreMovies = createAsyncThunk(
  'content/loadMoreMovies',
  async (_, { getState, dispatch }) => {
    const state = getState() as { content: ContentState };
    const currentPagination = state.content.contentPagination?.movies;
    
    if (!currentPagination) {
      console.warn('Movies pagination state not initialized, fetching first page');
      return dispatch(fetchMovies({ 
        page: 1, 
        append: false 
      })).unwrap();
    }
    
    const currentPage = currentPagination.currentPage;
    const hasNextPage = currentPagination.hasNextPage;
    
    if (!hasNextPage) {
      return { items: [], pagination: currentPagination, append: true };
    }

    return dispatch(fetchMovies({ 
      page: currentPage + 1, 
      append: true 
    })).unwrap();
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const item = state.feed.find(item => item.id === itemId) || 
                   state.trending.find(item => item.id === itemId) ||
                   state.searchResults.find(item => item.id === itemId);
      
      if (item && !state.favorites.find(fav => fav.id === itemId)) {
        state.favorites.push({ ...item, isFavorite: true });
      }
      
      // Update the item in feed, trending, and search results
      state.feed = state.feed.map(item => 
        item.id === itemId ? { ...item, isFavorite: true } : item
      );
      state.trending = state.trending.map(item => 
        item.id === itemId ? { ...item, isFavorite: true } : item
      );
      state.searchResults = state.searchResults.map(item => 
        item.id === itemId ? { ...item, isFavorite: true } : item
      );
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.favorites = state.favorites.filter(item => item.id !== itemId);
      
      // Update the item in feed, trending, and search results
      state.feed = state.feed.map(item => 
        item.id === itemId ? { ...item, isFavorite: false } : item
      );
      state.trending = state.trending.map(item => 
        item.id === itemId ? { ...item, isFavorite: false } : item
      );
      state.searchResults = state.searchResults.map(item => 
        item.id === itemId ? { ...item, isFavorite: false } : item
      );
    },
    reorderFeedItems: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
      const { oldIndex, newIndex } = action.payload;
      const [removed] = state.feed.splice(oldIndex, 1);
      state.feed.splice(newIndex, 0, removed);
      
      // Update persistent ordering
      state.contentOrder.feed = state.feed.map(item => item.id);
    },
    reorderContentItems: (state, action: PayloadAction<{ 
      contentType: 'movies' | 'news' | 'music' | 'social'; 
      oldIndex: number; 
      newIndex: number 
    }>) => {
      // Temporarily disabled to prevent state access errors
      // TODO: Implement proper reordering functionality
      console.log('ℹ️ ContentSlice: reorderContentItems called but temporarily disabled');
      return;
    },
    applyContentOrder: (state, action: PayloadAction<{ 
      contentType: 'movies' | 'news' | 'music' | 'social' | 'feed' 
    }>) => {
      // Temporarily disabled to prevent state access errors
      // TODO: Implement proper ordering functionality
      console.log('ℹ️ ContentSlice: applyContentOrder called but temporarily disabled');
      return;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveFilters: (state, action: PayloadAction<typeof initialState.activeFilters>) => {
      state.activeFilters = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<typeof initialState.activeTab>) => {
      state.activeTab = action.payload;
    },
    playTrack: (state, action: PayloadAction<MusicTrack>) => {
      // Set all tracks to not playing
      state.music = state.music.map(item => 
        item.type === 'music' ? { ...item, isPlaying: false } : item
      );
      
      // Update the specific track to playing
      state.music = state.music.map(item => 
        item.id === action.payload.id && item.type === 'music' 
          ? { ...item, isPlaying: true } 
          : item
      );
      
      // Set as current playing track
      state.currentPlayingTrack = { ...action.payload, isPlaying: true };
    },
    pauseTrack: (state, action: PayloadAction<string>) => {
      // Set all tracks to not playing
      state.music = state.music.map(item => 
        item.type === 'music' ? { ...item, isPlaying: false } : item
      );
      
      // Clear current playing track
      state.currentPlayingTrack = null;
    },
    stopAllTracks: (state) => {
      // Set all tracks to not playing
      state.music = state.music.map(item => 
        item.type === 'music' ? { ...item, isPlaying: false } : item
      );
      
      // Clear current playing track
      state.currentPlayingTrack = null;
    },
    selectGenre: (state, action: PayloadAction<string | null>) => {
      state.selectedGenre = action.payload;
      // Clear genre tracks when selecting a new genre
      if (action.payload) {
        state.genreTracks = [];
      }
    },
    setSpotifyConnection: (state, action: PayloadAction<{ isConnected: boolean; accessToken?: string }>) => {
      state.isSpotifyConnected = action.payload.isConnected;
      state.spotifyAccessToken = action.payload.accessToken || null;
    },
    setSpotifyPlayer: (state, action: PayloadAction<{ player: any; deviceId: string }>) => {
      state.spotifyPlayer = action.payload.player;
      state.spotifyDeviceId = action.payload.deviceId;
      state.spotifyPlayerReady = true;
    },
    clearSpotifyPlayer: (state) => {
      state.spotifyPlayer = null;
      state.spotifyDeviceId = null;
      state.spotifyPlayerReady = false;
    },
    setLoadingMore: (state, action: PayloadAction<{ contentType: keyof ContentTypePagination; isLoading: boolean }>) => {
      const { contentType, isLoading } = action.payload;
      
      // Ensure contentPagination exists
      if (!state.contentPagination) {
        state.contentPagination = {
          news: {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          },
          movies: {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          },
          music: {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          },
          social: {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          },
        };
      }
      
      if (state.contentPagination[contentType]) {
        state.contentPagination[contentType].isLoadingMore = isLoading;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Feed Content
    builder
      .addCase(fetchFeedContent.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = null;
      })
      .addCase(fetchFeedContent.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeedContent.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Trending Content
    builder
      .addCase(fetchTrendingContent.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchTrendingContent.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrendingContent.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Search Content
    builder
      .addCase(searchContent.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Movies
    builder
      .addCase(fetchMovies.pending, (state, action) => {
        const isAppend = action.meta.arg?.append || false;
        if (!isAppend) {
          state.loading.isLoading = true;
        } else {
          // Ensure contentPagination.movies exists
          if (!state.contentPagination.movies) {
            state.contentPagination.movies = {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            };
          }
          state.contentPagination.movies.isLoadingMore = true;
        }
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        
        // Ensure contentPagination.movies exists
        if (!state.contentPagination.movies) {
          state.contentPagination.movies = {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          };
        }
        
        state.contentPagination.movies.isLoadingMore = false;
        
        if (action.payload && typeof action.payload === 'object' && 'items' in action.payload) {
          const { items, pagination, append } = action.payload;
          
          if (append) {
            // Append new items for infinite scroll
            state.movies = [...state.movies, ...items];
          } else {
            // Replace items for initial load
            state.movies = items;
          }
          
          // Update pagination state
          state.contentPagination.movies = pagination;
          console.log('🎬 ContentSlice: Movies fetched successfully, count:', state.movies.length);
        } else {
          // Fallback for old format
          state.movies = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading.isLoading = false;
        if (state.contentPagination.movies) {
          state.contentPagination.movies.isLoadingMore = false;
        }
        state.loading.error = action.payload as string;
      });

    // Fetch News
    builder
      .addCase(fetchNews.pending, (state, action) => {
        const isAppend = action.meta.arg?.append || false;
        
        // Ensure contentPagination exists
        if (!state.contentPagination) {
          state.contentPagination = {
            news: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            movies: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            music: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            social: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
          };
        }
        
        if (!isAppend) {
          state.loading.isLoading = true;
        } else {
          // Ensure contentPagination.news exists
          if (!state.contentPagination.news) {
            state.contentPagination.news = {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            };
          }
          state.contentPagination.news.isLoadingMore = true;
        }
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        
        // Ensure contentPagination exists
        if (!state.contentPagination) {
          state.contentPagination = {
            news: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            movies: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            music: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            social: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
          };
        }
        
        // Ensure contentPagination.news exists
        if (!state.contentPagination.news) {
          state.contentPagination.news = {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          };
        }
        
        state.contentPagination.news.isLoadingMore = false;
        
        if (action.payload && typeof action.payload === 'object' && 'items' in action.payload) {
          const { items, pagination, append } = action.payload;
          
          if (append) {
            // Append new items for infinite scroll
            state.news = [...state.news, ...items];
          } else {
            // Replace items for initial load
            state.news = items;
          }
          
          // Update pagination state
          state.contentPagination.news = pagination;
          console.log('📰 ContentSlice: News fetched successfully, count:', state.news.length);
        } else {
          // Fallback for old format
          state.news = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading.isLoading = false;
        
        // Ensure contentPagination exists
        if (!state.contentPagination) {
          state.contentPagination = {
            news: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            movies: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            music: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
            social: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: 0,
              isLoadingMore: false,
            },
          };
        }
        
        if (state.contentPagination.news) {
          state.contentPagination.news.isLoadingMore = false;
        }
        state.loading.error = action.payload as string;
      });

    // Fetch Music
    builder
      .addCase(fetchMusic.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchMusic.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        // Ensure we always have an array, even if payload is undefined
        state.music = Array.isArray(action.payload) ? action.payload : [];
        console.log('🎵 ContentSlice: Music fetched successfully, count:', state.music.length);
      })
      .addCase(fetchMusic.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Top Artists
    builder
      .addCase(fetchTopArtists.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchTopArtists.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.topArtists = action.payload;
      })
      .addCase(fetchTopArtists.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Top Artists with Tracks
    builder
      .addCase(fetchTopArtistsWithTracks.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchTopArtistsWithTracks.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.topArtistsWithTracks = action.payload;
      })
      .addCase(fetchTopArtistsWithTracks.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Top Tracks
    builder
      .addCase(fetchTopTracks.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchTopTracks.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.topTracks = action.payload;
      })
      .addCase(fetchTopTracks.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Tracks by Genre
    builder
      .addCase(fetchTracksByGenre.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchTracksByGenre.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.genreTracks = action.payload;
      })
      .addCase(fetchTracksByGenre.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Available Genres
    builder
      .addCase(fetchAvailableGenres.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchAvailableGenres.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.availableGenres = action.payload;
      })
      .addCase(fetchAvailableGenres.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Social
    builder
      .addCase(fetchSocial.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchSocial.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        // Ensure we always have an array, even if payload is undefined
        state.social = Array.isArray(action.payload) ? action.payload : [];
        console.log('📱 ContentSlice: Social content fetched successfully, count:', state.social.length);
      })
      .addCase(fetchSocial.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // User Spotify reducers
    builder
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.userPlaylists = action.payload;
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    builder
      .addCase(fetchUserTopTracks.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchUserTopTracks.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.userTopTracks = action.payload;
      })
      .addCase(fetchUserTopTracks.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    builder
      .addCase(fetchUserTopArtists.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchUserTopArtists.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.userTopArtists = action.payload;
      })
      .addCase(fetchUserTopArtists.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    builder
      .addCase(fetchCurrentPlayback.fulfilled, (state, action) => {
        state.currentPlayback = action.payload;
      });

    builder
      .addCase(fetchUserDevices.fulfilled, (state, action) => {
        state.userDevices = action.payload;
      });

    builder
      .addCase(playSpotifyTrack.fulfilled, (state, action) => {
        // Track played successfully
      })
      .addCase(pauseSpotifyPlayback.fulfilled, (state, action) => {
        // Playback paused successfully
      })
      .addCase(resumeSpotifyPlayback.fulfilled, (state, action) => {
        // Playback resumed successfully
      });

    // Spotify Playback SDK
    builder
      .addCase(initializeSpotifyPlayer.fulfilled, (state, action) => {
        state.spotifyPlayer = action.payload.player;
        state.spotifyDeviceId = action.payload.deviceId;
        state.spotifyPlayerReady = true;
      })
      .addCase(initializeSpotifyPlayer.rejected, (state, action) => {
        state.loading.error = action.payload as string;
        state.spotifyPlayerReady = false;
      });

    builder
      .addCase(playTrackWithSDK.fulfilled, (state, action) => {
        // Track played successfully with SDK
      })
      .addCase(pausePlaybackSDK.fulfilled, (state, action) => {
        // Playback paused successfully with SDK
      })
      .addCase(resumePlaybackSDK.fulfilled, (state, action) => {
        // Playback resumed successfully with SDK
      })
      .addCase(setVolumeSDK.fulfilled, (state, action) => {
        // Volume set successfully with SDK
      });

    // Load More Actions
    builder
      .addCase(loadMoreNews.pending, (state) => {
        if (!state.contentPagination.news) {
          state.contentPagination.news = {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          };
        }
        state.contentPagination.news.isLoadingMore = true;
      })
      .addCase(loadMoreNews.fulfilled, (state, action) => {
        if (!state.contentPagination.news) {
          state.contentPagination.news = {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          };
        }
        state.contentPagination.news.isLoadingMore = false;
        if (action.payload.items.length > 0) {
          state.news = [...state.news, ...action.payload.items];
          state.contentPagination.news = action.payload.pagination;
        }
      })
      .addCase(loadMoreNews.rejected, (state, action) => {
        if (state.contentPagination.news) {
          state.contentPagination.news.isLoadingMore = false;
        }
        state.loading.error = action.error.message || 'Failed to load more news';
      });

    builder
      .addCase(loadMoreMovies.pending, (state) => {
        if (!state.contentPagination.movies) {
          state.contentPagination.movies = {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          };
        }
        state.contentPagination.movies.isLoadingMore = true;
      })
      .addCase(loadMoreMovies.fulfilled, (state, action) => {
        if (!state.contentPagination.movies) {
          state.contentPagination.movies = {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: 0,
            isLoadingMore: false,
          };
        }
        state.contentPagination.movies.isLoadingMore = false;
        if (action.payload.items.length > 0) {
          state.movies = [...state.movies, ...action.payload.items];
          state.contentPagination.movies = action.payload.pagination;
        }
      })
      .addCase(loadMoreMovies.rejected, (state, action) => {
        if (state.contentPagination.movies) {
          state.contentPagination.movies.isLoadingMore = false;
        }
        state.loading.error = action.error.message || 'Failed to load more movies';
      });
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  reorderFeedItems,
  reorderContentItems,
  applyContentOrder,
  setSearchQuery,
  setActiveFilters,
  clearSearchResults,
  setCurrentPage,
  setActiveTab,
  playTrack,
  pauseTrack,
  stopAllTracks,
  selectGenre,
  setSpotifyConnection,
  setSpotifyPlayer,
  clearSpotifyPlayer,
  setLoadingMore,
} = contentSlice.actions;

export default contentSlice.reducer;
