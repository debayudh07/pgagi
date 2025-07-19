import { MusicTrack, ApiResponse, SpotifyArtist, SpotifyTopArtistWithTracks } from '../../types';

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_URL = process.env.NEXT_PUBLIC_SPOTIFY_API_URL;

export interface MusicApiParams {
  limit?: number;
  market?: string;
  query?: string;
  genre?: string;
  year?: string;
}

export class MusicService {
  private static baseUrl = SPOTIFY_API_URL || 'https://api.spotify.com/v1';
  private static clientId = SPOTIFY_CLIENT_ID;
  private static clientSecret = SPOTIFY_CLIENT_SECRET;
  private static accessToken: string | null = null;

  private static async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // Reset token after expiry
      setTimeout(() => {
        this.accessToken = null;
      }, (data.expires_in - 60) * 1000);

      return this.accessToken || '';
    } catch (error) {
      console.error('Spotify Auth Error:', error);
      return '';
    }
  }

  static async getTopArtists(params: MusicApiParams = {}): Promise<ApiResponse<SpotifyArtist[]>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          data: this.getMockArtists(),
          status: 'success',
          message: 'Using mock data - no Spotify token',
        };
      }
      
      // Search for popular artists from recent years
      const response = await fetch(`${this.baseUrl}/search?q=year:2023-2024&type=artist&limit=${params.limit || 20}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const artists: SpotifyArtist[] = data.artists?.items?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        image: artist.images?.[0]?.url || '',
        followers: artist.followers?.total || 0,
        genres: artist.genres || [],
        popularity: artist.popularity || 0,
        url: artist.external_urls?.spotify || '',
      })) || [];

      return {
        data: artists,
        status: 'success',
      };
    } catch (error) {
      console.error('Spotify Top Artists Error:', error);
      
      return {
        data: this.getMockArtists(),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<ApiResponse<MusicTrack[]>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          data: this.getMockTracks(),
          status: 'success',
          message: 'Using mock data - no Spotify token',
        };
      }
      
      const response = await fetch(`${this.baseUrl}/artists/${artistId}/top-tracks?market=${market}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const tracks: MusicTrack[] = data.tracks?.map((track: any) => ({
        id: track.id,
        type: 'music' as const,
        title: track.name || '',
        description: `${track.artists?.[0]?.name || 'Unknown Artist'} • ${track.album?.name || 'Unknown Album'}`,
        image: track.album?.images?.[0]?.url || '',
        url: track.external_urls?.spotify || '',
        artist: track.artists?.[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        duration: track.duration_ms || 0,
        previewUrl: track.preview_url || '',
        popularity: track.popularity || 0,
        explicit: track.explicit || false,
        isPlaying: false,
      })) || [];

      return {
        data: tracks,
        status: 'success',
      };
    } catch (error) {
      console.error('Artist Top Tracks Error:', error);
      return {
        data: this.getMockTracks(),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async getTopArtistsWithTracks(params: MusicApiParams = {}): Promise<ApiResponse<SpotifyTopArtistWithTracks[]>> {
    try {
      const artistsResponse = await this.getTopArtists(params);
      if (artistsResponse.status === 'error') {
        throw new Error('Failed to fetch artists');
      }

      const artistsWithTracks: SpotifyTopArtistWithTracks[] = [];
      
      // Get top tracks for each artist (limit to first 5 artists to avoid rate limiting)
      const limitedArtists = artistsResponse.data.slice(0, 5);
      
      for (const artist of limitedArtists) {
        const tracksResponse = await this.getArtistTopTracks(artist.id);
        artistsWithTracks.push({
          artist,
          topTracks: tracksResponse.data.slice(0, 5), // Limit to top 5 tracks per artist
        });
      }

      return {
        data: artistsWithTracks,
        status: 'success',
      };
    } catch (error) {
      console.error('Top Artists with Tracks Error:', error);
      
      return {
        data: this.getMockArtistsWithTracks(),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async getTopTracks(params: MusicApiParams = {}): Promise<ApiResponse<MusicTrack[]>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          data: this.getMockTracks(),
          status: 'success',
          message: 'Using mock data - no Spotify token',
        };
      }

      // Search for top tracks from recent years
      const searchQuery = params.genre 
        ? `genre:${params.genre} year:2023-2024`
        : 'year:2023-2024';

      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${params.limit || 20}&market=${params.market || 'US'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const tracks: MusicTrack[] = data.tracks?.items?.map((track: any) => ({
        id: track.id,
        type: 'music' as const,
        title: track.name || '',
        description: `${track.artists?.[0]?.name || 'Unknown Artist'} • ${track.album?.name || 'Unknown Album'}`,
        image: track.album?.images?.[0]?.url || '',
        url: track.external_urls?.spotify || '',
        artist: track.artists?.[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        duration: track.duration_ms || 0,
        previewUrl: track.preview_url || '',
        popularity: track.popularity || 0,
        explicit: track.explicit || false,
        isPlaying: false,
      })) || [];

      return {
        data: tracks,
        status: 'success',
      };
    } catch (error) {
      console.error('Top Tracks Error:', error);
      return {
        data: this.getMockTracks(),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async getTracksByGenre(genre: string, params: MusicApiParams = {}): Promise<ApiResponse<MusicTrack[]>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          data: this.getMockTracks(),
          status: 'success',
          message: 'Using mock data - no Spotify token',
        };
      }

      const searchQuery = `genre:"${genre}" year:2023-2024`;
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${params.limit || 20}&market=${params.market || 'US'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const tracks: MusicTrack[] = data.tracks?.items?.map((track: any) => ({
        id: track.id,
        type: 'music' as const,
        title: track.name || '',
        description: `${track.artists?.[0]?.name || 'Unknown Artist'} • ${track.album?.name || 'Unknown Album'}`,
        image: track.album?.images?.[0]?.url || '',
        url: track.external_urls?.spotify || '',
        artist: track.artists?.[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        duration: track.duration_ms || 0,
        previewUrl: track.preview_url || '',
        popularity: track.popularity || 0,
        explicit: track.explicit || false,
        isPlaying: false,
      })) || [];

      return {
        data: tracks,
        status: 'success',
      };
    } catch (error) {
      console.error('Genre Tracks Error:', error);
      return {
        data: this.getMockTracks().filter(track => 
          (track.description || '').toLowerCase().includes(genre.toLowerCase())
        ),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async getAvailableGenres(): Promise<ApiResponse<string[]>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          data: this.getMockGenres(),
          status: 'success',
          message: 'Using mock data - no Spotify token',
        };
      }

      const response = await fetch(`${this.baseUrl}/recommendations/available-genre-seeds`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        data: data.genres || this.getMockGenres(),
        status: 'success',
      };
    } catch (error) {
      console.error('Available Genres Error:', error);
      return {
        data: this.getMockGenres(),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async searchTracks(query: string): Promise<ApiResponse<MusicTrack[]>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          data: this.getMockTracks().filter(track => 
            track.title.toLowerCase().includes(query.toLowerCase()) ||
            track.artist.toLowerCase().includes(query.toLowerCase())
          ),
          status: 'success',
          message: 'Using mock data - no Spotify token',
        };
      }

      const searchParams = new URLSearchParams({
        q: query,
        type: 'track',
        limit: '20',
      });

      const response = await fetch(`${this.baseUrl}/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const tracks: MusicTrack[] = data.tracks?.items?.map((track: any) => ({
        id: track.id,
        type: 'music' as const,
        title: track.name || '',
        description: `${track.artists?.[0]?.name || 'Unknown Artist'} • ${track.album?.name || 'Unknown Album'}`,
        image: track.album?.images?.[0]?.url || '',
        url: track.external_urls?.spotify || '',
        artist: track.artists?.[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        duration: track.duration_ms || 0,
        previewUrl: track.preview_url || '',
        popularity: track.popularity || 0,
        explicit: track.explicit || false,
        isPlaying: false,
      })) || [];

      return {
        data: tracks,
        status: 'success',
      };
    } catch (error) {
      console.error('Music Search Error:', error);
      return {
        data: this.getMockTracks().filter(track => 
          track.title.toLowerCase().includes(query.toLowerCase()) ||
          track.artist.toLowerCase().includes(query.toLowerCase())
        ),
        status: 'success',
        message: 'Using mock data',
      };
    }
  }

  static async getTrendingTracks(): Promise<ApiResponse<MusicTrack[]>> {
    return this.getTopTracks();
  }

  private static getMockArtists(): SpotifyArtist[] {
    return [
      {
        id: 'artist1',
        name: 'The Weeknd',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        followers: 15000000,
        genres: ['pop', 'r&b'],
        popularity: 95,
        url: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ',
      },
      {
        id: 'artist2',
        name: 'Billie Eilish',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        followers: 12000000,
        genres: ['pop', 'alternative'],
        popularity: 92,
        url: 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd8DAH',
      },
      {
        id: 'artist3',
        name: 'Drake',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        followers: 18000000,
        genres: ['hip-hop', 'rap'],
        popularity: 97,
        url: 'https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4',
      },
      {
        id: 'artist4',
        name: 'Taylor Swift',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        followers: 20000000,
        genres: ['pop', 'country'],
        popularity: 98,
        url: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02',
      },
      {
        id: 'artist5',
        name: 'Ed Sheeran',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        followers: 14000000,
        genres: ['pop', 'acoustic'],
        popularity: 94,
        url: 'https://open.spotify.com/artist/6eUKZXaKkcviH0Ku9w2n3V',
      },
    ];
  }

  private static getMockArtistsWithTracks(): SpotifyTopArtistWithTracks[] {
    const artists = this.getMockArtists();
    const tracks = this.getMockTracks();
    
    return artists.map((artist, index) => ({
      artist,
      topTracks: tracks.slice(index * 2, (index + 1) * 2 + 1),
    }));
  }

  private static getMockTracks(): MusicTrack[] {
    return [
      {
        id: 'track1',
        type: 'music',
        title: 'Blinding Lights',
        description: 'The Weeknd • After Hours',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        url: 'https://open.spotify.com/track/0VjIjW4GlUKOO8j8JiN9V4',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200040,
        previewUrl: 'https://www.w3schools.com/html/horse.mp3',
        popularity: 95,
        explicit: false,
        isPlaying: false,
      },
      {
        id: 'track2',
        type: 'music',
        title: 'Bad Guy',
        description: 'Billie Eilish • When We All Fall Asleep, Where Do We Go?',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        url: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m',
        artist: 'Billie Eilish',
        album: 'When We All Fall Asleep, Where Do We Go?',
        duration: 194088,
        previewUrl: 'https://www.w3schools.com/html/horse.mp3',
        popularity: 92,
        explicit: false,
        isPlaying: false,
      },
      {
        id: 'track3',
        type: 'music',
        title: 'God\'s Plan',
        description: 'Drake • Scorpion',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        url: 'https://open.spotify.com/track/6DCZcSspjsKoFjzjrWoCdn',
        artist: 'Drake',
        album: 'Scorpion',
        duration: 198973,
        previewUrl: 'https://www.w3schools.com/html/horse.mp3',
        popularity: 97,
        explicit: true,
        isPlaying: false,
      },
      {
        id: 'track4',
        type: 'music',
        title: 'Anti-Hero',
        description: 'Taylor Swift • Midnights',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        url: 'https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu',
        artist: 'Taylor Swift',
        album: 'Midnights',
        duration: 200690,
        previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
        popularity: 98,
        explicit: false,
        isPlaying: false,
      },
      {
        id: 'track5',
        type: 'music',
        title: 'Shape of You',
        description: 'Ed Sheeran • ÷ (Divide)',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        artist: 'Ed Sheeran',
        album: '÷ (Divide)',
        duration: 233713,
        previewUrl: 'https://p.scdn.co/mp3-preview/6c6b8dc6db2ad00e9e8f5d0b48df1426ccef4b9f?cid=774b29d4f13844c495f206cafdad9c86',
        popularity: 94,
        explicit: false,
        isPlaying: false,
      },
      {
        id: 'track6',
        type: 'music',
        title: 'Watermelon Sugar',
        description: 'Harry Styles • Fine Line',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        url: 'https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY',
        artist: 'Harry Styles',
        album: 'Fine Line',
        duration: 174000,
        previewUrl: 'https://p.scdn.co/mp3-preview/5c6b8dc6db2ad00e9e8f5d0b48df1426ccef4b9f?cid=774b29d4f13844c495f206cafdad9c86',
        popularity: 89,
        explicit: false,
        isPlaying: false,
      },
    ];
  }

  private static getMockGenres(): string[] {
    return [
      'pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic', 'country',
      'blues', 'reggae', 'folk', 'metal', 'punk', 'alternative', 'indie',
      'r-n-b', 'soul', 'funk', 'disco', 'house', 'techno', 'ambient'
    ];
  }
}
