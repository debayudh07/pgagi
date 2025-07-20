/*eslint-disable*/
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTrendingContent, setActiveTab } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem, MusicTrack } from '../../types';

interface TrendingSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { trending, loading, activeTab, topTracks, music } = useAppSelector(state => state.content);
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'news' | 'movie'>('all');

  // Get top tracks for trending display (combine topTracks and music data)
  const allMusicTracks = [...(topTracks || []), ...(music || [])].filter(item => item.type === 'music');
  const topMusicTracks = allMusicTracks.slice(0, 6); // Get top 6 tracks

  useEffect(() => {
    dispatch(fetchTrendingContent());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTrendingContent());
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Trending action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  const handleTabClick = (type: 'all' | 'news' | 'movie') => {
    setSelectedFilter(type);
    console.log(`🔥 Filtering trending by: ${type}`);
  };

  // Filter trending content based on selected tab
  const filteredContent = selectedFilter === 'all' 
    ? trending 
    : trending.filter(item => item.type === selectedFilter);

  console.log(`🔥 Trending content stats:`, {
    total: trending.length,
    filtered: filteredContent.length,
    filter: selectedFilter,
    byType: {
      news: trending.filter(item => item.type === 'news').length,
      movie: trending.filter(item => item.type === 'movie').length,
      social: trending.filter(item => item.type === 'social').length,
    }
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-orange-500/20 backdrop-blur-sm border-2 border-orange-500 rounded-lg">
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ff6600' }}>
              🔥 TRENDING NOW
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              {trending.length} viral {trending.length === 1 ? 'phenomenon' : 'phenomena'} breaking the internet! 💥
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading.isLoading}
          className="gap-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 ${loading.isLoading ? 'animate-spin' : ''}`} />
          🔄 REFRESH
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          onClick={() => handleTabClick('all')}
          className={`font-bold transition-all duration-300 ${
            selectedFilter === 'all'
              ? 'bg-orange-500 text-white border-orange-400'
              : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
          }`}
        >
          🔥 ALL ({trending.length})
        </Button>
        <Button
          variant={selectedFilter === 'news' ? 'default' : 'outline'}
          onClick={() => handleTabClick('news')}
          className={`font-bold transition-all duration-300 ${
            selectedFilter === 'news'
              ? 'bg-blue-500 text-white border-blue-400'
              : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
          }`}
        >
          📰 NEWS ({trending.filter(item => item.type === 'news').length})
        </Button>
        <Button
          variant={selectedFilter === 'movie' ? 'default' : 'outline'}
          onClick={() => handleTabClick('movie')}
          className={`font-bold transition-all duration-300 ${
            selectedFilter === 'movie'
              ? 'bg-purple-500 text-white border-purple-400'
              : 'border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'
          }`}
        >
          🎬 MOVIES ({trending.filter(item => item.type === 'movie').length})
        </Button>
      </div>

      {/* Trending Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Card 
          className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer ${
            selectedFilter === 'news' 
              ? 'border-blue-400 shadow-blue-500/40 bg-blue-500/10' 
              : theme.isDark
                ? 'bg-black/80 border-orange-500 shadow-blue-500/20 hover:shadow-blue-500/40'
                : 'bg-white/90 border-orange-600 shadow-blue-600/20 hover:shadow-blue-600/40'
          }`}
          onClick={() => handleTabClick('news')}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">📰</span>
              <div>
                <p className="font-black text-lg md:text-xl text-blue-400">
                  {trending.filter(item => item.type === 'news').length}
                </p>
                <p className={`text-xs md:text-sm font-bold transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-700'
                }`}>Breaking News</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer ${
            selectedFilter === 'movie' 
              ? 'border-purple-400 shadow-purple-500/40 bg-purple-500/10' 
              : theme.isDark
                ? 'bg-black/80 border-orange-500 shadow-purple-500/20 hover:shadow-purple-500/40'
                : 'bg-white/90 border-orange-600 shadow-purple-600/20 hover:shadow-purple-600/40'
          }`}
          onClick={() => handleTabClick('movie')}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">🎬</span>
              <div>
                <p className="font-black text-lg md:text-xl text-purple-400">
                  {trending.filter(item => item.type === 'movie').length}
                </p>
                <p className={`text-xs md:text-sm font-bold transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-700'
                }`}>Hot Movies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tracks Section */}
      <Card className={`backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
        theme.isDark
          ? 'bg-black/80 border-yellow-500 shadow-yellow-500/20'
          : 'bg-white/90 border-yellow-600 shadow-yellow-600/20'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl font-black ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <TrendingUp className="h-6 w-6 text-yellow-500" />
            🔥 TRENDING TRACKS 2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Use actual tracks from music section */}
            {topMusicTracks.length > 0 ? (
              topMusicTracks.map((track, index) => {
                const musicTrack = track as MusicTrack; // Type cast to access music-specific properties
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      theme.isDark
                        ? 'bg-gray-800/50 border-gray-700 hover:border-yellow-500'
                        : 'bg-gray-50 border-gray-200 hover:border-yellow-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                        index < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gray-300 text-gray-700'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{track.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{musicTrack.artist || track.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-400">
                            🎵 {musicTrack.album || 'Track'}
                          </Badge>
                          {musicTrack.duration && (
                            <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-400">
                              ⏱️ {Math.floor(musicTrack.duration / 60)}:{String(musicTrack.duration % 60).padStart(2, '0')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/20"
                        onClick={() => console.log(`Playing ${track.title}`)}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Fallback to placeholder data if no tracks available
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                    theme.isDark
                      ? 'bg-gray-800/50 border-gray-700 hover:border-yellow-500'
                      : 'bg-gray-50 border-gray-200 hover:border-yellow-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      index < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">Loading Track {index + 1}...</h4>
                      <p className="text-xs text-gray-500 truncate">Artist Name</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-400">
                          🎵 1.2B
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-400">
                          📈 +18%
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/20"
                      onClick={() => console.log(`Playing Track ${index + 1}`)}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading.isLoading && trending.length === 0 && (
        <Card className={`backdrop-blur-xl border-2 shadow-lg ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/80 border-orange-500 shadow-orange-500/20'
            : 'bg-white/90 border-orange-600 shadow-orange-600/20'
        }`}>
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className={`text-xl font-black mb-2 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>🔥 SCANNING TRENDS</h3>
              <p className="text-orange-400 font-bold">Detecting viral phenomena...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {loading.error && (
        <Card className={`backdrop-blur-xl border-2 shadow-lg ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/80 border-red-500 shadow-red-500/20'
            : 'bg-white/90 border-red-600 shadow-red-600/20'
        }`}>
          <CardContent className="p-6 md:p-8">
            <div className="text-center">
              <span className="text-4xl mb-4 block">💥</span>
              <h3 className="font-black text-xl text-red-400 mb-2">TRENDING MALFUNCTION!</h3>
              <p className={`font-bold mb-4 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>{loading.error}</p>
              <Button 
                onClick={handleRefresh} 
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🔄 RESTART SCAN
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`backdrop-blur-md border rounded-lg p-4 md:p-6 ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/40 border-orange-500/30'
            : 'bg-white/40 border-orange-400/50'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <span className="text-2xl md:text-3xl">🔥</span>
          <h3 className={`text-lg md:text-xl font-black transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {selectedFilter === 'all' ? 'VIRAL CONTENT' : 
             selectedFilter === 'news' ? 'BREAKING NEWS' :
             selectedFilter === 'movie' ? 'HOT MOVIES' :
             'VIRAL POSTS'}
          </h3>
          <Badge className={`border font-bold ${
            selectedFilter === 'all' ? 'bg-orange-500/80 text-white border-orange-400' :
            selectedFilter === 'news' ? 'bg-blue-500/80 text-white border-blue-400' :
            selectedFilter === 'movie' ? 'bg-purple-500/80 text-white border-purple-400' :
            'bg-red-500/80 text-white border-red-400'
          }`}>
            {filteredContent.length}
          </Badge>
        </div>
        
        {filteredContent.length === 0 && !loading.isLoading ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">
              {selectedFilter === 'news' ? '📰' :
               selectedFilter === 'movie' ? '🎬' : '🔥'}
            </span>
            <h3 className={`font-black text-xl mb-2 transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              NO {selectedFilter.toUpperCase()} CONTENT YET
            </h3>
            <p className="text-orange-400 font-bold">
              {selectedFilter === 'all' ? 'Check back soon for trending content!' :
               `No ${selectedFilter} content found in trending right now.`}
            </p>
          </div>
        ) : (
          <ContentGrid
            items={filteredContent}
            onAction={handleContentAction}
            enableDragDrop={false}
            className="min-h-[400px]"
          />
        )}
      </motion.div>

      {/* Update Frequency Info */}
      <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
        theme.isDark
          ? 'bg-black/60 border-orange-500/30'
          : 'bg-white/60 border-orange-400/50'
      }`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-400">
                ⚡ Live trending updates every 15 minutes
              </span>
            </div>
            <span className="text-xs text-orange-400 font-bold">
              Last scan: {new Date().toLocaleTimeString()} 🕐
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
