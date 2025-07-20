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
  platform: 'instagram' | 'facebook';
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

export interface ContentTypePagination {
  news: PaginationState & { totalItems: number; isLoadingMore: boolean };
  movies: PaginationState & { totalItems: number; isLoadingMore: boolean };
  music: PaginationState & { totalItems: number; isLoadingMore: boolean };
  social: PaginationState & { totalItems: number; isLoadingMore: boolean };
}

// Spotify SDK Types
declare global {
  interface Window {
    Spotify: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

export interface SpotifyPlayer {
  addListener: (event: string, cb: (data: any) => void) => void;
  removeListener: (event: string, cb?: (data: any) => void) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  setName: (name: string) => Promise<void>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

export interface SpotifyPlayerState {
  context: {
    uri: string;
    metadata: any;
  };
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    next_tracks: SpotifyTrack[];
    previous_tracks: SpotifyTrack[];
  };
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  type: string;
  linked_from_uri: string | null;
  linked_from: any;
  media_type: string;
  name: string;
  duration_ms: number;
  artists: Array<{
    name: string;
    uri: string;
  }>;
  album: {
    name: string;
    uri: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  is_playable: boolean;
}
