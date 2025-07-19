/*eslint-disable*/
'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTrendingContent } from '../../store/slices/contentSlice';
import { ContentItem } from '../../types';

interface TrendingSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { trending, loading } = useAppSelector(state => state.content);

  useEffect(() => {
    dispatch(fetchTrendingContent());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTrendingContent());
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Trending action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-orange-500/20 backdrop-blur-sm border-2 border-orange-500 rounded-lg">
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ textShadow: '2px 2px 0px #ff6600' }}>
              🔥 TRENDING NOW
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              {trending.length} viral {trending.length === 1 ? 'phenomenon' : 'phenomena'} breaking the internet! 💥
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading.isLoading}
          className="gap-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 ${loading.isLoading ? 'animate-spin' : ''}`} />
          🔄 REFRESH
        </Button>
      </div>

      {/* Trending Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">📰</span>
              <div>
                <p className="font-black text-lg md:text-xl text-blue-400">
                  {trending.filter(item => item.type === 'news').length}
                </p>
                <p className="text-xs md:text-sm text-white font-bold">Breaking News</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">🎬</span>
              <div>
                <p className="font-black text-lg md:text-xl text-purple-400">
                  {trending.filter(item => item.type === 'movie').length}
                </p>
                <p className="text-xs md:text-sm text-white font-bold">Hot Movies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">🎵</span>
              <div>
                <p className="font-black text-lg md:text-xl text-green-400">
                  {trending.filter(item => item.type === 'music').length}
                </p>
                <p className="text-xs md:text-sm text-white font-bold">Viral Beats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">📱</span>
              <div>
                <p className="font-black text-lg md:text-xl text-red-400">
                  {trending.filter(item => item.type === 'social').length}
                </p>
                <p className="text-xs md:text-sm text-white font-bold">Viral Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading.isLoading && trending.length === 0 && (
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-orange-500/20">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className="text-xl font-black text-white mb-2">🔥 SCANNING TRENDS</h3>
              <p className="text-orange-400 font-bold">Detecting viral phenomena...</p>
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
              <h3 className="font-black text-xl text-red-400 mb-2">TRENDING MALFUNCTION!</h3>
              <p className="text-white font-bold mb-4">{loading.error}</p>
              <Button 
                onClick={handleRefresh} 
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🔄 RESTART SCAN
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
        className="bg-black/40 backdrop-blur-md border border-orange-500/30 rounded-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <span className="text-2xl md:text-3xl">🔥</span>
          <h3 className="text-lg md:text-xl font-black text-white">VIRAL CONTENT</h3>
          <Badge className="bg-red-500/80 text-white border-red-400 font-bold">{trending.length}</Badge>
        </div>
        <ContentGrid
          items={trending}
          onAction={handleContentAction}
          enableDragDrop={false}
          className="min-h-[400px]"
        />
      </motion.div>

      {/* Update Frequency Info */}
      <Card className="bg-black/60 backdrop-blur-md border border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-400">
                ⚡ Live trending updates every 15 minutes
              </span>
            </div>
            <span className="text-xs text-orange-400 font-bold">
              Last scan: {new Date().toLocaleTimeString()} 🕐
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
