import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, NewsArticle, Movie, MusicTrack, SocialPost, LoadingState, PaginationState, SpotifyArtist, SpotifyTopArtistWithTracks } from '../../types';
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
  loading: LoadingState;
  pagination: PaginationState;
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
      
      // Shuffle results to provide variety
      const shuffledResults = combinedResults.sort(() => Math.random() - 0.5);
      
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
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const page = params.page || 1;

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

      return combineWithUniqueIds(itemArrays);
    } catch (error) {
      console.error('Error fetching movies:', error);
      return rejectWithValue('Failed to fetch movies');
    }
  }
);

export const fetchNews = createAsyncThunk(
  'content/fetchNews',
  async (params: { page?: number; category?: string; country?: string } = {}, { rejectWithValue }) => {
    try {
      // Use actual NewsService to fetch news from News API
      const newsResponse = await NewsService.getTopHeadlines({
        page: params.page || 1,
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
        
        return ensureUniqueIds(contentItems, 'news');
      } else {
        throw new Error(newsResponse.message || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      return rejectWithValue('Failed to fetch news from API');
    }
  }
);

export const fetchMusic = createAsyncThunk(
  'content/fetchMusic',
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      console.log('🎵 Fetching music tracks...');
      const musicResponse = await MusicService.getTopTracks({ 
        limit: 20,
        market: 'US'
      });
      
      if (musicResponse.status === 'success' && musicResponse.data) {
        console.log(`🎵 Got ${musicResponse.data.length} music tracks`);
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
          platform: 'twitter' as const,
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
      .addCase(fetchMovies.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.movies = action.payload;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch News
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // Fetch Music
    builder
      .addCase(fetchMusic.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(fetchMusic.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.music = action.payload;
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
        state.social = action.payload;
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
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  reorderFeedItems,
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
} = contentSlice.actions;

export default contentSlice.reducer;
