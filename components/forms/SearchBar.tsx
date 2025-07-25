/*eslint-disable*/
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { debounce } from '../../lib/utils';
import { useTheme } from '../../lib/useTheme';
import { ContentItem } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setSearchQuery, setActiveFilters, searchContent } from '../../store/slices/contentSlice';

interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}

interface SearchFilters {
  type?: ContentItem['type'];
  category?: string;
}

const contentTypes: { value: ContentItem['type']; label: string; icon: string }[] = [
  { value: 'news', label: 'News', icon: '📰' },
  { value: 'movie', label: 'Movies', icon: '🎬' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'social', label: 'Social', icon: '📱' },
];

const categories = [
  'technology',
  'business',
  'entertainment',
  'sports',
  'science',
  'health',
  'politics',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search for news, movies, music, and social posts...',
}) => {
  const dispatch = useAppDispatch();
  const { searchQuery, activeFilters, loading } = useAppSelector(state => state.content);
  const theme = useTheme();
  
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(activeFilters);

  // Debounced search function
  const debouncedSearch = debounce((query: string, searchFilters: SearchFilters) => {
    dispatch(setSearchQuery(query));
    dispatch(setActiveFilters(searchFilters));
    
    if (query.trim()) {
      dispatch(searchContent({ query: query.trim(), type: searchFilters.type }));
    }
    
    onSearch?.(query, searchFilters);
  }, 300);

  useEffect(() => {
    debouncedSearch(localQuery, filters);
  }, [localQuery, filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleTypeFilter = (type: ContentItem['type']) => {
    const newFilters = {
      ...filters,
      type: filters.type === type ? undefined : type,
    };
    setFilters(newFilters);
  };

  const handleCategoryFilter = (category: string) => {
    const newFilters = {
      ...filters,
      category: filters.category === category ? undefined : category,
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setLocalQuery('');
  };

  const hasActiveFilters = filters.type || filters.category || localQuery.trim();

  return (
    <div className="w-full space-y-2 sm:space-y-4">
      {/* Main Search Bar - Mobile Responsive */}
      <div className="relative">
        <Search className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-orange-500 h-4 w-4 sm:h-5 sm:w-5 z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleInputChange}
          className={`pl-8 sm:pl-12 pr-16 sm:pr-20 h-10 sm:h-12 md:h-14 backdrop-blur-sm border-2 focus:shadow-lg ${theme.transition} rounded-lg font-medium text-sm md:text-base ${
            theme.isDark
              ? 'bg-black/50 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-orange-500/30'
              : 'bg-white/50 border-orange-400/50 text-gray-900 placeholder:text-gray-500 focus:border-orange-600 focus:shadow-orange-600/30'
          }`}
        />
        <div className="absolute right-1 sm:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 hover:border-red-500 transition-all duration-300 transform active:scale-95 sm:hover:scale-110"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-6 w-6 sm:h-8 sm:w-8 p-0 border-2 transition-all duration-300 transform active:scale-95 sm:hover:scale-110 ${
              showFilters 
                ? 'bg-orange-500 text-black border-white' 
                : theme.isDark
                  ? 'bg-black/50 text-orange-500 border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500'
                  : 'bg-white/50 text-orange-600 border-orange-400/50 hover:bg-orange-100 hover:border-orange-600'
            }`}
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Loading Indicator - Mobile Responsive */}
      {loading.isLoading && (
        <div className="flex items-center justify-center py-2 sm:py-4">
          <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-2 border-orange-500 border-t-transparent"></div>
          <span className="ml-2 sm:ml-3 text-xs sm:text-sm md:text-base text-orange-500 font-bold">
            <span className="hidden sm:inline">⚡ SEARCHING THE UNIVERSE...</span>
            <span className="sm:hidden">⚡ SEARCHING...</span>
          </span>
        </div>
      )}

      {/* Filters Panel - Mobile Responsive */}
      {showFilters && (
        <Card className={`backdrop-blur-xl border-2 sm:border-4 shadow-2xl ${theme.transition} ${
          theme.isDark
            ? 'bg-black/80 border-orange-500 shadow-orange-500/20 hover:shadow-orange-500/40'
            : 'bg-white/80 border-orange-600 shadow-orange-600/20 hover:shadow-orange-600/40'
        }`}>
          <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Content Type Filters */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm md:text-base font-black text-orange-500 uppercase tracking-wider">🎯 CONTENT TYPE</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 md:gap-3">
                {contentTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.type === type.value ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-300 transform active:scale-95 sm:hover:scale-105 p-1 sm:p-2 md:p-3 text-xs md:text-sm font-bold border-2 ${
                      filters.type === type.value
                        ? 'bg-orange-500 text-black border-white shadow-lg'
                        : theme.isDark
                          ? 'bg-black/50 text-orange-500 border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500'
                          : 'bg-white/50 text-orange-600 border-orange-400/50 hover:bg-orange-100 hover:border-orange-600'
                    }`}
                    onClick={() => handleTypeFilter(type.value)}
                  >
                    <span className="text-sm sm:text-base md:text-lg">{type.icon}</span>
                    <span className="ml-1 hidden xs:inline">{type.label}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm md:text-base font-black text-orange-500 uppercase tracking-wider">🏷️ CATEGORY</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 md:gap-3">
                {categories.slice(0, 6).map((category) => (
                  <Badge
                    key={category}
                    variant={filters.category === category ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-300 transform active:scale-95 sm:hover:scale-105 p-1 sm:p-2 md:p-3 text-xs md:text-sm font-bold border-2 capitalize ${
                      filters.category === category
                        ? 'bg-orange-500 text-black border-white shadow-lg'
                        : theme.isDark
                          ? 'bg-black/50 text-orange-500 border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500'
                          : 'bg-white/50 text-orange-600 border-orange-400/50 hover:bg-orange-100 hover:border-orange-600'
                    }`}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t-2 border-orange-500/30">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <span className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                    theme.isDark ? 'text-white' : 'text-gray-900'
                  }`}>🔍 ACTIVE FILTERS:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.type && (
                      <Badge variant="secondary" className="text-xs md:text-sm bg-orange-500/20 text-orange-400 border border-orange-500/50 font-bold">
                        {contentTypes.find(t => t.value === filters.type)?.icon} {contentTypes.find(t => t.value === filters.type)?.label}
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge variant="secondary" className="text-xs md:text-sm bg-orange-500/20 text-orange-400 border border-orange-500/50 font-bold capitalize">
                        🏷️ {filters.category}
                      </Badge>
                    )}
                    {localQuery.trim() && (
                      <Badge variant="secondary" className="text-xs md:text-sm bg-orange-500/20 text-orange-400 border border-orange-500/50 font-bold">
                        🔎 &quot;{localQuery.trim()}&quot;
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs md:text-sm bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 hover:border-red-500 transition-all duration-300 transform hover:scale-105 font-bold px-3 md:px-4 py-2"
                >
                  💥 CLEAR ALL
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
