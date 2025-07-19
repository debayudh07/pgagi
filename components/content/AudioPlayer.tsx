'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { playTrack, pauseTrack, stopAllTracks } from '../../store/slices/contentSlice';
import { MusicTrack } from '../../types';
import { useTheme } from '../../lib/useTheme';
import { useSession } from 'next-auth/react';

interface AudioPlayerProps {
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const { currentPlayingTrack } = useAppSelector(state => state.content);
  const { data: session } = useSession();
  const theme = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canPlay, setCanPlay] = useState(false);

  const isSpotifyConnected = session?.provider === 'spotify' && session?.accessToken;

  useEffect(() => {
    if (currentPlayingTrack && audioRef.current) {
      console.log('Setting up audio for track:', currentPlayingTrack.title, 'Preview URL:', currentPlayingTrack.previewUrl);
      setError(null);
      setCanPlay(false);
      
      if (currentPlayingTrack.previewUrl) {
        audioRef.current.src = currentPlayingTrack.previewUrl;
        audioRef.current.load();
        
        if (currentPlayingTrack.isPlaying) {
          console.log('Attempting to play track...');
          audioRef.current.play()
            .then(() => {
              console.log('Audio started playing successfully');
              setIsPlaying(true);
              setError(null);
            })
            .catch((error) => {
              console.error('Audio play failed:', error);
              setError('Failed to play audio. This might be due to browser autoplay policies.');
              dispatch(pauseTrack(currentPlayingTrack.id));
              setIsPlaying(false);
            });
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        console.warn('No preview URL available for track:', currentPlayingTrack.title);
        setError('No preview available for this track');
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setError(null);
    }
  }, [currentPlayingTrack, dispatch]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      console.log('Audio loaded successfully');
      setCanPlay(true);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      console.log('Audio playback ended');
      setIsPlaying(false);
      if (currentPlayingTrack) {
        dispatch(pauseTrack(currentPlayingTrack.id));
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Error loading audio. The preview may not be available.');
      setIsPlaying(false);
      setCanPlay(false);
    };

    const handleCanPlayThrough = () => {
      console.log('Audio can play through');
      setCanPlay(true);
      setError(null);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [currentPlayingTrack, dispatch]);

  const handlePlayPause = async () => {
    console.log('handlePlayPause called, isPlaying:', isPlaying);
    
    if (!currentPlayingTrack) {
      console.warn('No track to play/pause');
      return;
    }

    if (!audioRef.current) {
      console.warn('Audio ref not available');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
        dispatch(pauseTrack(currentPlayingTrack.id));
        setIsPlaying(false);
      } else {
        if (!currentPlayingTrack.previewUrl) {
          console.warn('No preview URL available');
          setError('No preview available for this track');
          return;
        }

        console.log('Playing audio');
        await audioRef.current.play();
        dispatch(playTrack(currentPlayingTrack));
        setIsPlaying(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      handleVolumeChange(volume || 0.5);
    } else {
      handleVolumeChange(0);
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Don't show the player if there's no current track
  if (!currentPlayingTrack) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        style={{ display: 'none' }}
      />
      
      <Card className={`fixed bottom-4 left-4 right-4 z-50 backdrop-blur-xl border-2 shadow-2xl transition-all duration-300 ${
        theme.isDark
          ? 'bg-black/90 border-green-500 shadow-green-500/30'
          : 'bg-white/90 border-green-600 shadow-green-600/30'
      } ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {currentPlayingTrack.image && (
                <img
                  src={currentPlayingTrack.image}
                  alt={currentPlayingTrack.title}
                  className="w-12 h-12 rounded-lg object-cover border border-green-500/30"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className={`font-bold text-sm truncate transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentPlayingTrack.title}
                </h4>
                <p className="text-xs text-green-400 truncate">
                  {currentPlayingTrack.artist}
                </p>
                {error && (
                  <p className="text-xs text-red-400 truncate">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={!canPlay && !currentPlayingTrack.previewUrl}
                className="h-10 w-10 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20 disabled:opacity-50 border border-green-500/30"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(currentTime)}
              </span>
              <div 
                className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percentage = (e.clientX - rect.left) / rect.width;
                  const newTime = percentage * duration;
                  handleSeek(newTime);
                }}
              >
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMuteToggle}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(stopAllTracks())}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              ✕
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
};
