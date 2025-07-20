/*eslint-disable*/
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Filter, SortAsc, Grid, List, Shuffle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { useTheme } from '../../lib/useTheme';

export interface FilterState {
  genre?: string;
  sortBy: 'title' | 'date' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  showFavoritesOnly: boolean;
}

interface ContentFiltersProps {
  availableGenres: string[];
  currentFilter: FilterState;
  onFilterChange: (filter: Partial<FilterState>) => void;
  itemCount: number;
  contentType: 'movies' | 'news' | 'music' | 'social';
}

export const ContentFilters: React.FC<ContentFiltersProps> = ({
  availableGenres,
  currentFilter,
  onFilterChange,
  itemCount,
  contentType,
}) => {
  const theme = useTheme();

  const getTypeColor = () => {
    switch (contentType) {
      case 'movies':
        return 'purple';
      case 'news':
        return 'blue';
      case 'music':
        return 'green';
      case 'social':
        return 'orange';
      default:
        return 'purple';
    }
  };

  const color = getTypeColor();

  const sortOptions = [
    { value: 'title', label: '📝 Title', icon: '🔤' },
    { value: 'date', label: '📅 Date', icon: '🕐' },
    { value: 'rating', label: '⭐ Rating', icon: '🏆' },
    { value: 'popularity', label: '🔥 Popular', icon: '📈' },
  ];

  const handleShuffle = () => {
    // Trigger a random sort
    onFilterChange({ 
      sortBy: 'popularity', 
      sortOrder: Math.random() > 0.5 ? 'asc' : 'desc' 
    });
  };

  return (
    <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
      theme.isDark
        ? 'bg-black/60 border-orange-500/30'
        : 'bg-white/60 border-orange-400/50'
    }`}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className={`h-5 w-5 text-${color}-400`} />
            <h3 className={`text-lg font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              🎛️ FILTER & SORT
            </h3>
          </div>
          <Badge className={`bg-${color}-500/80 text-white border-${color}-400 font-bold`}>
            {itemCount} items
          </Badge>
        </div>

        {/* Genre Filter */}
        {availableGenres.length > 0 && (
          <div>
            <h4 className={`text-sm font-bold mb-2 transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              🎭 Genres & Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!currentFilter.genre ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ genre: undefined })}
                className={`font-bold transition-all duration-300 transform hover:scale-105 ${
                  !currentFilter.genre 
                    ? `bg-${color}-500 hover:bg-${color}-600 text-white border-2 border-${color}-400`
                    : `border-2 border-${color}-500 text-${color}-400 hover:bg-${color}-500 hover:text-white`
                }`}
              >
                🌟 ALL
              </Button>
              {availableGenres.map((genre) => (
                <Button
                  key={genre}
                  variant={currentFilter.genre === genre ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFilterChange({ genre })}
                  className={`font-bold transition-all duration-300 transform hover:scale-105 ${
                    currentFilter.genre === genre
                      ? `bg-${color}-500 hover:bg-${color}-600 text-white border-2 border-${color}-400`
                      : `border-2 border-${color}-500 text-${color}-400 hover:bg-${color}-500 hover:text-white`
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div>
          <h4 className={`text-sm font-bold mb-2 transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            🔄 Sort By
          </h4>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentFilter.sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ sortBy: option.value as any })}
                className={`font-bold transition-all duration-300 transform hover:scale-105 ${
                  currentFilter.sortBy === option.value
                    ? `bg-${color}-500 hover:bg-${color}-600 text-white border-2 border-${color}-400`
                    : `border-2 border-${color}-500 text-${color}-400 hover:bg-${color}-500 hover:text-white`
                }`}
              >
                {option.icon} {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              👁️ View
            </h4>
            <div className="flex gap-1">
              <Button
                variant={currentFilter.viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onFilterChange({ viewMode: 'grid' })}
                className={`transition-all duration-300 transform hover:scale-105 ${
                  currentFilter.viewMode === 'grid'
                    ? `bg-${color}-500 hover:bg-${color}-600 text-white border-2 border-${color}-400`
                    : `border-2 border-${color}-500 text-${color}-400 hover:bg-${color}-500 hover:text-white`
                }`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={currentFilter.viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onFilterChange({ viewMode: 'list' })}
                className={`transition-all duration-300 transform hover:scale-105 ${
                  currentFilter.viewMode === 'list'
                    ? `bg-${color}-500 hover:bg-${color}-600 text-white border-2 border-${color}-400`
                    : `border-2 border-${color}-500 text-${color}-400 hover:bg-${color}-500 hover:text-white`
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Order Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFilterChange({ 
                sortOrder: currentFilter.sortOrder === 'asc' ? 'desc' : 'asc' 
              })}
              className={`border-2 border-${color}-500 text-${color}-400 hover:bg-${color}-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105`}
            >
              <SortAsc className={`h-4 w-4 ${currentFilter.sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform duration-300`} />
            </Button>

            {/* Shuffle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleShuffle}
              className={`border-2 border-${color}-500 text-${color}-400 hover:bg-${color}-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105 hover:rotate-12`}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            {/* Favorites Toggle */}
            <Button
              variant={currentFilter.showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ 
                showFavoritesOnly: !currentFilter.showFavoritesOnly 
              })}
              className={`font-bold transition-all duration-300 transform hover:scale-105 ${
                currentFilter.showFavoritesOnly
                  ? 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-400'
                  : `border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white`
              }`}
            >
              ❤️ FAVS
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
