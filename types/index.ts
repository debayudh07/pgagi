export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  categories: string[];
  darkMode: boolean;
  language: string;
  feedSettings: FeedSettings;
}

export interface FeedSettings {
  newsEnabled: boolean;
  moviesEnabled: boolean;
  musicEnabled: boolean;
  socialEnabled: boolean;
  itemsPerPage: number;
}

export interface ContentItem {
  id: string;
  type: 'news' | 'movie' | 'music' | 'social';
  title: string;
  description?: string;
  image?: string;
  url?: string;
  publishedAt?: string;
  source?: string;
  isFavorite?: boolean;
}

export interface NewsArticle extends ContentItem {
  type: 'news';
  author?: string;
  category: string;
  content?: string;
}

export interface Movie extends ContentItem {
  type: 'movie';
  releaseDate?: string;
  rating?: number;
  genre?: string[];
  duration?: number;
}

export interface MusicTrack extends ContentItem {
  type: 'music';
  artist: string;
  album?: string;
  duration?: number;
  previewUrl?: string;
  isPlaying?: boolean;
  popularity?: number;
  explicit?: boolean;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  image?: string;
  followers?: number;
  genres?: string[];
  popularity?: number;
  url?: string;
}

export interface SpotifyTopArtistWithTracks {
  artist: SpotifyArtist;
  topTracks: MusicTrack[];
}

export interface SocialPost extends ContentItem {
  type: 'social';
  platform: 'twitter' | 'instagram' | 'facebook';
  username: string;
  likes?: number;
  comments?: number;
  hashtags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  totalResults?: number;
  status: 'success' | 'error';
  message?: string;
}

export interface SearchParams {
  query: string;
  category?: string;
  type?: ContentItem['type'];
  page?: number;
  limit?: number;
}

export interface DragDropItem {
  id: string;
  index: number;
  type: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
