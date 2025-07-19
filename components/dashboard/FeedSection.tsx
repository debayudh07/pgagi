'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Settings } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchFeedContent } from '../../store/slices/contentSlice';
import { ContentItem } from '../../types';

interface FeedSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const FeedSection: React.FC<FeedSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { feed, loading } = useAppSelector(state => state.content);
  const { preferences } = useAppSelector(state => state.user);

  useEffect(() => {
    // Fetch personalized content based on user preferences
    dispatch(fetchFeedContent({ 
      categories: preferences.categories,
      page: 1 
    }));
  }, [dispatch, preferences.categories]);

  const handleRefresh = () => {
    dispatch(fetchFeedContent({ 
      categories: preferences.categories,
      page: 1 
    }));
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 rounded-lg">
            <RefreshCw className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ textShadow: '2px 2px 0px #ff6600' }}>
              🚀 YOUR FEED
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              {feed.length} epic {feed.length === 1 ? 'story' : 'stories'} curated for you ⚡
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.isLoading}
            className="gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className={`h-4 w-4 ${loading.isLoading ? 'animate-spin' : ''}`} />
            🔄 REFRESH
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Preferences */}
      <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-orange-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl font-black text-white flex items-center gap-2">
            ⚙️ POWER SETTINGS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.categories.map((category) => (
              <Badge 
                key={category} 
                className="bg-blue-500/80 text-white border-blue-400 font-bold capitalize transform hover:scale-105 transition-all duration-300"
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${preferences.feedSettings.newsEnabled ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500 bg-red-500/20 text-red-400'}`}>
              <span className="text-base">📰</span>
              <span className="font-bold">News {preferences.feedSettings.newsEnabled ? '✓' : '✗'}</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${preferences.feedSettings.moviesEnabled ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500 bg-red-500/20 text-red-400'}`}>
              <span className="text-base">🎬</span>
              <span className="font-bold">Movies {preferences.feedSettings.moviesEnabled ? '✓' : '✗'}</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${preferences.feedSettings.musicEnabled ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500 bg-red-500/20 text-red-400'}`}>
              <span className="text-base">🎵</span>
              <span className="font-bold">Music {preferences.feedSettings.musicEnabled ? '✓' : '✗'}</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${preferences.feedSettings.socialEnabled ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500 bg-red-500/20 text-red-400'}`}>
              <span className="text-base">📱</span>
              <span className="font-bold">Social {preferences.feedSettings.socialEnabled ? '✓' : '✗'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading.isLoading && feed.length === 0 && (
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-blue-500 shadow-lg shadow-blue-500/20">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className="text-xl font-black text-white mb-2">⚡ LOADING FEED</h3>
              <p className="text-blue-400 font-bold">Assembling your epic content...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {loading.error && (
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-red-500 shadow-lg shadow-red-500/20">
          <CardContent className="p-6 md:p-8">
            <div className="text-center">
              <span className="text-4xl mb-4 block">💥</span>
              <h3 className="font-black text-xl text-red-400 mb-2">SYSTEM ERROR!</h3>
              <p className="text-white font-bold mb-4">{loading.error}</p>
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

      {/* Content Grid with Drag & Drop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/40 backdrop-blur-md border border-orange-500/30 rounded-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <span className="text-2xl md:text-3xl">⚡</span>
          <h3 className="text-lg md:text-xl font-black text-white">YOUR EPIC FEED</h3>
          <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold">{feed.length}</Badge>
        </div>
        <ContentGrid
          items={feed}
          onAction={handleContentAction}
          enableDragDrop={true}
          className="min-h-[400px]"
        />
      </motion.div>

      {/* Load More */}
      {feed.length > 0 && !loading.isLoading && (
        <div className="flex justify-center py-6">
          <Button 
            className="px-8 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-400 font-black transform hover:scale-105 transition-all duration-300"
          >
            ⚡ LOAD MORE POWER
          </Button>
        </div>
      )}
    </div>
  );
};
