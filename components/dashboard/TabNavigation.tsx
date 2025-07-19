'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Newspaper, Film, Music, Users, Heart, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setActiveTab } from '../../store/slices/contentSlice';

interface TabNavigationProps {
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const { activeTab, favorites, news, movies, music, social, trending } = useAppSelector(state => state.content);

  const tabs = [
    {
      id: 'feed' as const,
      label: 'My Feed',
      icon: Home,
      count: 0, // Will be calculated from combined content
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500',
      emoji: '🏠'
    },
    {
      id: 'news' as const,
      label: 'News',
      icon: Newspaper,
      count: news.length,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500',
      emoji: '📰'
    },
    {
      id: 'movies' as const,
      label: 'Movies',
      icon: Film,
      count: movies.length,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 border-purple-500',
      emoji: '🎬'
    },
    {
      id: 'music' as const,
      label: 'Beats',
      icon: Music,
      count: music.length,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500',
      emoji: '🎵'
    },
    {
      id: 'social' as const,
      label: 'Posts',
      icon: Users,
      count: social.length,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500',
      emoji: '📱'
    },
    {
      id: 'trending' as const,
      label: 'Trending',
      icon: TrendingUp,
      count: trending.length,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500',
      emoji: '🔥'
    },
    {
      id: 'favorites' as const,
      label: 'Favorites',
      icon: Heart,
      count: favorites.length,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20 border-pink-500',
      emoji: '💖'
    }
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    dispatch(setActiveTab(tabId));
  };

  return (
    <div className={`bg-black/80 backdrop-blur-xl border-2 border-orange-500 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎮</span>
        <h2 className="text-xl font-black text-white">CONTENT NAVIGATOR</h2>
      </div>

      {/* Tab Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.div
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isActive ? 'default' : 'outline'}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  w-full h-20 p-3 flex flex-col items-center gap-1 border-2 font-bold transition-all duration-300
                  ${isActive 
                    ? `${tab.bgColor} ${tab.color} shadow-lg` 
                    : 'border-orange-500/50 text-white hover:bg-orange-500/20 hover:border-orange-500'
                  }
                `}
              >
                <div className="flex items-center gap-1">
                  <span className="text-lg">{tab.emoji}</span>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="text-center">
                  <div className="text-xs font-black truncate">{tab.label}</div>
                  {tab.count > 0 && (
                    <Badge 
                      className={`text-xs px-1 py-0 h-4 min-w-4 ${
                        isActive ? 'bg-white text-black' : `${tab.bgColor} ${tab.color} border-none`
                      }`}
                    >
                      {tab.count > 99 ? '99+' : tab.count}
                    </Badge>
                  )}
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Active Tab Indicator */}
      <div className="mt-4 p-3 bg-black/40 rounded-lg border border-orange-500/30">
        <div className="flex items-center justify-center gap-2">
          <span className="text-orange-400 text-sm font-bold">ACTIVE:</span>
          <div className="flex items-center gap-1">
            <span>{tabs.find(tab => tab.id === activeTab)?.emoji}</span>
            <span className="text-white font-black text-sm">
              {tabs.find(tab => tab.id === activeTab)?.label.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
