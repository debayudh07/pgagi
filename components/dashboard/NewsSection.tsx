'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, RefreshCw, Settings, Zap } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { ContentDetailModal } from '../content/ContentDetailModal';
import { ContentFilters, FilterState } from '../content/ContentFilters';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { InfiniteScrollContainer } from '../ui/InfiniteScrollContainer';
import { Pagination } from '../ui/Pagination';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNews, loadMoreNews, applyContentOrder } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem, NewsArticle } from '../../types';

interface NewsSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
  paginationMode?: 'infinite' | 'traditional';
}

export const NewsSection: React.FC<NewsSectionProps> = ({ 
  onContentAction,
  paginationMode = 'infinite'
}) => {
  const dispatch = useAppDispatch();
  const { news = [], loading = { isLoading: false, error: null }, favorites = [], contentPagination } = useAppSelector(state => state.content || {});
  const theme = useTheme();

  // Get pagination state for news with fallback
  const newsPagination = contentPagination?.news || {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
    isLoadingMore: false,
  };

  // State for personalization
  const [selectedNews, setSelectedNews] = useState<ContentItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPaginationMode, setCurrentPaginationMode] = useState<'infinite' | 'traditional'>(paginationMode);
  const [filter, setFilter] = useState<FilterState>({
    sortBy: 'date',
    sortOrder: 'desc',
    viewMode: 'grid',
    showFavoritesOnly: false,
  });

  // Handle loading more content for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (newsPagination.hasNextPage && !newsPagination.isLoadingMore) {
      dispatch(loadMoreNews({}));
    }
  }, [dispatch, newsPagination.hasNextPage, newsPagination.isLoadingMore]);

  // Handle page change for traditional pagination
  const handlePageChange = useCallback((page: number) => {
    dispatch(fetchNews({ page }));
  }, [dispatch]);

  // Get available categories from news
  const availableCategories = useMemo(() => {
    if (!news || !Array.isArray(news)) {
      return [];
    }
    const categories = new Set<string>();
    news.forEach(article => {
      const newsData = article as NewsArticle;
      if (newsData.category) {
        categories.add(newsData.category);
      }
    });
    return Array.from(categories).sort();
  }, [news]);

  // Filter and sort news based on user preferences
  const filteredAndSortedNews = useMemo(() => {
    if (!news || !Array.isArray(news)) {
      return [];
    }
    
    let filtered = [...news];

    // Apply category filter (using genre field for consistency)
    if (filter.genre) {
      filtered = filtered.filter(article => {
        const newsData = article as NewsArticle;
        return newsData.category === filter.genre;
      });
    }

    // Apply favorites filter
    if (filter.showFavoritesOnly) {
      filtered = filtered.filter(article => 
        favorites.some((fav: ContentItem) => fav.id === article.id)
      );
    }

    // Sort news
    filtered.sort((a, b) => {
      const newsA = a as NewsArticle;
      const newsB = b as NewsArticle;
      let comparison = 0;

      switch (filter.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'rating':
          // For news, we can use source credibility or length as a rating proxy
          const ratingA = (newsA.source?.length || 0) + (a.description?.length || 0) / 100;
          const ratingB = (newsB.source?.length || 0) + (b.description?.length || 0) / 100;
          comparison = ratingA - ratingB;
          break;
        case 'popularity':
          // Use a combination of source, recency, and content length
          const popularityA = (newsA.source?.length || 0) * 2 + (a.description?.length || 0) / 50;
          const popularityB = (newsB.source?.length || 0) * 2 + (b.description?.length || 0) / 50;
          comparison = popularityA - popularityB;
          break;
      }

      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [news, filter, favorites]);

  useEffect(() => {
    console.log('📰 NewsSection: Current news state:', { newsCount: news.length, loading });
    if (news.length === 0 && !loading.isLoading) {
      console.log('📰 NewsSection: Fetching news...');
      dispatch(fetchNews({}));
    }
    // Temporarily disabled ordering functionality to prevent errors
    // TODO: Re-enable once ordering is properly implemented
    // else if (news.length > 0 && Array.isArray(news)) {
    //   console.log('📰 NewsSection: Applying content order for', news.length, 'news items');
    //   dispatch(applyContentOrder({ contentType: 'news' }));
    // }
  }, [dispatch, news.length, loading.isLoading]);

  // Temporarily disabled ordering functionality
  // useEffect(() => {
  //   if (news.length > 0 && Array.isArray(news)) {
  //     console.log('📰 NewsSection: News data changed, applying order for', news.length, 'items');
  //     dispatch(applyContentOrder({ contentType: 'news' }));
  //   }
  // }, [dispatch, news]);

  // Add effect to log when news data changes
  useEffect(() => {
    console.log('📰 NewsSection: News data updated:', news.slice(0, 2).map(item => ({ id: item.id, title: item.title })));
  }, [news]);

  const handleRefresh = () => {
    console.log('📰 NewsSection: Manual refresh triggered');
    dispatch(fetchNews({}));
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`📰 NewsSection: ${action} action triggered for:`, item.id, item.title);
    
    if (action === 'view') {
      console.log('📰 NewsSection: Opening modal for item:', item);
      setSelectedNews(item);
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

  const togglePaginationMode = () => {
    setCurrentPaginationMode(prev => prev === 'infinite' ? 'traditional' : 'infinite');
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 pb-20 sm:pb-24 md:pb-32">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        {/* Title and Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 rounded-lg">
              <Newspaper className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black transition-colors duration-300 leading-tight ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`} style={{ textShadow: '1px 1px 0px #ff6600' }}>
                📰 LIVE NEWS
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-orange-500 font-bold text-sm sm:text-base">
                  {filteredAndSortedNews.length} of {news.length} stories 🇮🇳
                </p>
                {filter.genre && (
                  <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold text-xs">
                    {filter.genre}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="outline"
              onClick={togglePaginationMode}
              className={`gap-2 border-2 transition-all duration-300 transform hover:scale-105 font-bold px-4 py-2 ${
                currentPaginationMode === 'infinite'
                  ? 'border-purple-500 text-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20' 
                  : 'border-cyan-500 text-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {currentPaginationMode === 'infinite' ? '∞ INFINITE' : '📄 PAGES'}
            </Button>
            
            <Button
              variant="outline"
              onClick={toggleFilters}
              className={`gap-2 border-2 transition-all duration-300 transform hover:scale-105 font-bold px-4 py-2 ${
                showFilters 
                  ? 'border-green-500 text-green-400 bg-green-500/20 shadow-lg shadow-green-500/20' 
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
              className="gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105 px-4 py-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading.isLoading ? 'animate-spin' : ''}`} />
              🔄 REFRESH
            </Button>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex sm:hidden gap-2">
          <Button
            variant="outline"
            onClick={togglePaginationMode}
            className={`flex-1 gap-2 border-2 transition-all duration-300 transform active:scale-95 font-bold text-sm px-3 py-2 ${
              currentPaginationMode === 'infinite'
                ? 'border-purple-500 text-purple-400 bg-purple-500/20' 
                : 'border-cyan-500 text-cyan-400 bg-cyan-500/20'
            }`}
          >
            {currentPaginationMode === 'infinite' ? '∞' : '📄'}
          </Button>
          
          <Button
            variant="outline"
            onClick={toggleFilters}
            className={`flex-1 gap-2 border-2 transition-all duration-300 transform active:scale-95 font-bold text-sm px-3 py-2 ${
              showFilters 
                ? 'border-green-500 text-green-400 bg-green-500/20' 
                : 'border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            {showFilters ? '✅ ON' : '🎛️ FILTERS'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.isLoading}
            className="flex-1 gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300 transform active:scale-95 text-sm px-3 py-2"
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
            availableGenres={availableCategories}
            currentFilter={filter}
            onFilterChange={handleFilterChange}
            itemCount={filteredAndSortedNews.length}
            contentType="news"
          />
        </motion.div>
      )}

      {/* Loading State */}
      {loading.isLoading && news.length === 0 && (
        <Card className={`backdrop-blur-xl border-2 shadow-lg ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/80 border-blue-500 shadow-blue-500/20'
            : 'bg-white/90 border-blue-600 shadow-blue-600/20'
        }`}>
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 sm:border-4 border-blue-500 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
              <h3 className={`text-lg sm:text-xl font-black mb-2 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>📡 SCANNING NEWS</h3>
              <p className="text-blue-400 font-bold text-sm sm:text-base">Loading live stories...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Grid with Infinite Scroll or Traditional Pagination */}
      {currentPaginationMode === 'infinite' ? (
        <InfiniteScrollContainer
          hasNextPage={newsPagination.hasNextPage}
          isLoading={loading.isLoading}
          isLoadingMore={newsPagination.isLoadingMore}
          onLoadMore={handleLoadMore}
          className="space-y-4"
          loadingMoreComponent={
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-blue-400 font-bold">📰 Loading more stories...</span>
            </div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`backdrop-blur-md border rounded-lg p-3 sm:p-4 md:p-6 ${theme.transitionColors} ${
              theme.isDark
                ? 'bg-black/40 border-orange-500/30'
                : 'bg-white/40 border-orange-400/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl md:text-3xl">📰</span>
              <h3 className={`text-base sm:text-lg md:text-xl font-black transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>LIVE STORIES</h3>
              <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold text-xs sm:text-sm">
                {filteredAndSortedNews.length}
              </Badge>
              {filter.showFavoritesOnly && (
                <Badge className="bg-red-500/80 text-white border-red-400 font-bold animate-pulse text-xs sm:text-sm">
                  ❤️ FAVS
                </Badge>
              )}
              {newsPagination.totalItems > 0 && (
                <Badge className="bg-green-500/80 text-white border-green-400 font-bold text-xs sm:text-sm">
                  {newsPagination.totalItems} total
                </Badge>
              )}
            </div>
            <ContentGrid
              items={filteredAndSortedNews}
              onAction={handleContentAction}
              enableDragDrop={true}
              contentType="news"
              className={`min-h-[300px] sm:min-h-[400px] ${
                filter.viewMode === 'list' 
                  ? 'grid-cols-1 lg:grid-cols-2' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            />
          </motion.div>
        </InfiniteScrollContainer>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`backdrop-blur-md border rounded-lg p-3 sm:p-4 md:p-6 ${theme.transitionColors} ${
              theme.isDark
                ? 'bg-black/40 border-orange-500/30'
                : 'bg-white/40 border-orange-400/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl md:text-3xl">📰</span>
              <h3 className={`text-base sm:text-lg md:text-xl font-black transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>LIVE STORIES</h3>
              <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold text-xs sm:text-sm">
                {filteredAndSortedNews.length}
              </Badge>
              {filter.showFavoritesOnly && (
                <Badge className="bg-red-500/80 text-white border-red-400 font-bold animate-pulse text-xs sm:text-sm">
                  ❤️ FAVS
                </Badge>
              )}
              {newsPagination.totalItems > 0 && (
                <Badge className="bg-green-500/80 text-white border-green-400 font-bold text-xs sm:text-sm">
                  Page {newsPagination.currentPage} of {newsPagination.totalPages}
                </Badge>
              )}
            </div>
            <ContentGrid
              items={filteredAndSortedNews}
              onAction={handleContentAction}
              enableDragDrop={true}
              contentType="news"
              className={`min-h-[300px] sm:min-h-[400px] ${
                filter.viewMode === 'list' 
                  ? 'grid-cols-1 lg:grid-cols-2' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            />
          </motion.div>

          {/* Traditional Pagination */}
          <Pagination
            currentPage={newsPagination.currentPage}
            totalPages={newsPagination.totalPages}
            hasNextPage={newsPagination.hasNextPage}
            hasPreviousPage={newsPagination.hasPreviousPage}
            onPageChange={handlePageChange}
            isLoading={loading.isLoading}
            className="mt-6"
          />
        </>
      )}

      {/* Enhanced Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">📰</div>
            <p className="font-black text-sm sm:text-lg text-blue-400">
              {availableCategories.length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Categories</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">📡</div>
            <p className="font-black text-sm sm:text-lg text-green-400">
              {new Set(filteredAndSortedNews.map(n => (n as NewsArticle).source).filter(Boolean)).size}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Sources</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">❤️</div>
            <p className="font-black text-sm sm:text-lg text-red-400">
              {filteredAndSortedNews.filter(n => favorites.some((fav: ContentItem) => fav.id === n.id)).length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Favorites</p>
          </CardContent>
        </Card>

        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🕐</div>
            <p className="font-black text-sm sm:text-lg text-yellow-400">
              {filteredAndSortedNews.filter(n => {
                if (!n.publishedAt) return false;
                const publishedTime = new Date(n.publishedAt).getTime();
                const now = new Date().getTime();
                const hoursDiff = (now - publishedTime) / (1000 * 60 * 60);
                return hoursDiff <= 24;
              }).length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Responsive */}
      {filteredAndSortedNews.length > 0 && (
        <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/60 border-orange-500/30'
            : 'bg-white/60 border-orange-400/50'
        }`}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                <span className={`font-bold text-sm sm:text-base transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  🚀 Quick Actions
                </span>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({ genre: undefined, showFavoritesOnly: false })}
                  className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  🌟 All News
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({ showFavoritesOnly: true })}
                  className="border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  ❤️ Favorites
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({ sortBy: 'date', sortOrder: 'desc' })}
                  className="border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white font-bold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  🕐 Latest
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card - Mobile Responsive */}
      <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
        theme.isDark
          ? 'bg-black/60 border-orange-500/30'
          : 'bg-white/60 border-orange-400/50'
      }`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-bold text-green-400">
                📡 Live updates from India
              </span>
            </div>
            <span className="text-xs text-orange-400 font-bold">
              Last update: {new Date().toLocaleTimeString()} 🕐
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      <ContentDetailModal
        item={selectedNews}
        isOpen={!!selectedNews}
        onClose={() => {
          console.log('📰 NewsSection: Closing modal');
          setSelectedNews(null);
        }}
      />

      
      
    </div>
  );
};
