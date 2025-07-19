'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { debounce } from '../../lib/utils';
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
    <div className="w-full space-y-4 p-4 md:p-6">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 h-5 w-5 z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleInputChange}
          className="pl-12 pr-20 h-12 md:h-14 bg-black/50 backdrop-blur-sm border-2 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30 transition-all duration-300 rounded-lg font-medium text-sm md:text-base"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 w-8 p-0 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 hover:border-red-500 transition-all duration-300 transform hover:scale-110"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 w-8 p-0 border-2 transition-all duration-300 transform hover:scale-110 ${
              showFilters 
                ? 'bg-orange-500 text-black border-white' 
                : 'bg-black/50 text-orange-500 border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500'
            }`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading.isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
          <span className="ml-3 text-sm md:text-base text-orange-500 font-bold">⚡ SEARCHING THE UNIVERSE...</span>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-black/80 backdrop-blur-xl border-4 border-orange-500 shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300">
          <CardContent className="p-4 md:p-6 space-y-6">
            {/* Content Type Filters */}
            <div className="space-y-3">
              <h4 className="text-sm md:text-base font-black text-orange-500 uppercase tracking-wider">🎯 CONTENT TYPE</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {contentTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.type === type.value ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-105 p-2 md:p-3 text-xs md:text-sm font-bold border-2 ${
                      filters.type === type.value
                        ? 'bg-orange-500 text-black border-white shadow-lg'
                        : 'bg-black/50 text-orange-500 border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500'
                    }`}
                    onClick={() => handleTypeFilter(type.value)}
                  >
                    <span className="text-base md:text-lg">{type.icon}</span>
                    <span className="ml-1 md:ml-2">{type.label}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div className="space-y-3">
              <h4 className="text-sm md:text-base font-black text-orange-500 uppercase tracking-wider">🏷️ CATEGORY</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={filters.category === category ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-105 p-2 md:p-3 text-xs md:text-sm font-bold border-2 capitalize ${
                      filters.category === category
                        ? 'bg-orange-500 text-black border-white shadow-lg'
                        : 'bg-black/50 text-orange-500 border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500'
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
                  <span className="text-sm md:text-base text-white font-bold">🔍 ACTIVE FILTERS:</span>
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
