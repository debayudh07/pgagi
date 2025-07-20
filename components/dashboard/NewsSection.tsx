'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, RefreshCw, Settings, Zap } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { ContentDetailModal } from '../content/ContentDetailModal';
import { ContentFilters, FilterState } from '../content/ContentFilters';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNews, applyContentOrder } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem, NewsArticle } from '../../types';

interface NewsSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { news, loading, favorites } = useAppSelector(state => state.content);
  const theme = useTheme();

  // State for personalization
  const [selectedNews, setSelectedNews] = useState<ContentItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    sortBy: 'date',
    sortOrder: 'desc',
    viewMode: 'grid',
    showFavoritesOnly: false,
  });

  // Get available categories from news
  const availableCategories = useMemo(() => {
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 rounded-lg">
            <Newspaper className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ff6600' }}>
              📰 LIVE INDIAN NEWS
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              {filteredAndSortedNews.length} of {news.length} live {news.length === 1 ? 'story' : 'stories'} from India 🇮🇳
              {filter.genre && (
                <Badge className="ml-2 bg-blue-500/80 text-white border-blue-400 font-bold">
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
            className="gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
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
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className={`text-xl font-black mb-2 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>📡 SCANNING INDIAN NEWS</h3>
              <p className="text-blue-400 font-bold">Gathering live news from MediaStack API...</p>
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
          <span className="text-2xl md:text-3xl">📰</span>
          <h3 className={`text-lg md:text-xl font-black transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>LIVE INDIAN STORIES</h3>
          <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold">
            {filteredAndSortedNews.length}
          </Badge>
          {filter.showFavoritesOnly && (
            <Badge className="bg-red-500/80 text-white border-red-400 font-bold animate-pulse">
              ❤️ FAVORITES ONLY
            </Badge>
          )}
        </div>
        <ContentGrid
          items={filteredAndSortedNews}
          onAction={handleContentAction}
          enableDragDrop={true}
          contentType="news"
          className={`min-h-[400px] ${
            filter.viewMode === 'list' 
              ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        />
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📰</div>
            <p className="font-black text-lg text-blue-400">
              {availableCategories.length}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>Categories</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📡</div>
            <p className="font-black text-lg text-green-400">
              {new Set(filteredAndSortedNews.map(n => (n as NewsArticle).source).filter(Boolean)).size}
            </p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>News Sources</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">❤️</div>
            <p className="font-black text-lg text-red-400">
              {filteredAndSortedNews.filter(n => favorites.some((fav: ContentItem) => fav.id === n.id)).length}
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
            <div className="text-2xl mb-2">🕐</div>
            <p className="font-black text-lg text-yellow-400">
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
            }`}>Last 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {filteredAndSortedNews.length > 0 && (
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
                  className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300"
                >
                  🌟 All News
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
                  onClick={() => handleFilterChange({ sortBy: 'date', sortOrder: 'desc' })}
                  className="border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white font-bold transition-all duration-300"
                >
                  🕐 Latest First
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
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
                📡 Live updates from MediaStack API (India)
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
