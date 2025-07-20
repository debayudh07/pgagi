'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, RefreshCw, Play, Pause, ExternalLink, Users, Filter, Star } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { AudioPlayer } from '../content/AudioPlayer';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchMusic, 
  fetchTopArtistsWithTracks, 
  fetchTopTracks,
  fetchTracksByGenre,
  fetchAvailableGenres,
  playTrack, 
  pauseTrack,
  selectGenre,
  setSpotifyConnection,
  fetchUserPlaylists,
  fetchUserTopTracks,
  fetchUserTopArtists,
  playSpotifyTrack,
  pauseSpotifyPlayback,
  resumeSpotifyPlayback,
  initializeSpotifyPlayer,
  playTrackWithSDK,
  pausePlaybackSDK,
  resumePlaybackSDK
} from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem, MusicTrack, SpotifyTopArtistWithTracks } from '../../types';
import { useSession, signIn } from 'next-auth/react';

interface MusicSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const MusicSection: React.FC<MusicSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const contentState = useAppSelector(state => state.content);
  const theme = useTheme();
  const [showGenreFilter, setShowGenreFilter] = useState(false);
  const { data: session } = useSession();

  // Check if user is connected to Spotify
  const isSpotifyConnected = session?.provider === 'spotify' && session?.accessToken;
  const spotifyAccessToken = session?.accessToken;

  // Add safety checks for all state properties
  const music = contentState?.music || [];
  const topArtistsWithTracks = contentState?.topArtistsWithTracks || [];
  const topTracks = contentState?.topTracks || [];
  const genreTracks = contentState?.genreTracks || [];
  const availableGenres = contentState?.availableGenres || [];
  const selectedGenre = contentState?.selectedGenre || null;
  const currentPlayingTrack = contentState?.currentPlayingTrack || null;
  const loading = contentState?.loading || { isLoading: false, error: null };

  // Add safety checks for arrays
  const safeMusic = music || [];
  const safeTopArtistsWithTracks = topArtistsWithTracks || [];
  const safeTopTracks = topTracks || [];
  const safeGenreTracks = genreTracks || [];
  const safeAvailableGenres = availableGenres || [];

  // Update Spotify connection state
  useEffect(() => {
    if (isSpotifyConnected && spotifyAccessToken) {
      dispatch(setSpotifyConnection({ isConnected: true, accessToken: spotifyAccessToken }));
      // Fetch user's Spotify data
      dispatch(fetchUserPlaylists(spotifyAccessToken));
      dispatch(fetchUserTopTracks({ accessToken: spotifyAccessToken, timeRange: 'medium_term', limit: 20 }));
      dispatch(fetchUserTopArtists({ accessToken: spotifyAccessToken, timeRange: 'medium_term', limit: 10 }));
    } else {
      dispatch(setSpotifyConnection({ isConnected: false }));
    }
  }, [dispatch, isSpotifyConnected, spotifyAccessToken]);

  // Initialize Spotify Player when connected
  useEffect(() => {
    if (isSpotifyConnected && spotifyAccessToken && !contentState.spotifyPlayerReady) {
      // Wait for Spotify SDK to be ready
      const initPlayer = () => {
        dispatch(initializeSpotifyPlayer({ 
          accessToken: spotifyAccessToken,
          deviceName: 'PGAgi Web Player'
        }));
      };

      if (window.Spotify) {
        initPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = initPlayer;
      }
    }
  }, [dispatch, isSpotifyConnected, spotifyAccessToken, contentState.spotifyPlayerReady]);

  useEffect(() => {
    if (safeMusic.length === 0) {
      dispatch(fetchMusic({}));
    }
    if (safeTopArtistsWithTracks.length === 0) {
      dispatch(fetchTopArtistsWithTracks({ limit: 5 }));
    }
    if (safeTopTracks.length === 0) {
      dispatch(fetchTopTracks({ limit: 20 }));
    }
    if (safeAvailableGenres.length === 0) {
      dispatch(fetchAvailableGenres());
    }
  }, [dispatch, safeMusic.length, safeTopArtistsWithTracks.length, safeTopTracks.length, safeAvailableGenres.length]);

  // Fetch genre tracks when a genre is selected
  useEffect(() => {
    if (selectedGenre) {
      dispatch(fetchTracksByGenre({ genre: selectedGenre, limit: 20 }));
    }
  }, [dispatch, selectedGenre]);

  const handleRefresh = () => {
    dispatch(fetchMusic({}));
    dispatch(fetchTopArtistsWithTracks({ limit: 5 }));
    dispatch(fetchTopTracks({ limit: 20 }));
    if (selectedGenre) {
      dispatch(fetchTracksByGenre({ genre: selectedGenre, limit: 20 }));
    }
  };

  const handleGenreSelect = (genre: string | null) => {
    dispatch(selectGenre(genre));
    setShowGenreFilter(false);
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Music action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  const handlePlayTrack = (track: MusicTrack) => {
    console.log('handlePlayTrack called with:', track.title, track.previewUrl);
    
    // If Spotify is connected and we have the SDK ready, use SDK playback
    if (isSpotifyConnected && spotifyAccessToken && contentState.spotifyPlayerReady && contentState.spotifyDeviceId) {
      const trackUri = `spotify:track:${track.id}`;
      console.log('Using Spotify SDK to play track:', trackUri);
      dispatch(playTrackWithSDK({ 
        accessToken: spotifyAccessToken, 
        trackUri: trackUri, 
        deviceId: contentState.spotifyDeviceId 
      }));
      dispatch(playTrack(track));
      return;
    }
    
    // Fallback to preview URL playback
    if (!track.previewUrl) {
      console.warn('No preview URL available for track:', track.title);
      alert('Sorry, no preview available for this track');
      return;
    }
    
    if (currentPlayingTrack?.id === track.id && currentPlayingTrack?.isPlaying) {
      console.log('Pausing currently playing track');
      if (isSpotifyConnected && spotifyAccessToken && contentState.spotifyPlayerReady && contentState.spotifyDeviceId) {
        dispatch(pausePlaybackSDK({ 
          accessToken: spotifyAccessToken, 
          deviceId: contentState.spotifyDeviceId 
        }));
      }
      dispatch(pauseTrack(track.id));
    } else {
      console.log('Starting new track playback');
      dispatch(playTrack(track));
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const openInSpotify = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="w-full min-h-screen space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6 pb-20 sm:pb-24 md:pb-32">
      {/* Mobile-first Header */}
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 backdrop-blur-sm border-2 border-green-500 rounded-lg">
              <Music className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-4xl font-black transition-colors duration-300 leading-tight ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`} style={{ textShadow: '1px 1px 0px #ff6600' }}>
                🎵 SPOTIFY ZONE
              </h1>
              <p className="text-orange-500 font-bold text-xs sm:text-sm md:text-base mt-1">
                {safeTopArtistsWithTracks.length} artists • {safeMusic.length} tracks 🎧
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.isLoading}
            className="gap-1 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-bold transition-all duration-300 transform active:scale-95 text-xs px-3 py-2 self-start"
          >
            <RefreshCw className={`h-3 w-3 ${loading.isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">🔄 REFRESH</span>
            <span className="xs:hidden">🔄</span>
          </Button>
        </div>
      </div>

      {/* Genre Filter Section - Mobile Responsive */}
      <div className="flex flex-col space-y-2">
        <Button
          variant={showGenreFilter ? "default" : "outline"}
          onClick={() => setShowGenreFilter(!showGenreFilter)}
          className="gap-1 border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white font-bold transition-all duration-300 text-xs px-3 py-2 self-start"
        >
          <Filter className="h-3 w-3" />
          <span className="hidden xs:inline">{selectedGenre ? `🎵 ${selectedGenre}` : '🎭 ALL GENRES'}</span>
          <span className="xs:hidden">{selectedGenre ? '🎵' : '🎭'}</span>
        </Button>
        
        {showGenreFilter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-1 w-full"
          >
            <Button
              variant={!selectedGenre ? "default" : "outline"}
              onClick={() => handleGenreSelect(null)}
              className="text-xs font-bold border border-gray-400 px-2 py-1"
            >
              All
            </Button>
            {safeAvailableGenres.slice(0, 6).map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                onClick={() => handleGenreSelect(genre)}
                className="text-xs font-bold border border-purple-400 px-2 py-1"
              >
                {genre.length > 6 ? `${genre.substring(0, 6)}...` : genre}
              </Button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Spotify Account Connection */}
      <Card className={`w-full backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
        theme.isDark
          ? 'bg-black/80 border-green-500 shadow-green-500/20'
          : 'bg-white/90 border-green-600 shadow-green-600/20'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl font-black ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Users className="h-6 w-6 text-green-500" />
            🎧 YOUR SPOTIFY LIBRARY
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSpotifyConnected ? (
            <div className="space-y-6">
              {/* Connected State */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-green-500/10 border border-green-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Music className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-bold text-sm sm:text-base ${theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                      Connected to Spotify
                    </h3>
                    <p className="text-green-400 text-xs sm:text-sm truncate">
                      {session?.user?.name || session?.user?.email || 'Spotify User'}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white text-xs sm:text-sm px-2 py-1 self-start sm:self-auto">Connected</Badge>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-base sm:text-xl font-bold text-green-400">
                    {contentState.userPlaylists?.length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Playlists</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-base sm:text-xl font-bold text-purple-400">
                    {contentState.userTopTracks?.length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Top Tracks</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-base sm:text-xl font-bold text-blue-400">
                    {contentState.userTopArtists?.length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Top Artists</div>
                </div>
              </div>

              {/* User Top Tracks */}
              {contentState.userTopTracks && contentState.userTopTracks.length > 0 && (
                <div>
                  <h4 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎵 Your Top Tracks
                  </h4>
                  <div className="grid gap-2 sm:gap-3 max-h-64 sm:max-h-96 overflow-y-auto">
                    {contentState.userTopTracks.slice(0, 10).map((track, index) => (
                      <div
                        key={track.id}
                        className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                          theme.isDark
                            ? 'bg-gray-800/50 border-gray-700 hover:border-green-500'
                            : 'bg-gray-50 border-gray-200 hover:border-green-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm font-bold w-4 sm:w-6 text-center text-gray-400">
                            #{index + 1}
                          </span>
                          {track.image && (
                            <img 
                              src={track.image} 
                              alt={track.title}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className={`font-bold text-xs sm:text-sm truncate ${theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                              {track.title}
                            </h5>
                            <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (spotifyAccessToken && track.url) {
                                  const trackUri = `spotify:track:${track.id}`;
                                  dispatch(playSpotifyTrack({ accessToken: spotifyAccessToken, trackUri }));
                                } else {
                                  handlePlayTrack(track);
                                }
                              }}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                            >
                              <Play className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            </Button>
                            {track.url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(track.url, '_blank')}
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                              >
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                  <Music className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${theme.isDark ? 'text-white' : 'text-gray-900'}`}>
                  Connect Your Spotify Account
                </h3>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Link your Spotify account to access your personal playlists, liked songs, and recently played tracks
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base"
                  onClick={() => {
                    signIn('spotify', { callbackUrl: '/dashboard' });
                  }}
                >
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Connect with Spotify
                </Button>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Your Playlists</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Liked Songs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Recently Played</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Genre Tracks Section */}
      {selectedGenre && safeGenreTracks.length > 0 && (
        <Card className={`w-full backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-purple-500 shadow-purple-500/20'
            : 'bg-white/90 border-purple-600 shadow-purple-600/20'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-xl font-black ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Music className="h-6 w-6 text-purple-500" />
              🎭 {selectedGenre.toUpperCase()} TRACKS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {safeGenreTracks.slice(0, 8).map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 ${
                    theme.isDark
                      ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {track.image && (
                      <img 
                        src={track.image} 
                        alt={track.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          ⭐ {track.popularity}
                        </Badge>
                        {track.explicit && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">E</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlayTrack(track)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        {currentPlayingTrack?.id === track.id && currentPlayingTrack?.isPlaying ? (
                          <Pause className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        ) : (
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        )}
                      </Button>
                      {track.url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => track.url && openInSpotify(track.url)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading.isLoading && safeMusic.length === 0 && safeTopArtistsWithTracks.length === 0 && (
        <Card className={`backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-green-500 shadow-green-500/20'
            : 'bg-white/90 border-green-600 shadow-green-600/20'
        }`}>
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className={`text-xl font-black mb-2 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>🎼 CONNECTING TO SPOTIFY</h3>
              <p className="text-green-400 font-bold">Loading top artists and tracks...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {loading.error && (
        <Card className={`backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-red-500 shadow-red-500/20'
            : 'bg-white/90 border-red-600 shadow-red-600/20'
        }`}>
          <CardContent className="p-6 md:p-8">
            <div className="text-center">
              <span className="text-4xl mb-4 block">💥</span>
              <h3 className="font-black text-xl text-red-400 mb-2">SPOTIFY CONNECTION FAILED!</h3>
              <p className={`font-bold mb-4 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>{loading.error}</p>
              <Button 
                onClick={handleRefresh} 
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🔄 RETRY CONNECTION
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Artists with Their Tracks */}
      {safeTopArtistsWithTracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-4 sm:space-y-6"
        >
          <div className="flex flex-col gap-2 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl md:text-3xl">🎤</span>
              <h2 className={`text-base sm:text-lg md:text-2xl font-black transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>TOP ARTISTS & THEIR HITS</h2>
            </div>
            <Badge className="bg-green-500/80 text-white border-green-400 font-bold text-xs px-2 py-1 self-start">
              {safeTopArtistsWithTracks.length} Artists
            </Badge>
          </div>

          {safeTopArtistsWithTracks.map((artistData, index) => (
            <Card
              key={artistData.artist.id}
              className={`w-full max-w-full backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
                theme.isDark
                  ? 'bg-black/60 border-orange-500/50 shadow-orange-500/20'
                  : 'bg-white/60 border-orange-400/60 shadow-orange-400/20'
              }`}
            >
              <CardHeader className="pb-2 sm:pb-3 md:pb-4 px-3 sm:px-4 md:px-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={artistData.artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                      alt={artistData.artist.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className={`text-sm sm:text-base md:text-xl font-black transition-colors duration-300 truncate ${
                        theme.isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        #{index + 1} {artistData.artist.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-green-400 mt-1">
                        <Users className="h-3 w-3" />
                        <span className="text-xs font-bold truncate">
                          {artistData.artist.followers?.toLocaleString()} followers
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-500/80 text-white font-bold text-xs px-2 py-1">
                      {artistData.artist.popularity}% popularity
                    </Badge>
                    {artistData.artist.genres && artistData.artist.genres.length > 0 && (
                      <Badge variant="outline" className="border-orange-500 text-orange-400 text-xs px-2 py-1">
                        {artistData.artist.genres[0]}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => openInSpotify(artistData.artist.url || '')}
                      className="gap-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white text-xs px-2 py-1 h-auto"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden xs:inline">Spotify</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
                <h4 className={`text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  🔥 Top Tracks
                </h4>
                <div className="grid gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto">
                  {artistData.topTracks.map((track, trackIndex) => (
                    <div
                      key={track.id}
                      className={`w-full p-2 rounded-lg border transition-all duration-300 ${
                        currentPlayingTrack?.id === track.id && currentPlayingTrack?.isPlaying
                          ? theme.isDark 
                            ? 'bg-green-500/20 border-green-500' 
                            : 'bg-green-500/10 border-green-600'
                          : theme.isDark
                            ? 'bg-black/40 border-gray-600 hover:border-green-500/50'
                            : 'bg-white/40 border-gray-300 hover:border-green-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-6 text-center transition-colors duration-300 ${
                          theme.isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          #{trackIndex + 1}
                        </span>
                        <img
                          src={track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                          alt={track.title}
                          className="w-8 h-8 rounded object-cover border border-green-500/30 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className={`font-bold text-xs truncate transition-colors duration-300 ${
                            theme.isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {track.title}
                          </h5>
                          <p className="text-xs text-green-400 truncate">
                            {track.album} • {formatDuration(track.duration || 0)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="outline" className="border-purple-500 text-purple-400 text-xs px-1 py-0">
                            {track.popularity}%
                          </Badge>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayTrack(track)}
                            disabled={!track.previewUrl}
                            className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                          >
                            {currentPlayingTrack?.id === track.id && currentPlayingTrack?.isPlaying ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openInSpotify(track.url || '')}
                            className="h-6 w-6 p-0 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* All Tracks Grid */}
      {safeMusic.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`w-full backdrop-blur-md border rounded-lg p-3 sm:p-4 md:p-6 transition-colors duration-300 ${
            theme.isDark
              ? 'bg-black/40 border-orange-500/30'
              : 'bg-white/40 border-orange-400/50'
          }`}
        >
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
            <span className="text-xl sm:text-2xl md:text-3xl">🎵</span>
            <h3 className={`text-base sm:text-lg md:text-xl font-black transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>ALL TRACKS</h3>
            <Badge className="bg-green-500/80 text-white border-green-400 font-bold text-xs sm:text-sm">{safeMusic.length}</Badge>
          </div>
          <div className="w-full overflow-hidden">
            <ContentGrid
              items={safeMusic}
              onAction={handleContentAction}
              enableDragDrop={false}
              className="min-h-[300px] sm:min-h-[400px] w-full"
            />
          </div>
        </motion.div>
      )}

      {/* Music Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🎯</div>
            <p className="font-black text-sm sm:text-lg text-green-400">Charts</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Top Hits</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">✨</div>
            <p className="font-black text-sm sm:text-lg text-purple-400">New</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Releases</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🔥</div>
            <p className="font-black text-sm sm:text-lg text-blue-400">Trending</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Viral</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🎧</div>
            <p className="font-black text-sm sm:text-lg text-orange-400">Artists</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>{safeTopArtistsWithTracks.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Equalizer Visual */}
      <Card className={`backdrop-blur-md border transition-colors duration-300 ${
        theme.isDark
          ? 'bg-black/60 border-orange-500/30'
          : 'bg-white/60 border-orange-400/50'
      }`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-end gap-1 h-6 sm:h-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 sm:w-2 bg-green-500 rounded animate-pulse"
                  style={{
                    height: `${Math.random() * 100 + 20}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-400 text-center">
              🎵 Spotify integration active - {safeTopArtistsWithTracks.length} artists, {safeMusic.length} tracks loaded
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
};
