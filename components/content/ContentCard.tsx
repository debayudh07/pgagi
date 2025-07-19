'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Clock, User, Eye } from 'lucide-react';
import { ContentItem, NewsArticle, Movie, MusicTrack, SocialPost } from '../../types';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDate, truncateText } from '../../lib/utils';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToFavorites, removeFromFavorites } from '../../store/slices/contentSlice';
import { useTheme } from '../../lib/useTheme';

interface ContentCardProps {
  item: ContentItem;
  onAction?: (action: string, item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onAction }) => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.content.favorites);
  const theme = useTheme();
  const isFavorite = favorites.some(fav => fav.id === item.id);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(item.id));
    } else {
      dispatch(addToFavorites(item.id));
    }
  };

  const handleAction = (action: string) => {
    onAction?.(action, item);
  };

  const getTypeColor = (type: ContentItem['type']) => {
    switch (type) {
      case 'news':
        return 'bg-blue-500/80 border-blue-400 shadow-blue-500/30';
      case 'movie':
        return 'bg-purple-500/80 border-purple-400 shadow-purple-500/30';
      case 'music':
        return 'bg-green-500/80 border-green-400 shadow-green-500/30';
      case 'social':
        return 'bg-orange-500/80 border-orange-400 shadow-orange-500/30';
      default:
        return 'bg-gray-500/80 border-gray-400 shadow-gray-500/30';
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'news':
        return '📰';
      case 'movie':
        return '🎬';
      case 'music':
        return '🎵';
      case 'social':
        return '📱';
      default:
        return '📄';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col overflow-hidden backdrop-blur-xl border-2 shadow-lg ${theme.transition} ${
        theme.isDark
          ? 'bg-black/80 border-orange-500 shadow-orange-500/20 hover:shadow-orange-500/40'
          : 'bg-white/90 border-orange-600 shadow-orange-600/20 hover:shadow-orange-600/40'
      }`}>
        {/* Image Section */}
        {item.image && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+on//Z"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/500x750/1a1a1a/ff6600?text=No+Image';
              }}
            />
            {/* Comic-style overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
            
            <div className="absolute top-2 left-2">
              <Badge className={`${getTypeColor(item.type)} text-white font-black border-2 transform hover:scale-105 transition-all duration-300`}>
                {getTypeIcon(item.type)} {item.type.toUpperCase()}
              </Badge>
            </div>
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                className={`bg-black/80 backdrop-blur-sm border-2 hover:bg-red-500 transition-all duration-300 transform hover:scale-110 ${
                  isFavorite ? 'text-red-500 border-red-500 bg-red-500/20' : 'text-white border-orange-500 hover:border-red-500'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                />
              </Button>
            </div>
            
            {/* Comic effect overlay */}
            <div className="absolute bottom-2 right-2">
              <div className="text-xs font-black text-white bg-black/60 px-2 py-1 rounded border border-orange-500/50">
                💥 {item.type.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <CardContent className={`flex-1 p-4 backdrop-blur-sm ${theme.transitionColors} ${
          theme.isDark ? 'bg-black/40' : 'bg-white/60'
        }`}>
          <div className="space-y-2">
            <h3 className={`font-black text-lg leading-tight line-clamp-2 transition-colors duration-300 ${
              theme.isDark ? 'text-white' : 'text-gray-900'
            }`} style={{ textShadow: '1px 1px 0px #ff6600' }}>
              {item.title}
            </h3>
            
            {item.description && (
              <p className={`text-sm line-clamp-3 font-medium transition-colors duration-300 ${
                theme.isDark ? 'text-orange-200' : 'text-gray-600'
              }`}>
                {truncateText(item.description, 120)}
              </p>
            )}

            {/* Type-specific content */}
            {item.type === 'news' && (
              <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
                <User className="h-3 w-3" />
                <span>📰 {(item as NewsArticle).source}</span>
                {item.publishedAt && (
                  <>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>🕐 {formatDate(item.publishedAt)}</span>
                  </>
                )}
              </div>
            )}

            {item.type === 'movie' && (
              <div className="flex items-center gap-2 text-xs text-purple-400 font-bold">
                <span>⭐ {((item as Movie).rating || 0).toFixed(1)} STARS</span>
                {(item as Movie).releaseDate && (
                  <span>• 🎬 {formatDate((item as Movie).releaseDate!)}</span>
                )}
              </div>
            )}

            {item.type === 'music' && (
              <div className="flex items-center gap-2 text-xs text-green-400 font-bold">
                <User className="h-3 w-3" />
                <span>🎤 {(item as MusicTrack).artist}</span>
                {(item as MusicTrack).album && (
                  <span>• 💿 {(item as MusicTrack).album}</span>
                )}
              </div>
            )}

            {item.type === 'social' && (
              <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
                <span>📱 @{(item as SocialPost).username}</span>
                <Badge variant="outline" className="ml-auto bg-orange-500/20 border-orange-400 text-orange-300 font-bold">
                  {(item as SocialPost).platform}
                </Badge>
              </div>
            )}

            {/* Social engagement metrics */}
            {item.type === 'social' && (
              <div className="flex items-center gap-4 text-xs text-red-400 font-bold">
                {(item as SocialPost).likes && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-current" />
                    {(item as SocialPost).likes} LIKES
                  </span>
                )}
                {(item as SocialPost).comments && (
                  <span className="flex items-center gap-1">
                    💬 {(item as SocialPost).comments} COMMENTS
                  </span>
                )}
              </div>
            )}

            {/* Hashtags for social posts */}
            {item.type === 'social' && (item as SocialPost).hashtags && (
              <div className="flex flex-wrap gap-1">
                {(item as SocialPost).hashtags!.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} className="text-xs bg-blue-500/80 text-white border-blue-400 font-bold">
                    #{tag}
                  </Badge>
                ))}
                {(item as SocialPost).hashtags!.length > 3 && (
                  <Badge className="text-xs bg-orange-500/80 border-orange-400 text-white font-bold">
                    +{(item as SocialPost).hashtags!.length - 3} MORE
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        {/* Action Buttons */}
        <CardFooter className={`p-4 pt-0 backdrop-blur-sm border-t ${theme.transitionColors} ${
          theme.isDark
            ? 'bg-black/60 border-orange-500/30'
            : 'bg-white/80 border-orange-400/50'
        }`}>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('view')}
              className="flex-1 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold transition-all duration-300 transform hover:scale-105"
            >
              <Eye className="h-4 w-4 mr-2" />
              👁️ VIEW
            </Button>
            {item.url && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(item.url, '_blank')}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-400 font-bold transition-all duration-300 transform hover:scale-105"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                🚀 OPEN
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
