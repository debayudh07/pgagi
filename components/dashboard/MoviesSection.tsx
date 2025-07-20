'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Film, RefreshCw, Settings, Zap } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { ContentDetailModal } from '../content/ContentDetailModal';
import { ContentFilters, FilterState } from '../content/ContentFilters';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchMovies, applyContentOrder } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem, Movie } from '../../types';

interface MoviesSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const MoviesSection: React.FC<MoviesSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { movies, loading, favorites } = useAppSelector(state => state.content);
  const theme = useTheme();

  // State for personalization
  const [selectedMovie, setSelectedMovie] = useState<ContentItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    sortBy: 'popularity',
    sortOrder: 'desc',
    viewMode: 'grid',
    showFavoritesOnly: false,
  });

  // Get available genres from movies
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach(movie => {
      const movieData = movie as Movie;
      if (movieData.genre) {
        movieData.genre.forEach(g => genres.add(g));
      }
    });
    return Array.from(genres).sort();
  }, [movies]);

  // Filter and sort movies based on user preferences
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = [...movies];

    // Apply genre filter
    if (filter.genre) {
      filtered = filtered.filter(movie => {
        const movieData = movie as Movie;
        return movieData.genre?.includes(filter.genre!);
      });
    }

    // Apply favorites filter
    if (filter.showFavoritesOnly) {
      filtered = filtered.filter(movie => 
        favorites.some((fav: ContentItem) => fav.id === movie.id)
      );
    }

    // Sort movies
    filtered.sort((a, b) => {
      const movieA = a as Movie;
      const movieB = b as Movie;
      let comparison = 0;

      switch (filter.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          const dateA = movieA.releaseDate ? new Date(movieA.releaseDate).getTime() : 0;
          const dateB = movieB.releaseDate ? new Date(movieB.releaseDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'rating':
          comparison = (movieA.rating || 0) - (movieB.rating || 0);
          break;
        case 'popularity':
          // Use a combination of rating and recency for popularity
          const popularityA = (movieA.rating || 0) * 10 + (movieA.releaseDate ? 
            (new Date().getTime() - new Date(movieA.releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0);
          const popularityB = (movieB.rating || 0) * 10 + (movieB.releaseDate ? 
            (new Date().getTime() - new Date(movieB.releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0);
          comparison = popularityA - popularityB;
          break;
      }

      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [movies, filter, favorites]);

  useEffect(() => {
    if (movies.length === 0) {
      dispatch(fetchMovies({}));
    }
    // Temporarily disabled ordering functionality to prevent errors
    // TODO: Re-enable once ordering is properly implemented
    // else {
    //   dispatch(applyContentOrder({ contentType: 'movies' }));
    // }
  }, [dispatch, movies.length]);

  // Temporarily disabled ordering functionality
  // useEffect(() => {
  //   if (movies.length > 0) {
  //     dispatch(applyContentOrder({ contentType: 'movies' }));
  //   }
  // }, [dispatch, movies]);

  const handleRefresh = () => {
    dispatch(fetchMovies({}));
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`🎬 MoviesSection: ${action} action triggered for:`, item.id, item.title);
    
    if (action === 'view') {
      console.log('🎬 MoviesSection: Opening modal for item:', item);
      setSelectedMovie(item);
    } else {
      onContentAction?.(action, item);
    }
  };

  const handleFilterChange = (newFilter: Partial<FilterState>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
              {filteredAndSortedMovies.length} of {movies.length} epic {movies.length === 1 ? 'movie' : 'movies'} and shows 🍿
              {filter.genre && (
                <Badge className="ml-2 bg-purple-500/80 text-white border-purple-400 font-bold">
                  {filter.genre}
                </Badge>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleFilters}
            className={`gap-2 border-2 transition-all duration-300 transform hover:scale-105 font-bold ${
              showFilters 
                ? 'border-green-500 text-green-400 bg-green-500/20' 
                : 'border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            {showFilters ? '✅ FILTERS ON' : '🎛️ FILTERS'}
          </Button>
          
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
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ 
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
        >
          <ContentFilters
            availableGenres={availableGenres}
            currentFilter={filter}
            onFilterChange={handleFilterChange}
            itemCount={filteredAndSortedMovies.length}
            contentType="movies"
          />
        </motion.div>
      )}

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
          <Badge className="bg-purple-500/80 text-white border-purple-400 font-bold">
            {filteredAndSortedMovies.length}
          </Badge>
          {filter.showFavoritesOnly && (
            <Badge className="bg-red-500/80 text-white border-red-400 font-bold animate-pulse">
              ❤️ FAVORITES ONLY
            </Badge>
          )}
        </div>
        <ContentGrid
          items={filteredAndSortedMovies}
          onAction={handleContentAction}
          enableDragDrop={true}
          contentType="movies"
          className={`min-h-[400px] ${
            filter.viewMode === 'list' 
              ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        />
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <p className="font-black text-lg text-purple-400">
              {filteredAndSortedMovies.filter(m => (m as Movie).rating && (m as Movie).rating! >= 8).length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Top Rated (8+)</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🔥</div>
            <p className="font-black text-lg text-blue-400">
              {availableGenres.length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Genres Available</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">❤️</div>
            <p className="font-black text-lg text-green-400">
              {filteredAndSortedMovies.filter(m => favorites.some((fav: ContentItem) => fav.id === m.id)).length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>In Favorites</p>
          </CardContent>
        </Card>

        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📅</div>
            <p className="font-black text-lg text-yellow-400">
              {filteredAndSortedMovies.filter(m => {
                const movie = m as Movie;
                if (!movie.releaseDate) return false;
                const releaseYear = new Date(movie.releaseDate).getFullYear();
                const currentYear = new Date().getFullYear();
                return currentYear - releaseYear <= 2;
              }).length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Recent (2+ yrs)</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {filteredAndSortedMovies.length > 0 && (
        <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/60 border-orange-500/30'
            : 'bg-white/60 border-orange-400/50'
        }`}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className={`font-bold transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  🚀 Quick Actions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({ genre: undefined, showFavoritesOnly: false })}
                  className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-bold transition-all duration-300"
                >
                  🌟 Show All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({ showFavoritesOnly: true })}
                  className="border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all duration-300"
                >
                  ❤️ Favorites Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({ sortBy: 'rating', sortOrder: 'desc' })}
                  className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white font-bold transition-all duration-300"
                >
                  ⭐ Top Rated
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Detail Modal */}
      <ContentDetailModal
        item={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => {
          console.log('🎬 MoviesSection: Closing modal');
          setSelectedMovie(null);
        }}
      />

      {/* Debug Info for Modal */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          Modal State: {selectedMovie ? `Open (${selectedMovie.title})` : 'Closed'}
        </div>
      )}
    </div>
  );
};
