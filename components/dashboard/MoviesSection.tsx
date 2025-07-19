'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, RefreshCw } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchMovies } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem } from '../../types';

interface MoviesSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const MoviesSection: React.FC<MoviesSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { movies, loading } = useAppSelector(state => state.content);
  const theme = useTheme();

  useEffect(() => {
    if (movies.length === 0) {
      dispatch(fetchMovies({}));
    }
  }, [dispatch, movies.length]);

  const handleRefresh = () => {
    dispatch(fetchMovies({}));
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Movies action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-purple-500/20 backdrop-blur-sm border-2 border-purple-500 rounded-lg">
            <Film className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ff6600' }}>
              🎬 CINEMA UNIVERSE
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              {movies.length} epic {movies.length === 1 ? 'movie' : 'movies'} and shows 🍿
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading.isLoading}
          className="gap-2 border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 ${loading.isLoading ? 'animate-spin' : ''}`} />
          🔄 REFRESH
        </Button>
      </div>

      {/* Loading State */}
      {loading.isLoading && movies.length === 0 && (
        <Card className={`backdrop-blur-xl border-2 shadow-lg ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/80 border-purple-500 shadow-purple-500/20'
            : 'bg-white/90 border-purple-600 shadow-purple-600/20'
        }`}>
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className={`text-xl font-black mb-2 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>🎭 LOADING CINEMA</h3>
              <p className="text-purple-400 font-bold">Curating the best movies...</p>
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
              <h3 className="font-black text-xl text-red-400 mb-2">CINEMA OFFLINE!</h3>
              <p className={`font-bold mb-4 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>{loading.error}</p>
              <Button 
                onClick={handleRefresh} 
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🔄 RECONNECT
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
          <span className="text-2xl md:text-3xl">🎬</span>
          <h3 className={`text-lg md:text-xl font-black transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>BLOCKBUSTER COLLECTION</h3>
          <Badge className="bg-purple-500/80 text-white border-purple-400 font-bold">{movies.length}</Badge>
        </div>
        <ContentGrid
          items={movies}
          onAction={handleContentAction}
          enableDragDrop={false}
          className="min-h-[400px]"
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <p className="font-black text-lg text-purple-400">Top Rated</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Premium Quality</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🔥</div>
            <p className="font-black text-lg text-blue-400">Popular</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Most Watched</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🎭</div>
            <p className="font-black text-lg text-green-400">Now Playing</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>In Theaters</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
