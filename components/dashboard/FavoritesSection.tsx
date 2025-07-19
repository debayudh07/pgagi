'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { ContentGrid } from '../content/ContentGrid';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { removeFromFavorites } from '../../store/slices/contentSlice';
import { ContentItem } from '../../types';

interface FavoritesSectionProps {
  onContentAction?: (action: string, item: ContentItem) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onContentAction }) => {
  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector(state => state.content);

  const handleRemoveFromFavorites = (itemId: string) => {
    dispatch(removeFromFavorites(itemId));
  };

  const handleContentAction = (action: string, item: ContentItem) => {
    console.log(`Favorites action: ${action} on item:`, item);
    onContentAction?.(action, item);
  };

  const groupedFavorites = {
    news: favorites.filter(item => item.type === 'news'),
    movies: favorites.filter(item => item.type === 'movie'),
    music: favorites.filter(item => item.type === 'music'),
    social: favorites.filter(item => item.type === 'social'),
  };

  if (favorites.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-lg">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ textShadow: '2px 2px 0px #ff6600' }}>
              💖 YOUR FAVORITES
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              Content you've saved for your collection
            </p>
          </div>
        </div>

        <Card className="bg-black/80 backdrop-blur-xl border-4 border-orange-500 shadow-2xl shadow-orange-500/20">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <Heart className="h-16 w-16 md:h-20 md:w-20 text-orange-500 mx-auto mb-6 animate-pulse" />
              <h3 className="text-xl md:text-2xl font-black text-white mb-4" style={{ textShadow: '1px 1px 0px #ff6600' }}>
                NO FAVORITES YET!
              </h3>
              <p className="text-white mb-6 text-sm md:text-base">
                Start building your ultimate collection by clicking the 💖 on any content!
              </p>
              <Button variant="outline" className="gap-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black font-bold transition-all duration-300 transform hover:scale-105">
                <ExternalLink className="h-4 w-4" />
                🚀 EXPLORE CONTENT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-lg">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ textShadow: '2px 2px 0px #ff6600' }}>
              💖 YOUR FAVORITES
            </h1>
            <p className="text-orange-500 font-bold mt-1">
              {favorites.length} saved {favorites.length === 1 ? 'treasure' : 'treasures'} ⭐
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              // Clear all favorites with confirmation
              if (confirm('💥 Are you sure you want to clear your entire collection?')) {
                favorites.forEach(item => dispatch(removeFromFavorites(item.id)));
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            💥 CLEAR ALL
          </Button>
        </div>
      </div>

      {/* Favorites Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">📰</span>
              <div>
                <p className="font-black text-lg md:text-xl text-blue-400">{groupedFavorites.news.length}</p>
                <p className="text-xs md:text-sm text-white font-bold">News Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">🎬</span>
              <div>
                <p className="font-black text-lg md:text-xl text-purple-400">{groupedFavorites.movies.length}</p>
                <p className="text-xs md:text-sm text-white font-bold">Movies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">🎵</span>
              <div>
                <p className="font-black text-lg md:text-xl text-green-400">{groupedFavorites.music.length}</p>
                <p className="text-xs md:text-sm text-white font-bold">Music Tracks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/80 backdrop-blur-xl border-2 border-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">📱</span>
              <div>
                <p className="font-black text-lg md:text-xl text-orange-400">{groupedFavorites.social.length}</p>
                <p className="text-xs md:text-sm text-white font-bold">Social Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Favorites Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/40 backdrop-blur-md border border-orange-500/30 rounded-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <span className="text-2xl md:text-3xl">⭐</span>
          <h3 className="text-lg md:text-xl font-black text-white">ALL YOUR TREASURES</h3>
          <Badge className="bg-orange-500/80 text-white border-orange-400 font-bold">{favorites.length}</Badge>
        </div>
        <ContentGrid
          items={favorites}
          onAction={handleContentAction}
          enableDragDrop={false}
        />
      </motion.div>

      {/* Grouped Sections */}
      {Object.entries(groupedFavorites).map(([type, items]) => {
        if (items.length === 0) return null;

        const typeConfig = {
          news: { label: 'HERO NEWS ARCHIVE', icon: '📰', color: 'text-blue-400', bgColor: 'shadow-blue-500/20 hover:shadow-blue-500/40' },
          movies: { label: 'CINEMA VAULT', icon: '🎬', color: 'text-purple-400', bgColor: 'shadow-purple-500/20 hover:shadow-purple-500/40' },
          music: { label: 'SOUNDTRACK COLLECTION', icon: '🎵', color: 'text-green-400', bgColor: 'shadow-green-500/20 hover:shadow-green-500/40' },
          social: { label: 'SOCIAL NETWORK', icon: '📱', color: 'text-orange-400', bgColor: 'shadow-orange-500/20 hover:shadow-orange-500/40' },
        }[type] || { label: type.toUpperCase(), icon: '📄', color: 'text-gray-400', bgColor: 'shadow-gray-500/20 hover:shadow-gray-500/40' };

        return (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-black/40 backdrop-blur-md border border-orange-500/30 rounded-lg p-4 md:p-6"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <span className="text-2xl md:text-3xl">{typeConfig.icon}</span>
              <h2 className={`text-lg md:text-xl font-black text-white ${typeConfig.color}`}>
                {typeConfig.label}
              </h2>
              <Badge className={`bg-${typeConfig.color.split('-')[1]}-500/80 text-white border-${typeConfig.color.split('-')[1]}-400 font-bold`}>
                {items.length}
              </Badge>
            </div>
            <ContentGrid
              items={items}
              onAction={handleContentAction}
              enableDragDrop={false}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
