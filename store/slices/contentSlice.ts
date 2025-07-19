import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, NewsArticle, Movie, MusicTrack, SocialPost, LoadingState, PaginationState } from '../../types';

interface ContentState {
  feed: ContentItem[];
  trending: ContentItem[];
  favorites: ContentItem[];
  searchResults: ContentItem[];
  loading: LoadingState;
  pagination: PaginationState;
  searchQuery: string;
  activeFilters: {
    type?: ContentItem['type'];
    category?: string;
  };
}

const initialState: ContentState = {
  feed: [],
  trending: [],
  favorites: [],
  searchResults: [],
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
};

// Async thunks for API calls
export const fetchFeedContent = createAsyncThunk(
  'content/fetchFeedContent',
  async (params: { categories: string[]; page?: number }, { rejectWithValue }) => {
    try {
      // This will be implemented with actual API calls
      const mockData: ContentItem[] = [
        {
          id: '1',
          type: 'news',
          title: 'Breaking: Tech Industry Updates',
          description: 'Latest developments in technology sector...',
          image: 'https://via.placeholder.com/400x200',
          publishedAt: new Date().toISOString(),
          source: 'Tech News',
        },
        {
          id: '2',
          type: 'movie',
          title: 'Top Movies This Week',
          description: 'Discover the most popular movies...',
          image: 'https://via.placeholder.com/400x200',
        },
      ];
      return mockData;
    } catch (error) {
      return rejectWithValue('Failed to fetch feed content');
    }
  }
);

export const fetchTrendingContent = createAsyncThunk(
  'content/fetchTrendingContent',
  async (_, { rejectWithValue }) => {
    try {
      // Mock trending content
      const mockData: ContentItem[] = [
        {
          id: 'trend1',
          type: 'news',
          title: 'Trending News Today',
          description: 'Most shared news article...',
          image: 'https://via.placeholder.com/400x200',
        },
      ];
      return mockData;
    } catch (error) {
      return rejectWithValue('Failed to fetch trending content');
    }
  }
);

export const searchContent = createAsyncThunk(
  'content/searchContent',
  async (params: { query: string; type?: ContentItem['type'] }, { rejectWithValue }) => {
    try {
      // Mock search results
      const mockData: ContentItem[] = [
        {
          id: 'search1',
          type: 'news',
          title: `Search result for: ${params.query}`,
          description: 'Search result description...',
          image: 'https://via.placeholder.com/400x200',
        },
      ];
      return mockData;
    } catch (error) {
      return rejectWithValue('Failed to search content');
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
                   state.trending.find(item => item.id === itemId);
      
      if (item && !state.favorites.find(fav => fav.id === itemId)) {
        state.favorites.push({ ...item, isFavorite: true });
      }
      
      // Update the item in feed and trending
      state.feed = state.feed.map(item => 
        item.id === itemId ? { ...item, isFavorite: true } : item
      );
      state.trending = state.trending.map(item => 
        item.id === itemId ? { ...item, isFavorite: true } : item
      );
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.favorites = state.favorites.filter(item => item.id !== itemId);
      
      // Update the item in feed and trending
      state.feed = state.feed.map(item => 
        item.id === itemId ? { ...item, isFavorite: false } : item
      );
      state.trending = state.trending.map(item => 
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
} = contentSlice.actions;

export default contentSlice.reducer;
