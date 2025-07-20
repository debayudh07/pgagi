'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Share, RefreshCw } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { TwitterAuthButton } from '../auth/TwitterAuthButton';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchSocial, fetchTwitterPosts } from '../../store/slices/contentSlice';
import { TwitterService } from '../../services/api/twitterService';
import { useTheme } from '../../lib/useTheme';
import { ContentItem } from '../../types';

interface SocialSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const SocialSection: React.FC<SocialSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { social, loading } = useAppSelector(state => state.content);
  const theme = useTheme();
  const [twitterPosts, setTwitterPosts] = useState<ContentItem[]>([]);
  const [twitterLoading, setTwitterLoading] = useState(false);
  const [showTwitterAuth, setShowTwitterAuth] = useState(true);

  useEffect(() => {
    // Initialize Twitter service
    TwitterService.initializeAuth();
    setShowTwitterAuth(!TwitterService.isAuthenticated());
    
    // Load Twitter posts if authenticated
    if (TwitterService.isAuthenticated()) {
      loadTwitterPosts();
    }

    // Load regular social posts
    if (social.length === 0) {
      dispatch(fetchSocial({}));
    }
  }, [dispatch, social.length]);

  const loadTwitterPosts = async () => {
    setTwitterLoading(true);
    try {
      await dispatch(fetchTwitterPosts({ maxResults: 10 }));
      console.log('🐦 Dispatched fetchTwitterPosts action');
    } catch (error) {
      console.error('Error loading Twitter posts:', error);
    } finally {
      setTwitterLoading(false);
    }
  };

  const handleTwitterAuthSuccess = () => {
    setShowTwitterAuth(false);
    loadTwitterPosts();
  };

  const handleTwitterAuthError = (error: string) => {
    console.error('Twitter auth error:', error);
    // You could show a toast notification here
  };

  const handleRefresh = () => {
    dispatch(fetchSocial({}));
    if (TwitterService.isAuthenticated()) {
      loadTwitterPosts();
    }
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Social action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  // Combine Twitter posts with regular social posts
  const allSocialPosts = [...twitterPosts, ...social];
  const isLoadingAny = loading.isLoading || twitterLoading;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-purple-500/20 backdrop-blur-sm border-2 border-purple-500 rounded-lg">
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-black transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '2px 2px 0px #ff6600' }}>
              📱 SOCIAL BUZZ
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              {allSocialPosts.length} viral {allSocialPosts.length === 1 ? 'post' : 'posts'} and interactions 💬
              {twitterPosts.length > 0 && (
                <span className="text-blue-400 ml-2">
                  (🐦 {twitterPosts.length} from Twitter)
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoadingAny}
          className="gap-2 border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingAny ? 'animate-spin' : ''}`} />
          🔄 REFRESH
        </Button>
      </div>

      {/* Twitter Authentication */}
      {showTwitterAuth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TwitterAuthButton
            onAuthSuccess={handleTwitterAuthSuccess}
            onAuthError={handleTwitterAuthError}
          />
        </motion.div>
      )}

      {/* Loading State */}
      {isLoadingAny && allSocialPosts.length === 0 && (
        <Card className={`backdrop-blur-xl border-2 shadow-lg ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/80 border-purple-500 shadow-purple-500/20'
            : 'bg-white/90 border-purple-600 shadow-purple-600/20'
        }`}>
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className={`text-xl font-black mb-2 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>🌐 SCANNING SOCIALS</h3>
              <p className="text-purple-400 font-bold">Gathering the latest viral content...</p>
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
              <h3 className="font-black text-xl text-red-400 mb-2">CONNECTION LOST!</h3>
              <p className={`font-bold mb-4 transition-colors duration-300 ${
                theme.isDark ? 'text-white' : 'text-gray-900'
              }`}>{loading.error}</p>
              <Button 
                onClick={handleRefresh} 
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🔄 RECONNECT
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
          <span className="text-2xl md:text-3xl">📱</span>
          <h3 className={`text-lg md:text-xl font-black transition-colors duration-300 ${
            theme.isDark ? 'text-white' : 'text-gray-900'
          }`}>SOCIAL FEED</h3>
          <Badge className="bg-purple-500/80 text-white border-purple-400 font-bold">{allSocialPosts.length}</Badge>
          {twitterPosts.length > 0 && (
            <Badge className="bg-blue-500/80 text-white border-blue-400 font-bold">🐦 {twitterPosts.length}</Badge>
          )}
        </div>
        <ContentGrid
          items={allSocialPosts}
          onAction={handleContentAction}
          enableDragDrop={false}
          className="min-h-[400px]"
        />
      </motion.div>

      {/* Social Engagement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">
              <Heart className="h-6 w-6 mx-auto text-red-500" />
            </div>
            <p className="font-black text-lg text-red-400">Likes</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>12.5K</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">
              <MessageCircle className="h-6 w-6 mx-auto text-blue-500" />
            </div>
            <p className="font-black text-lg text-blue-400">Comments</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>3.2K</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">
              <Share className="h-6 w-6 mx-auto text-green-500" />
            </div>
            <p className="font-black text-lg text-green-400">Shares</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>1.8K</p>
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur-xl border-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 ${
          theme.isDark
            ? 'bg-black/80 border-orange-500'
            : 'bg-white/90 border-orange-600'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">
              <Users className="h-6 w-6 mx-auto text-purple-500" />
            </div>
            <p className="font-black text-lg text-purple-400">Followers</p>
            <p className={`text-xs font-bold transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-700'
            }`}>89.2K</p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics */}
      <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
        theme.isDark
          ? 'bg-black/60 border-orange-500/30'
          : 'bg-white/60 border-orange-400/50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🔥</span>
            <h4 className={`font-black transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`}>TRENDING TOPICS</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['#TechTrends', '#AIRevolution', '#WebDev', '#SocialMedia', '#Innovation', '#FutureTech'].map((tag, index) => (
              <Badge
                key={index}
                className="bg-purple-500/20 text-purple-300 border-purple-400 hover:bg-purple-500/40 cursor-pointer font-bold transition-all duration-300 transform hover:scale-105"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Pulse */}
      <Card className={`backdrop-blur-md border ${theme.transitionColors} ${
        theme.isDark
          ? 'bg-black/60 border-orange-500/30'
          : 'bg-white/60 border-orange-400/50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
              <div className="absolute inset-0 w-4 h-4 bg-purple-500 rounded-full"></div>
            </div>
            <span className="text-sm font-bold text-purple-400">
              🌐 Social networks active - {allSocialPosts.length} posts synchronized
              {TwitterService.isAuthenticated() && (
                <span className="text-blue-400 ml-2">
                  | 🐦 Twitter connected
                </span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
