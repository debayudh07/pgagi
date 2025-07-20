/*eslint-disable*/
'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Share, RefreshCw } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchSocial } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';
import { ContentItem } from '../../types';

interface SocialSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const SocialSection: React.FC<SocialSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { social, loading } = useAppSelector(state => state.content);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchSocial({}));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSocial({}));
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Social action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  const stats = {
    totalPosts: social.length,
    engagement: social.reduce((sum, post) => {
      if (post.type === 'social') {
        const socialPost = post as any;
        return sum + (socialPost.likes || 0) + (socialPost.comments || 0);
      }
      return sum;
    }, 0),
    platforms: Array.from(new Set(social.filter(post => post.type === 'social').map(post => (post as any).platform))).length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-pink-500/20 backdrop-blur-sm border-2 border-pink-500 rounded-lg">
            <Users className="h-8 w-8 text-pink-500" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ec4899' }}>
              🌐 SOCIAL FEED
            </h1>
            <p className="text-pink-500 font-bold mt-1">
              {social.length} social {social.length === 1 ? 'post' : 'posts'} from across platforms
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading.isLoading}
          className="gap-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 ${loading.isLoading ? 'animate-spin' : ''}`} />
          🔄 REFRESH
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className={`backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-pink-500 shadow-pink-500/20'
            : 'bg-white/90 border-pink-600 shadow-pink-600/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📱</span>
              <div>
                <p className="font-black text-2xl text-pink-400">{stats.totalPosts}</p>
                <p className={`text-sm font-bold transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-700'
                }`}>Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-pink-500 shadow-pink-500/20'
            : 'bg-white/90 border-pink-600 shadow-pink-600/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❤️</span>
              <div>
                <p className="font-black text-2xl text-pink-400">{stats.engagement.toLocaleString()}</p>
                <p className={`text-sm font-bold transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-700'
                }`}>Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg transition-colors duration-300 ${
          theme.isDark
            ? 'bg-black/80 border-pink-500 shadow-pink-500/20'
            : 'bg-white/90 border-pink-600 shadow-pink-600/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌐</span>
              <div>
                <p className="font-black text-2xl text-pink-400">{stats.platforms}</p>
                <p className={`text-sm font-bold transition-colors duration-300 ${
                  theme.isDark ? 'text-white' : 'text-gray-700'
                }`}>Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`backdrop-blur-md border-2 rounded-xl p-4 md:p-6 transition-colors duration-300 ${
          theme.isDark
            ? 'bg-black/40 border-pink-500/30'
            : 'bg-white/40 border-pink-400/50'
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🌐</span>
          <h3 className={`text-xl font-black transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>
            SOCIAL POSTS
          </h3>
          <Badge className="bg-pink-500/80 text-white border-pink-400 font-bold">
            {social.length}
          </Badge>
        </div>
        
        {social.length === 0 && !loading.isLoading ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📱</span>
            <h3 className={`font-black text-2xl mb-3 transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>
              NO SOCIAL CONTENT YET
            </h3>
            <p className="text-pink-400 font-bold mb-6">
              Social content will be displayed here when available.
            </p>
          </div>
        ) : (
          <ContentGrid
            items={social}
            onAction={handleContentAction}
            enableDragDrop={false}
            className="min-h-[400px]"
          />
        )}
      </motion.div>

      {/* Update Frequency Info */}
      <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
        theme.isDark
          ? 'bg-black/60 border-pink-500/30'
          : 'bg-white/60 border-pink-400/50'
      }`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-400">
                ⚡ Live social updates every 30 minutes
              </span>
            </div>
            <span className="text-xs text-pink-400 font-bold">
              Last scan: {new Date().toLocaleTimeString()} 🕐
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
