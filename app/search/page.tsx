/*eslint-disable*/
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, ChevronDown, ChevronUp, Grid, List } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SearchBar } from '../../components/forms/SearchBar';
import { ContentGrid } from '../../components/content/ContentGrid';
import { InfiniteScrollContainer } from '../../components/ui/InfiniteScrollContainer';
import { Pagination } from '../../components/ui/Pagination';
import { QuickSearch } from '../../components/ui/QuickSearch';
import { PullToRefreshIndicator } from '../../components/ui/PullToRefreshIndicator';
import { SearchSkeleton } from '../../components/ui/SearchSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { useTheme } from '../../lib/useTheme';
import { ContentItem } from '../../types';
import { searchContent } from '../../store/slices/contentSlice';

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { searchResults = [], searchQuery = '', activeFilters = {}, loading = { isLoading: false, error: null } } = useAppSelector(state => state.content || {});
  const theme = useTheme();

  // Local state for UI controls
  const [showTips, setShowTips] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [paginationMode, setPaginationMode] = useState<'infinite' | 'traditional'>('infinite');
  const [currentPage, setCurrentPage] = useState(1);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState<boolean>(false);
  const itemsPerPage = 12;

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Search action: ${action} on item:`, item);
  };

  const getResultsByType = () => {
    if (!searchResults || !Array.isArray(searchResults)) {
      return {
        news: [],
        movies: [],
        music: [],
        social: [],
      };
    }
    
    const grouped = {
      news: searchResults.filter(item => item.type === 'news'),
      movies: searchResults.filter(item => item.type === 'movie'),
      music: searchResults.filter(item => item.type === 'music'),
      social: searchResults.filter(item => item.type === 'social'),
    };
    return grouped;
  };

  const groupedResults = getResultsByType();

  // Pagination logic
  const totalPages = Math.ceil((searchResults?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = (searchResults || []).slice(startIndex, startIndex + itemsPerPage);

  // Handle load more for infinite scroll
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Handle page change for traditional pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle trending search clicks
  const handleTrendingSearch = (term: string) => {
    dispatch(searchContent({ query: term }));
  };

  // Handle search from QuickSearch modal
  const handleSearch = (query: string) => {
    dispatch(searchContent({ query }));
  };

  // Pull to refresh functionality for mobile
  const handleRefresh = () => {
    if (searchQuery) {
      dispatch(searchContent({ query: searchQuery }));
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: !searchQuery, // Only enable when there's a search query
  });

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <DashboardLayout>
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator
        isRefreshing={pullToRefresh.isRefreshing}
        pullDistance={pullToRefresh.pullDistance}
      />
      
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 pb-20 sm:pb-24 md:pb-32">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-500/20 backdrop-blur-sm border-2 border-green-500 rounded-lg">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black transition-colors duration-300 leading-tight ${
                  theme.isDark ? 'text-white' : 'text-gray-900'
                }`} style={{ textShadow: '1px 1px 0px #ff6600' }}>
                  🔍 SEARCH HUB
                </h1>
                <p className="text-orange-500 font-bold text-sm sm:text-base mt-1">
                  <span className="hidden sm:inline">🌌 Discover content across all dimensions! ⚡</span>
                  <span className="sm:hidden">🌌 Find anything! ⚡</span>
                </p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`gap-2 border-2 transition-all duration-300 transform hover:scale-105 font-bold ${
                  theme.isDark
                    ? 'border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white'
                    : 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                }`}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                {viewMode === 'grid' ? 'LIST' : 'GRID'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginationMode(paginationMode === 'infinite' ? 'traditional' : 'infinite')}
                className={`gap-2 border-2 transition-all duration-300 transform hover:scale-105 font-bold ${
                  paginationMode === 'infinite'
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-500/20'
                    : 'border-orange-500 text-orange-400 bg-orange-500/20'
                }`}
              >
                {paginationMode === 'infinite' ? '∞ INFINITE' : '📄 PAGES'}
              </Button>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex sm:hidden gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={`flex-1 gap-2 border-2 transition-all duration-300 transform active:scale-95 font-bold text-sm px-3 py-2 ${
                theme.isDark
                  ? 'border-purple-500 text-purple-400'
                  : 'border-purple-600 text-purple-600'
              }`}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              {viewMode === 'grid' ? 'LIST' : 'GRID'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginationMode(paginationMode === 'infinite' ? 'traditional' : 'infinite')}
              className={`flex-1 gap-2 border-2 transition-all duration-300 transform active:scale-95 font-bold text-sm px-3 py-2 ${
                paginationMode === 'infinite'
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/20'
                  : 'border-orange-500 text-orange-400 bg-orange-500/20'
              }`}
            >
              {paginationMode === 'infinite' ? '∞' : '📄'}
            </Button>
          </div>
        </div>
        {/* Search Bar - Mobile Responsive */}
        <Card className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500 shadow-orange-500/20'
            : 'bg-white/90 border-orange-600 shadow-orange-600/20'
        }`}>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🔍</span>
              <h3 className={`text-base sm:text-lg font-black transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>SEARCH PARAMETERS</h3>
            </div>
            <SearchBar />
          </CardContent>
        </Card>

        {/* Search Tips - Collapsible on Mobile */}
        {!searchQuery && (
          <Card className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
            theme.isDark
              ? 'bg-black/80 border-blue-500 shadow-blue-500/20'
              : 'bg-white/90 border-blue-600 shadow-blue-600/20'
          }`}>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className={`font-black text-sm sm:text-base md:text-lg transition-colors duration-300 ${
                    theme.isDark ? 'text-white' : 'text-gray-900'
                  }`}>⚡ SEARCH GUIDE</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTips(!showTips)}
                  className="sm:hidden p-1 h-6 w-6"
                >
                  {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <AnimatePresence>
              {(showTips || (typeof window !== 'undefined' && window.innerWidth >= 640)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className={`backdrop-blur-sm border rounded-lg p-3 sm:p-4 ${
                        theme.isDark
                          ? 'bg-black/40 border-orange-500/30'
                          : 'bg-white/40 border-orange-400/50'
                      }`}>
                        <h4 className="font-black mb-2 sm:mb-3 text-blue-400 text-sm sm:text-base">📡 CONTENT TYPES:</h4>
                        <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-orange-200 font-bold">
                          <li>• 📰 Breaking news & articles</li>
                          <li>• 🎬 Movies, TV shows & cinema</li>
                          <li>• 🎵 Music tracks & artists</li>
                          <li>• 📱 Social posts & trending content</li>
                        </ul>
                      </div>
                      <div className={`backdrop-blur-sm border rounded-lg p-3 sm:p-4 ${
                        theme.isDark
                          ? 'bg-black/40 border-orange-500/30'
                          : 'bg-white/40 border-orange-400/50'
                      }`}>
                        <h4 className="font-black mb-2 sm:mb-3 text-purple-400 text-sm sm:text-base">🚀 SEARCH TIPS:</h4>
                        <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-orange-200 font-bold">
                          <li>• ⚙️ Use filters for precise results</li>
                          <li>• 🎯 Try specific keywords</li>
                          <li>• 💥 Search updates in real-time</li>
                          <li>• ⚡ Results load as you type</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}

        {/* Loading State - Mobile Responsive */}
        {loading.isLoading && (
          <div className="space-y-6">
            <Card className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
              theme.isDark
                ? 'bg-black/80 border-green-500 shadow-green-500/20'
                : 'bg-white/90 border-green-600 shadow-green-600/20'
            }`}>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 sm:border-4 border-green-500 border-t-transparent mx-auto mb-3 sm:mb-4"></div>
                  <h3 className={`text-sm sm:text-lg font-black mb-2 transition-colors duration-300 ${
                    theme.isDark ? 'text-white' : 'text-gray-900'
                  }`}>🔍 SEARCHING</h3>
                  <p className="text-green-400 font-bold text-xs sm:text-sm">
                    <span className="hidden sm:inline">Scanning across all dimensions...</span>
                    <span className="sm:hidden">Searching...</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Loading Skeleton */}
            <SearchSkeleton count={6} />
          </div>
        )}

        {/* Search Results Summary - Mobile Responsive */}
        {searchQuery && !loading.isLoading && (
          <Card className={`backdrop-blur-md border transition-all duration-300 ${
            theme.isDark
              ? 'bg-black/60 border-orange-500/30'
              : 'bg-white/60 border-orange-400/50'
          }`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm text-orange-400 font-bold">🎯 RESULTS FOR:</span>
                  <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold text-xs sm:text-sm">{searchQuery}</Badge>
                  {activeFilters.type && (
                    <Badge className="bg-purple-500/80 text-white border-purple-400 font-bold text-xs sm:text-sm">
                      {activeFilters.type}
                    </Badge>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-green-400 font-bold">
                  ⚡ {searchResults.length} {searchResults.length !== 1 ? 'FOUND' : 'FOUND'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results - Mobile Responsive */}
        {searchQuery && !loading.isLoading && (!searchResults || searchResults.length === 0) && (
          <Card className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
            theme.isDark
              ? 'bg-black/80 border-red-500 shadow-red-500/20'
              : 'bg-white/90 border-red-600 shadow-red-600/20'
          }`}>
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <span className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 block animate-bounce">🔍</span>
              <h3 className="text-lg sm:text-xl font-black mb-4 text-red-400">💥 NO RESULTS FOUND!</h3>
              <p className={`font-bold mb-4 sm:mb-6 text-sm sm:text-base transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="hidden sm:inline">Search failed for "{searchQuery}". Try different keywords! ⚡</span>
                <span className="sm:hidden">No results for "{searchQuery}" ⚡</span>
              </p>
              <div className={`backdrop-blur-sm border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 text-left max-w-md mx-auto ${
                theme.isDark
                  ? 'bg-black/40 border-orange-500/30'
                  : 'bg-white/40 border-orange-400/50'
              }`}>
                <p className="text-orange-400 font-bold text-xs sm:text-sm">🛠️ TRY:</p>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-orange-200 font-bold">
                  <li>🔧 Check spelling</li>
                  <li>🎯 Use different keywords</li>
                  <li>⚙️ Remove filters</li>
                  <li>🌐 Try broader terms</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Results with Infinite Scroll or Pagination */}
        {searchResults && searchResults.length > 0 && !loading.isLoading && (
          <>
            {paginationMode === 'infinite' ? (
              <InfiniteScrollContainer
                hasNextPage={currentPage < totalPages}
                isLoading={loading.isLoading}
                isLoadingMore={false}
                onLoadMore={handleLoadMore}
                className="space-y-4"
                loadingMoreComponent={
                  <div className="flex items-center justify-center gap-3 py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
                    <span className="text-green-400 font-bold text-sm sm:text-base">🔍 Loading more results...</span>
                  </div>
                }
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`backdrop-blur-md border rounded-lg p-3 sm:p-4 md:p-6 ${
                    theme.isDark
                      ? 'bg-black/40 border-orange-500/30'
                      : 'bg-white/40 border-orange-400/50'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl md:text-3xl">🎯</span>
                    <h3 className={`text-base sm:text-lg md:text-xl font-black transition-colors duration-300 ${
                      theme.isDark ? 'text-white' : 'text-gray-900'
                    }`}>ALL RESULTS</h3>
                    <Badge className="bg-green-500/80 text-white border-green-400 font-bold text-xs sm:text-sm">
                      {searchResults.length}
                    </Badge>
                  </div>
                  <ContentGrid
                    items={searchResults.slice(0, currentPage * itemsPerPage)}
                    onAction={handleContentAction}
                    enableDragDrop={false}
                    className={viewMode === 'list' 
                      ? 'grid-cols-1 lg:grid-cols-2' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }
                  />
                </motion.div>
              </InfiniteScrollContainer>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`backdrop-blur-md border rounded-lg p-3 sm:p-4 md:p-6 ${
                    theme.isDark
                      ? 'bg-black/40 border-orange-500/30'
                      : 'bg-white/40 border-orange-400/50'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl md:text-3xl">🎯</span>
                    <h3 className={`text-base sm:text-lg md:text-xl font-black transition-colors duration-300 ${
                      theme.isDark ? 'text-white' : 'text-gray-900'
                    }`}>SEARCH RESULTS</h3>
                    <Badge className="bg-green-500/80 text-white border-green-400 font-bold text-xs sm:text-sm">
                      Page {currentPage} of {totalPages}
                    </Badge>
                  </div>
                  <ContentGrid
                    items={paginatedResults}
                    onAction={handleContentAction}
                    enableDragDrop={false}
                    className={viewMode === 'list' 
                      ? 'grid-cols-1 lg:grid-cols-2' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }
                  />
                </motion.div>

                {/* Traditional Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasNextPage={currentPage < totalPages}
                  hasPreviousPage={currentPage > 1}
                  onPageChange={handlePageChange}
                  isLoading={loading.isLoading}
                  className="mt-4 sm:mt-6"
                />
              </>
            )}
          </>
        )}

        {/* Grouped Results by Type - Mobile Responsive */}
        {searchResults && searchResults.length > 0 && !loading.isLoading && !activeFilters.type && (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {Object.entries(groupedResults).map(([type, items]) => {
              if (items.length === 0) return null;

              const typeConfig = {
                news: { label: 'NEWS', icon: '📰', color: 'blue', bgColor: 'bg-blue-500/20 border-blue-500' },
                movies: { label: 'MOVIES', icon: '🎬', color: 'purple', bgColor: 'bg-purple-500/20 border-purple-500' },
                music: { label: 'MUSIC', icon: '🎵', color: 'green', bgColor: 'bg-green-500/20 border-green-500' },
                social: { label: 'SOCIAL', icon: '📱', color: 'orange', bgColor: 'bg-orange-500/20 border-orange-500' },
              }[type] || { label: type.toUpperCase(), icon: '📄', color: 'gray', bgColor: 'bg-gray-500/20 border-gray-500' };

              const isExpanded = expandedCategory === type;
              const displayItems = isExpanded ? items : items.slice(0, 4);

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`backdrop-blur-md border rounded-lg p-3 sm:p-4 md:p-6 ${
                    theme.isDark
                      ? 'bg-black/40 border-orange-500/30'
                      : 'bg-white/40 border-orange-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl md:text-3xl">{typeConfig.icon}</span>
                      <h2 className={`text-base sm:text-lg md:text-xl font-black text-${typeConfig.color}-400 transition-colors duration-300 ${
                        theme.isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {typeConfig.label}
                      </h2>
                      <Badge className={`${typeConfig.bgColor} text-white font-bold text-xs sm:text-sm`}>
                        {items.length}
                      </Badge>
                    </div>
                    {items.length > 4 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCategory(type)}
                        className={`gap-1 sm:gap-2 border-2 transition-all duration-300 font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                          theme.isDark
                            ? `border-${typeConfig.color}-500 text-${typeConfig.color}-400 hover:bg-${typeConfig.color}-500 hover:text-white`
                            : `border-${typeConfig.color}-600 text-${typeConfig.color}-600 hover:bg-${typeConfig.color}-600 hover:text-white`
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">SHOW LESS</span>
                            <span className="sm:hidden">LESS</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">SHOW MORE</span>
                            <span className="sm:hidden">MORE</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <ContentGrid
                    items={displayItems}
                    onAction={handleContentAction}
                    enableDragDrop={false}
                    className={viewMode === 'list' 
                      ? 'grid-cols-1 lg:grid-cols-2' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Trending Searches - Mobile Responsive */}
        {!searchQuery && (
          <Card className={`backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
            theme.isDark
              ? 'bg-black/80 border-purple-500 shadow-purple-500/20'
              : 'bg-white/90 border-purple-600 shadow-purple-600/20'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <span className={`font-black text-sm sm:text-base md:text-lg transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-900'
                }`}>🔥 TRENDING SEARCHES</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {[
                  'artificial intelligence',
                  'climate change', 
                  'cryptocurrency',
                  'space exploration',
                  'renewable energy',
                  'machine learning',
                  'sustainable tech',
                  'virtual reality',
                  'blockchain technology',
                  'quantum computing',
                  'electric vehicles',
                  'metaverse'
                ].slice(0, 8).map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTrendingSearch(term)}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 font-bold text-xs sm:text-sm text-center ${
                      theme.isDark
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 text-white hover:from-purple-500 hover:to-blue-500 hover:border-purple-400'
                        : 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300 text-purple-700 hover:from-purple-500 hover:to-blue-500 hover:text-white hover:border-purple-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg sm:text-xl">
                        {term.includes('AI') || term.includes('artificial') ? '🤖' :
                         term.includes('climate') ? '🌍' :
                         term.includes('crypto') ? '₿' :
                         term.includes('space') ? '🚀' :
                         term.includes('renewable') ? '♻️' :
                         term.includes('machine') ? '⚙️' :
                         term.includes('sustainable') ? '🌱' :
                         term.includes('virtual') ? '🥽' :
                         term.includes('blockchain') ? '⛓️' :
                         term.includes('quantum') ? '⚛️' :
                         term.includes('electric') ? '⚡' :
                         term.includes('metaverse') ? '🌐' : '🔥'}
                      </span>
                      <span className="break-words">{term}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 sm:mt-6 pt-4 border-t border-orange-500/30">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg sm:text-xl font-black text-blue-400">📰</div>
                    <div className="text-xs sm:text-sm font-bold text-orange-300">News Articles</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black text-purple-400">🎬</div>
                    <div className="text-xs sm:text-sm font-bold text-orange-300">Movies & Shows</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black text-green-400">🎵</div>
                    <div className="text-xs sm:text-sm font-bold text-orange-300">Music Tracks</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black text-orange-400">📱</div>
                    <div className="text-xs sm:text-sm font-bold text-orange-300">Social Posts</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-20 right-4 sm:hidden z-30">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsQuickSearchOpen(true)}
            className={`p-4 rounded-full shadow-2xl border-2 transition-all duration-300 ${
              theme.isDark
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-400 text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-400 text-white'
            }`}
          >
            <Search className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Quick Search Modal Component */}
        {isQuickSearchOpen && (
          <QuickSearch 
            onClose={() => setIsQuickSearchOpen(false)}
            onSearch={handleSearch}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
