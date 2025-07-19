import { MusicTrack } from '../../types';

export interface SpotifyPlaybackState {
  is_playing: boolean;
  item?: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    duration_ms: number;
    preview_url?: string;
    external_urls: {
      spotify: string;
    };
  };
  device?: {
    id: string;
    name: string;
    type: string;
    volume_percent: number;
  };
  progress_ms: number;
}

export interface SpotifyUserPlaylists {
  items: Array<{
    id: string;
    name: string;
    description?: string;
    images: Array<{ url: string }>;
    tracks: {
      total: number;
    };
    external_urls: {
      spotify: string;
    };
  }>;
}

export interface SpotifyTopTracks {
  items: Array<{
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    duration_ms: number;
    preview_url?: string;
    external_urls: {
      spotify: string;
    };
    popularity: number;
  }>;
}

export class SpotifyUserService {
  private static baseUrl = 'https://api.spotify.com/v1';

  private static async makeAuthenticatedRequest(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getCurrentPlayback(accessToken: string): Promise<SpotifyPlaybackState | null> {
    try {
      const data = await this.makeAuthenticatedRequest('/me/player', accessToken);
      return data;
    } catch (error) {
      console.error('Failed to get current playback:', error);
      return null;
    }
  }

  static async getUserPlaylists(accessToken: string, limit: number = 20): Promise<SpotifyUserPlaylists> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/me/playlists?limit=${limit}`,
        accessToken
      );
      return data;
    } catch (error) {
      console.error('Failed to get user playlists:', error);
      return { items: [] };
    }
  }

  static async getUserTopTracks(accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<SpotifyTopTracks> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        accessToken
      );
      return data;
    } catch (error) {
      console.error('Failed to get user top tracks:', error);
      return { items: [] };
    }
  }

  static async getUserTopArtists(accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20) {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
        accessToken
      );
      return data;
    } catch (error) {
      console.error('Failed to get user top artists:', error);
      return { items: [] };
    }
  }

  static async playTrack(accessToken: string, trackUri: string, deviceId?: string): Promise<void> {
    try {
      const body: any = {
        uris: [trackUri]
      };

      const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
      
      await this.makeAuthenticatedRequest(endpoint, accessToken, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Failed to play track:', error);
      throw error;
    }
  }

  static async pausePlayback(accessToken: string, deviceId?: string): Promise<void> {
    try {
      const endpoint = deviceId ? `/me/player/pause?device_id=${deviceId}` : '/me/player/pause';
      
      await this.makeAuthenticatedRequest(endpoint, accessToken, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to pause playback:', error);
      throw error;
    }
  }

  static async resumePlayback(accessToken: string, deviceId?: string): Promise<void> {
    try {
      const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
      
      await this.makeAuthenticatedRequest(endpoint, accessToken, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to resume playback:', error);
      throw error;
    }
  }

  static async getUserDevices(accessToken: string) {
    try {
      const data = await this.makeAuthenticatedRequest('/me/player/devices', accessToken);
      return data;
    } catch (error) {
      console.error('Failed to get user devices:', error);
      return { devices: [] };
    }
  }

  static async transferPlayback(accessToken: string, deviceId: string, play: boolean = false): Promise<void> {
    try {
      await this.makeAuthenticatedRequest('/me/player', accessToken, {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play,
        }),
      });
    } catch (error) {
      console.error('Failed to transfer playback:', error);
      throw error;
    }
  }

  static convertToMusicTrack(spotifyTrack: any): MusicTrack {
    return {
      id: spotifyTrack.id,
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map((artist: any) => artist.name).join(', '),
      album: spotifyTrack.album.name,
      duration: spotifyTrack.duration_ms,
      image: spotifyTrack.album.images[0]?.url,
      url: spotifyTrack.external_urls.spotify,
      previewUrl: spotifyTrack.preview_url,
      popularity: spotifyTrack.popularity || 0,
      explicit: spotifyTrack.explicit || false,
      type: 'music',
    };
  }
}
