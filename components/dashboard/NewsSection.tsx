'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, RefreshCw } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNews } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem } from '../../types';

interface NewsSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { news, loading } = useAppSelector(state => state.content);
  const theme = useTheme();

  useEffect(() => {
    console.log('📰 NewsSection: Current news state:', { newsCount: news.length, loading });
    if (news.length === 0) {
      console.log('📰 NewsSection: Fetching news...');
      dispatch(fetchNews({}));
    }
  }, [dispatch, news.length]);

  // Add effect to log when news data changes
  useEffect(() => {
    console.log('📰 NewsSection: News data updated:', news.slice(0, 2).map(item => ({ id: item.id, title: item.title })));
  }, [news]);

  const handleRefresh = () => {
    console.log('📰 NewsSection: Manual refresh triggered');
    dispatch(fetchNews({}));
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`News action: ${action} on item:`, item);
    onContentAction?.(action, item);
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
              {news.length} live {news.length === 1 ? 'story' : 'stories'} from India 🇮🇳 (MediaStack API)
            </p>
          </div>
        </div>
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
              <h3 className="font-black text-xl text-red-400 mb-2">NEWS FEED ERROR!</h3>
              <p className={`font-bold mb-4 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>{loading.error}</p>
              <Button 
                onClick={handleRefresh} 
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🔄 TRY AGAIN
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
          <span className="text-2xl md:text-3xl">📰</span>
          <h3 className={`text-lg md:text-xl font-black transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>LIVE INDIAN STORIES</h3>
          <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold">{news.length}</Badge>
        </div>
        <ContentGrid
          items={news}
          onAction={handleContentAction}
          enableDragDrop={false}
          className="min-h-[400px]"
        />
      </motion.div>

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
    </div>
  );
};
